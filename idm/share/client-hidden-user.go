/*
 * Copyright (c) 2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package share

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	permissions2 "github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// GetOrCreateHiddenUser will load or create a user to create a ShareLink with.
func (sc *Client) GetOrCreateHiddenUser(ctx context.Context, ownerUser *idm.User, link *rest.ShareLink, passwordEnabled bool, updatePassword string, passwordHashed bool) (user *idm.User, err error) {

	// Create or Load corresponding Hidden User
	uClient := idmc.UserServiceClient(ctx)
	roleClient := idmc.RoleServiceClient(ctx)
	if link.UserLogin == "" {
		newUuid := uuid.New()
		login := strings.Replace(newUuid, "-", "", -1)[0:16]
		password := login + PasswordComplexitySuffix
		if passwordEnabled {
			if len(updatePassword) == 0 {
				return nil, serviceerrors.BadRequest(common.ServiceShare, "Please provide a non empty password!")
			}
			password = updatePassword
		}
		if len(link.Policies) == 0 {
			// Apply default policies and make sure user can read himself
			link.Policies = sc.OwnerResourcePolicies(ctx, ownerUser, newUuid)
			link.Policies = append(link.Policies, &service.ResourcePolicy{
				Resource: newUuid,
				Subject:  fmt.Sprintf("user:%s", login),
				Action:   service.ResourcePolicyAction_READ,
				Effect:   service.ResourcePolicy_allow,
			})
		}
		hiddenUser := &idm.User{
			Uuid:      newUuid,
			Login:     login,
			Password:  password,
			GroupPath: ownerUser.GroupPath,
			Policies:  link.Policies,
			Attributes: map[string]string{
				idm.UserAttrProfile: "shared",
				idm.UserAttrHidden:  "true",
			},
		}
		if passwordHashed {
			hiddenUser.Attributes[idm.UserAttrPassHashed] = "true"
		}
		resp, e := uClient.CreateUser(ctx, &idm.CreateUserRequest{User: hiddenUser})
		if e != nil {
			return nil, e
		}
		user = resp.User
		// Create associated role
		_, e = roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
			Uuid:     user.Uuid,
			Label:    user.Login,
			UserRole: true,
			Policies: link.Policies,
		}})
		if e != nil {
			return nil, e
		}

	} else {

		uQ, _ := anypb.New(&idm.UserSingleQuery{Login: link.UserLogin})
		stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{uQ}}})
		if e != nil {
			return nil, e
		}
		defer stream.CloseSend()
		for {
			rsp, e := stream.Recv()
			if e != nil {
				break
			}
			user = rsp.User
			break
		}

	}

	return
}

// UpdateACLsForHiddenUser deletes and replaces access ACLs for a hidden user.
func (sc *Client) UpdateACLsForHiddenUser(ctx context.Context, roleId string, workspaceId string, rootNodes []*tree.Node, permissions []rest.ShareLinkAccessType, parentPolicy string, update bool) error {

	HasRead := false
	HasWrite := false
	for _, perm := range permissions {
		if perm == rest.ShareLinkAccessType_Download || perm == rest.ShareLinkAccessType_Preview {
			HasRead = true
		}
		if perm == rest.ShareLinkAccessType_Upload {
			HasWrite = true
		}
	}

	aclClient := idmc.ACLServiceClient(ctx) //idm.NewACLServiceClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceAcl))
	if update {
		// Delete existing acls for existing user
		q, _ := anypb.New(&idm.ACLSingleQuery{RoleIDs: []string{roleId}})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
		if e != nil {
			return e
		}
	}

	if !HasRead && !HasWrite {
		return nil
	}

	acls, err := sc.GetTemplateACLsForMinisite(ctx, roleId, permissions, aclClient)
	if err != nil {
		return err
	}
	for _, rootNode := range rootNodes {
		if parentPolicy != "" {
			newPol, e := sc.InheritPolicies(ctx, parentPolicy, HasRead, HasWrite)
			if e != nil {
				return e
			}
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				WorkspaceID: workspaceId,
				NodeID:      rootNode.Uuid,
				Action: &idm.ACLAction{
					Name:  permissions2.AclPolicy.Name,
					Value: newPol,
				},
			})
		} else {
			if HasRead {
				acls = append(acls, &idm.ACL{
					RoleID:      roleId,
					WorkspaceID: workspaceId,
					NodeID:      rootNode.Uuid,
					Action:      permissions2.AclRead,
				})
			}
			if HasWrite {
				acls = append(acls, &idm.ACL{
					RoleID:      roleId,
					WorkspaceID: workspaceId,
					NodeID:      rootNode.Uuid,
					Action:      permissions2.AclWrite,
				})
			}
		}
	}
	// Add default Repository Id for the role
	acls = append(acls, &idm.ACL{
		RoleID:      roleId,
		WorkspaceID: permissions2.FrontWsScopeAll,
		Action: &idm.ACLAction{
			Name:  "parameter:core.conf:DEFAULT_START_REPOSITORY",
			Value: workspaceId,
		},
	})

	for _, acl := range acls {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if e != nil {
			return e
		}
	}

	return nil
}

// DeleteHiddenUser removes hidden user associated with this link
func (sc *Client) DeleteHiddenUser(ctx context.Context, link *rest.ShareLink) error {
	if link.UserLogin == "" {
		return nil
	}
	uClient := idmc.UserServiceClient(ctx)
	q1, _ := anypb.New(&idm.UserSingleQuery{Login: link.UserLogin})
	q2, _ := anypb.New(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeValue: "true"})
	_, e := uClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{
		SubQueries: []*anypb.Any{q1, q2},
		Operation:  service.OperationType_AND,
	}})
	return e
}

// ClearLostHiddenUsers makes sure that hidden users that are not linked to any existing link
// are removed. This is used during a migration to fix the missing users deletion prior to v2.0.0
func (sc *Client) ClearLostHiddenUsers(ctx context.Context) error {

	log.Logger(ctx).Info("Migration: looking for hidden users unlinked from any public link")

	// List hidden users and check for their associated links
	uClient := idmc.UserServiceClient(ctx)
	q, _ := anypb.New(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeValue: "true"})
	stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return e
	}
	defer stream.CloseSend()
	for {
		resp, er := stream.Recv()
		if er != nil {
			break
		}
		if doc, er := sc.SearchHashDocumentForUser(ctx, resp.User.Login); er == nil && doc != nil {
			log.Logger(ctx).Debug("Found Link for user", resp.User.ZapLogin(), zap.Any("doc", doc))
		} else if er == nil && doc == nil {
			deleteQ, _ := anypb.New(&idm.UserSingleQuery{Uuid: resp.User.Uuid})
			if _, e := uClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{deleteQ}}}); e != nil {
				log.Logger(ctx).Error("Error while trying to delete lost hidden user", resp.User.ZapLogin(), zap.Error(e))
			} else {
				log.Logger(ctx).Info("Found and deleted hidden User without any link attached!", resp.User.ZapLogin())
			}
		} else if er != nil {
			log.Logger(ctx).Error("Cannot load docs for user", resp.User.ZapLogin(), zap.Error(er))
		}
	}
	return nil
}
