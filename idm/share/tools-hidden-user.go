package share

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	permissions2 "github.com/pydio/cells/common/utils/permissions"
)

// GetOrCreateHiddenUser will load or create a user to create a ShareLink with.
func GetOrCreateHiddenUser(ctx context.Context, ownerUser *idm.User, link *rest.ShareLink, passwordEnabled bool, updatePassword string, passwordHashed bool) (user *idm.User, err error) {

	// Create or Load corresponding Hidden User
	uClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
	roleClient := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	if link.UserLogin == "" {
		newUuid := uuid.New()
		login := strings.Replace(newUuid, "-", "", -1)[0:16]
		password := login + PasswordComplexitySuffix
		if passwordEnabled {
			if len(updatePassword) == 0 {
				return nil, errors.BadRequest(common.ServiceShare, "Please provide a non empty password!")
			}
			password = updatePassword
		}
		if len(link.Policies) == 0 {
			// Apply default policies and make sure user can read himself
			link.Policies = OwnerResourcePolicies(ctx, ownerUser, newUuid)
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

		uQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: link.UserLogin})
		stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*any.Any{uQ}}})
		if e != nil {
			return nil, e
		}
		defer stream.Close()
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
func UpdateACLsForHiddenUser(ctx context.Context, roleId string, workspaceId string, rootNodes []*tree.Node, permissions []rest.ShareLinkAccessType, parentPolicy string, update bool) error {

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

	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	if update {
		// Delete existing acls for existing user
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{roleId}})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
		if e != nil {
			return e
		}
	}

	if !HasRead && !HasWrite {
		return nil
	}

	acls, err := GetTemplateACLsForMinisite(ctx, roleId, permissions, aclClient)
	if err != nil {
		return err
	}
	for _, rootNode := range rootNodes {
		if parentPolicy != "" {
			newPol, e := InheritPolicies(ctx, parentPolicy, HasRead, HasWrite)
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
func DeleteHiddenUser(ctx context.Context, link *rest.ShareLink) error {
	if link.UserLogin == "" {
		return nil
	}
	uClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
	q1, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: link.UserLogin})
	q2, _ := ptypes.MarshalAny(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeValue: "true"})
	_, e := uClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{
		SubQueries: []*any.Any{q1, q2},
		Operation:  service.OperationType_AND,
	}})
	return e
}

// ClearLostHiddenUsers makes sure that hidden users that are not linked to any existing link
// are removed. This is used during a migration to fix the missing users deletion prior to v2.0.0
func ClearLostHiddenUsers(ctx context.Context) error {

	log.Logger(ctx).Info("Migration: looking for hidden users unlinked from any public link")

	// List hidden users and check for their associated links
	uClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeValue: "true"})
	stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
	if e != nil {
		return e
	}
	defer stream.Close()
	for {
		resp, er := stream.Recv()
		if er != nil {
			break
		}
		if doc, er := SearchHashDocumentForUser(ctx, resp.User.Login); er == nil && doc != nil {
			log.Logger(ctx).Debug("Found Link for user", resp.User.ZapLogin(), zap.Any("doc", doc))
		} else if er == nil && doc == nil {
			deleteQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: resp.User.Uuid})
			if _, e := uClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{SubQueries: []*any.Any{deleteQ}}}); e != nil {
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
