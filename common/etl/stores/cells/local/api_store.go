/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package local

import (
	"context"
	"fmt"
	"path"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/etl/stores"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/idm/share"
)

func init() {
	stores.RegisterStore("cells-local", func(options *stores.Options) (interface{}, error) {
		return NewAPIStore(options.Runtime), nil
	})
}

type syncShareLoadedUser struct {
	accessList *permissions.AccessList
	user       *idm.User
	ctx        context.Context
}

type ApiStore struct {
	// Cached data
	runtime     context.Context
	slugsCache  map[string]string
	router      nodes.Client
	loadedUsers map[string]*syncShareLoadedUser
}

func NewAPIStore(runtime context.Context) *ApiStore {
	return &ApiStore{
		runtime:     runtime,
		loadedUsers: make(map[string]*syncShareLoadedUser),
	}
}

// Writable user store
// sql, pydio, api

func (apiStore *ApiStore) CreateUser(ctx context.Context, identity *idm.User) (*idm.User, error) {
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))

	if identity.Attributes == nil {
		identity.Attributes = make(map[string]string)
	}
	if _, ok := identity.Attributes[idm.UserAttrProfile]; !ok {
		identity.Attributes[idm.UserAttrProfile] = common.PydioProfileStandard
	}

	log.Logger(ctx).Info("Now storing", identity.Zap())

	if resp, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: identity}); e == nil {

		builder := service.NewResourcePoliciesBuilder()
		builder = builder.WithOwner(resp.User.Uuid)
		builder = builder.WithProfileWrite(common.PydioProfileAdmin)
		builder = builder.WithUserRead(identity.Login)
		builder = builder.WithUserWrite(identity.Login)

		// Create role associated
		associatedRole := idm.Role{
			Uuid:     resp.User.GetUuid(),
			Label:    "User " + resp.User.GetLogin(),
			UserRole: true,
			Policies: builder.Policies(),
		}
		roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceRole))
		roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &associatedRole})

		return resp.User, nil
	} else {
		return nil, e
	}
}

// UpdateUser creates a user with the old identity
func (apiStore *ApiStore) UpdateUser(ctx context.Context, identity *idm.User) (*idm.User, error) {
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))
	if resp, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: identity}); e == nil {
		return resp.User, nil
	} else {
		return nil, e
	}
}

func (apiStore *ApiStore) DeleteUser(ctx context.Context, identity *idm.User) error {
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))
	singleQ, _ := anypb.New(&idm.UserSingleQuery{Uuid: identity.Uuid})
	q := &service.Query{SubQueries: []*anypb.Any{singleQ}}
	_, e := userClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: q})
	return e
}

// Readable user store

func (apiStore *ApiStore) GetUser(ctx context.Context, id string) (*idm.User, error) {

	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))

	singleQ, _ := anypb.New(&idm.UserSingleQuery{Uuid: id})
	q := &service.Query{
		SubQueries: []*anypb.Any{singleQ},
		Offset:     0,
		Limit:      1}
	streamer, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: q})
	if err != nil {
		return nil, err
	}
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		return resp.User, nil
	}
	return nil, serviceerrors.NotFound("user.not.found", "User "+id+" not found")
}

func (apiStore *ApiStore) ListUsers(ctx context.Context, params map[string]interface{}, progress chan float32) (map[string]*idm.User, error) {

	results := make(map[string]*idm.User)
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))

	offset := int64(0)
	limit := int64(100)

	var crt, total float32
	if progress != nil {
		rsp, e := userClient.CountUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{}}})
		if e != nil {
			return nil, e
		}
		total = float32(rsp.Count)
	}

	// List user with pagination
	for {
		q := &service.Query{
			SubQueries: []*anypb.Any{},
			Offset:     offset,
			Limit:      limit,
		}
		streamer, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: q})
		if err != nil {
			return nil, err
		}
		var i int64
		i = 0
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			i = i + 1
			user := resp.User
			var roles []*idm.Role
			for _, role := range user.Roles {
				roles = append(roles, role)
			}
			user.Roles = roles

			results[user.Login] = user
			crt++
			if progress != nil {
				progress <- crt / total
			}
		}
		if i < (limit - 1) {
			break
		} else {
			offset = offset + limit
		}
	}

	return results, nil
}

// Groups

func (apiStore *ApiStore) PutGroup(ctx context.Context, identity *idm.User) error {

	// Changing the group path to go around a small oddity of the grpc user service
	identity.GroupPath = strings.TrimSuffix(identity.GroupPath, "/") + "/" + identity.GroupLabel

	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))
	if resp, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: (*idm.User)(identity)}); e == nil {
		builder := service.NewResourcePoliciesBuilder()
		builder = builder.WithOwner(resp.User.Uuid)
		builder = builder.WithProfileWrite(common.PydioProfileAdmin)
		builder = builder.WithUserRead(identity.Login)
		builder = builder.WithUserWrite(identity.Login)

		// Create role associated
		associatedRole := idm.Role{
			Uuid:      resp.User.GetUuid(),
			Label:     "Group " + resp.User.GetUuid(),
			GroupRole: true,
			Policies:  builder.Policies(),
		}
		roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceRole))
		roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &associatedRole})

		return nil
	} else {
		return e
	}
}

func (apiStore *ApiStore) DeleteGroup(ctx context.Context, identity *idm.User) error {
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))
	singleQ, _ := anypb.New(&idm.UserSingleQuery{Uuid: identity.Uuid})
	q := &service.Query{SubQueries: []*anypb.Any{singleQ}}
	_, e := userClient.DeleteUser(ctx, &idm.DeleteUserRequest{Query: q})
	return e
}

func (apiStore *ApiStore) ListGroups(ctx context.Context, params map[string]interface{}) ([]*idm.User, error) {

	var results []*idm.User
	userClient := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))

	offset := int64(0)
	limit := int64(100)

	// List user with pagination
	for {
		singleQ, _ := anypb.New(&idm.UserSingleQuery{NodeType: idm.NodeType_GROUP})
		q := &service.Query{
			SubQueries: []*anypb.Any{singleQ},
			Offset:     offset,
			Limit:      limit,
		}
		streamer, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: q})
		if err != nil {
			return nil, err
		}
		var i int64
		i = 0
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			i = i + 1
			results = append(results, resp.User)
		}
		if i < (limit - 1) {
			break
		} else {
			offset = offset + limit
		}
	}

	return results, nil
}

// ACL

func (apiStore *ApiStore) PutACL(ctx context.Context, acl *idm.ACL) error {

	aclClient := idm.NewACLServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceAcl))
	if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); e == nil {
		return nil
	} else {
		return e
	}
}

func (apiStore *ApiStore) DeleteACL(ctx context.Context, acl *idm.ACL) error {

	aclClient := idm.NewACLServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceAcl))
	singleQ, _ := anypb.New(&idm.ACLSingleQuery{RoleIDs: []string{acl.RoleID}, WorkspaceIDs: []string{acl.WorkspaceID}, NodeIDs: []string{acl.NodeID}})
	q := &service.Query{SubQueries: []*anypb.Any{singleQ}}
	_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: q})
	return e
}

func (apiStore *ApiStore) ListACLs(ctx context.Context, params map[string]interface{}) ([]*idm.ACL, error) {

	var results []*idm.ACL
	aclClient := idm.NewACLServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceAcl))

	// List user with pagination
	q := &service.Query{
		SubQueries: []*anypb.Any{},
	}
	streamer, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: q})
	if err != nil {
		return nil, err
	}
	var i int64
	i = 0
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		i = i + 1
		results = append(results, resp.ACL)
	}

	return results, nil
}

// ROLES

func (apiStore *ApiStore) PutRole(ctx context.Context, identity *idm.Role) (*idm.Role, error) {
	if identity.Label == "" {
		identity.Label = identity.Uuid
	}
	roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceRole))
	if resp, e := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: identity}); e == nil {
		return resp.Role, nil
	} else {
		return nil, e
	}
}

func (apiStore *ApiStore) DeleteRole(ctx context.Context, identity *idm.Role) error {
	roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceRole))
	singleQ, _ := anypb.New(&idm.RoleSingleQuery{Uuid: []string{identity.Uuid}})
	q := &service.Query{SubQueries: []*anypb.Any{singleQ}}
	_, e := roleClient.DeleteRole(ctx, &idm.DeleteRoleRequest{Query: q})
	return e
}

func (apiStore *ApiStore) ListRoles(ctx context.Context, userStore models.ReadableStore, params map[string]interface{}) ([]*idm.Role, error) {

	var results []*idm.Role
	roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceRole))

	// Skip Users & Groups Roles
	var queries []*anypb.Any
	if v, o := params["teams"]; o && v.(bool) {
		// List only Teams
		s, _ := anypb.New(&idm.RoleSingleQuery{
			IsTeam: true,
		})
		queries = []*anypb.Any{s}
	} else {
		// Exclude Teams, Users and Groups - only admin "manually defined" roles should be left.
		s1, _ := anypb.New(&idm.RoleSingleQuery{
			IsTeam: true,
			Not:    true,
		})
		s2, _ := anypb.New(&idm.RoleSingleQuery{
			IsUserRole: true,
			Not:        true,
		})
		s3, _ := anypb.New(&idm.RoleSingleQuery{
			IsGroupRole: true,
			Not:         true,
		})
		queries = []*anypb.Any{s1, s2, s3}
	}
	// List user with pagination
	q := &service.Query{
		SubQueries: queries,
		Operation:  service.OperationType_AND,
		Offset:     0,
		Limit:      0,
	}

	streamer, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: q})
	if err != nil {
		return nil, err
	}
	var i int64
	i = 0
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		i = i + 1
		results = append(results, resp.Role)
	}

	return results, nil
}

// SHARES

func (apiStore *ApiStore) ListShares(ctx context.Context, params map[string]interface{}) ([]*models.SyncShare, error) {
	return []*models.SyncShare{}, nil
}

func (apiStore *ApiStore) PutShare(ctx context.Context, s *models.SyncShare) error {

	if s.Link != nil {
		return apiStore.createShareLink(s.OwnerContext, s.OwnerUser, s.Link, s.LinkPassword, s.PasswordHashed)
	}
	if s.Cell != nil {
		return apiStore.createCell(ctx, s.OwnerUser, s.Cell)
	}

	return nil
}

func (apiStore *ApiStore) CrossLoadShare(ctx context.Context, syncShare *models.SyncShare, target models.ReadableStore, params map[string]interface{}) error {
	return fmt.Errorf("not implemented")
}

func (apiStore *ApiStore) GetUserInfo(ctx context.Context, userName string, params map[string]interface{}) (u *idm.User, aclCtxt context.Context, e error) {
	loaded, ok := apiStore.loadedUsers[userName]
	if !ok {
		access, user, e := permissions.AccessListFromUser(ctx, userName, false)
		if e != nil {
			return nil, nil, e
		}
		loaded = &syncShareLoadedUser{
			user:       user,
			accessList: access,
		}
		usrCtx := auth.WithImpersonate(ctx, user)
		usrCtx = context.WithValue(usrCtx, common.PydioContextUserKey, userName)
		usrCtx = acl.WithPresetACL(usrCtx, access)
		loaded.ctx = usrCtx
		apiStore.loadedUsers[user.Login] = loaded
	}
	return loaded.user, loaded.ctx, nil

}

func (apiStore *ApiStore) GetGroupInfo(ctx context.Context, groupPath string, params map[string]interface{}) (u *idm.User, e error) {

	cl := idm.NewUserServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceUser))
	q, _ := anypb.New(&idm.UserSingleQuery{
		FullPath: groupPath,
	})
	st, e := cl.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return nil, e
	}
	for {
		resp, e := st.Recv()
		if e != nil {
			break
		}
		return resp.User, nil
	}
	log.Logger(ctx).Debug("Corresponding group not found " + groupPath)
	return nil, fmt.Errorf("not found")

}

func (apiStore *ApiStore) ReadNode(ctx context.Context, wsUuid string, wsPath string) (*tree.Node, error) {

	slugs, e := apiStore.loadWorkspacesSlugs(ctx)
	if e != nil {
		return nil, e
	}
	slug, ok := slugs[wsUuid]
	if !ok {
		return nil, fmt.Errorf("cannot find corresponding slug for workspace %s", wsUuid)
	}

	nodePath := path.Join(slug, wsPath)
	log.Logger(ctx).Info("Corresponding workspace is " + wsUuid + " - Looking for path " + nodePath)

	response, e := apiStore.getRouter().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
		Path: nodePath,
	}})
	if e != nil {
		return nil, e
	} else {
		return response.Node, nil
	}

}

// createShareLink creates a public link to a shared item.
func (apiStore *ApiStore) createShareLink(ctx context.Context, ownerUser *idm.User, link *rest.ShareLink, password string, passwordHashed bool) error {

	var workspace *idm.Workspace
	var user *idm.User
	var err error
	aclClient := idm.NewACLServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceAcl))
	shareClient := share.NewClient(apiStore.runtime, nil)

	workspace, _, err = shareClient.GetOrCreateWorkspace(ctx, ownerUser, "", idm.WorkspaceScope_LINK, link.Label, "", link.Description, false)
	if err != nil {
		return err
	}
	for _, node := range link.RootNodes {
		aclClient.CreateACL(ctx, &idm.CreateACLRequest{
			ACL: &idm.ACL{
				NodeID:      node.Uuid,
				WorkspaceID: workspace.UUID,
				Action:      &idm.ACLAction{Name: "workspace-path", Value: "uuid:" + node.Uuid},
			},
		})
	}
	link.Uuid = workspace.UUID

	// Load Hidden User
	user, err = shareClient.GetOrCreateHiddenUser(ctx, ownerUser, link, password != "", password, passwordHashed)
	if err != nil {
		return err
	}

	link.UserLogin = user.Login
	link.UserUuid = user.Uuid
	link.PasswordRequired = password != ""
	// Update Workspace Policies to make sure it's readable by the new user
	workspace.Policies = append(workspace.Policies, &service.ResourcePolicy{
		Resource: workspace.UUID,
		Subject:  fmt.Sprintf("user:%s", user.Login),
		Action:   service.ResourcePolicyAction_READ,
		Effect:   service.ResourcePolicy_allow,
	})
	wsClient := idm.NewWorkspaceServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceWorkspace))
	wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace})

	err = shareClient.UpdateACLsForHiddenUser(ctx, user.Uuid, workspace.UUID, link.RootNodes, link.Permissions, "", false)
	if err != nil {
		return err
	}
	log.Auditer(ctx).Info(
		fmt.Sprintf("Created share link [%s]", link.Label),
		log.GetAuditId(common.AuditLinkCreate),
		zap.String(common.KeyLinkUuid, link.Uuid),
		zap.String(common.KeyWorkspaceUuid, link.Uuid),
	)

	// Update HashDocument
	if err := shareClient.StoreHashDocument(ctx, ownerUser, link); err != nil {
		return err
	}
	// Reload
	return err
}

func (apiStore *ApiStore) createCell(ctx context.Context, ownerUser *idm.User, cell *rest.Cell) error {

	shareClient := share.NewClient(apiStore.runtime, nil)
	workspace, _, err := shareClient.GetOrCreateWorkspace(ctx, ownerUser, "", idm.WorkspaceScope_ROOM, cell.Label, "", cell.Description, false)
	if err != nil {
		return err
	}

	// Now set ACLs on Workspace
	aclClient := idm.NewACLServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceAcl))

	// New workspace, create "workspace-path" ACLs
	for _, node := range cell.RootNodes {
		aclClient.CreateACL(ctx, &idm.CreateACLRequest{
			ACL: &idm.ACL{
				NodeID:      node.Uuid,
				WorkspaceID: workspace.UUID,
				Action:      &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: "uuid:" + node.Uuid},
			},
		})
	}

	targetAcls, _ := shareClient.ComputeTargetAcls(ctx, ownerUser, cell, workspace.UUID, false, "") // CHECK THE READONLY FLAG?
	add, _ := shareClient.DiffAcls(ctx, []*idm.ACL{}, targetAcls)
	log.Logger(ctx).Debug("Target ACLS", zap.Int("ADD length", len(add)))

	for _, acl := range targetAcls {
		_, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while creating ACLs", zap.Error(err))
		}
	}

	log.Logger(ctx).Debug("Share Policies", zap.Int("BEFORE length", len(workspace.Policies)))
	shareClient.UpdatePoliciesFromAcls(ctx, workspace, []*idm.ACL{}, targetAcls)

	// Now update workspace
	log.Logger(ctx).Debug("Updating workspace", zap.Any("workspace", workspace))
	wsClient := idm.NewWorkspaceServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceWorkspace))
	if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace}); err != nil {
		return err
	}

	// Put an Audit log if this cell has been newly created
	log.Auditer(ctx).Info(
		fmt.Sprintf("Created cell [%s]", cell.Label),
		log.GetAuditId(common.AuditCellCreate),
		zap.String(common.KeyCellUuid, cell.Uuid),
		zap.String(common.KeyWorkspaceUuid, cell.Uuid),
	)

	return nil

}

func (apiStore *ApiStore) loadWorkspacesSlugs(ctx context.Context) (map[string]string, error) {
	if apiStore.slugsCache != nil {
		return apiStore.slugsCache, nil
	}

	cl := idm.NewWorkspaceServiceClient(grpc.ResolveConn(apiStore.runtime, common.ServiceWorkspace))
	var queries []*anypb.Any
	query, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Scope: idm.WorkspaceScope_ADMIN,
	})
	queries = append(queries, query)
	resp, e := cl.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service.Query{SubQueries: queries, Operation: service.OperationType_OR},
	})
	if e != nil {
		return nil, e
	}
	data := make(map[string]string)
	for {
		r, er := resp.Recv()
		if er != nil {
			break
		}
		data[r.Workspace.UUID] = r.Workspace.Slug
	}
	apiStore.slugsCache = data
	return apiStore.slugsCache, nil
}

func (apiStore *ApiStore) getRouter() nodes.Client {
	if apiStore.router == nil {
		apiStore.router = compose.PathClient(apiStore.runtime)
	}
	return apiStore.router
}
