/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
package permissions

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
)

// Load roles for a given user
func GetRolesForUser(ctx context.Context, user *idm.User, createMissing bool) []*idm.Role {

	var roles []*idm.Role
	var foundRoles = map[string]*idm.Role{}

	var roleIds []string
	for _, r := range user.Roles {
		roleIds = append(roleIds, r.Uuid)
	}

	if len(roleIds) == 0 {
		return roles
	}

	roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())

	query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid: roleIds,
	})

	if stream, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{query},
		},
	}); err != nil {
		log.Logger(ctx).Error("failed to retrieve roles", zap.Error(err))
		return nil
	} else {

		defer stream.Close()

		for {
			response, err := stream.Recv()

			if err != nil {
				break
			}

			foundRoles[response.GetRole().GetUuid()] = response.GetRole()
		}
	}

	for _, role := range user.Roles {

		if loaded, ok := foundRoles[role.Uuid]; ok {

			roles = append(roles, loaded)

		} else if createMissing && (role.GroupRole || role.UserRole) {

			// Create missing role now
			var label string
			if role.GroupRole {
				label = "Group " + role.Label
			} else {
				label = "User " + user.Login
			}
			resp, e := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
				Uuid:      role.Uuid,
				GroupRole: role.GroupRole,
				UserRole:  role.UserRole,
				Label:     label,
			}})
			if e == nil {
				roles = append(roles, resp.Role)
			} else {
				log.Logger(ctx).Error("Error creating special role", zap.Error(e))
			}

		} else {

			roles = append(roles, role) // Still put empty role here

		}
	}

	return roles
}

// GetRoles Objects from a list of role names
func GetRoles(ctx context.Context, names []string) []*idm.Role {

	var roles []*idm.Role
	if len(names) == 0 {
		return roles
	}

	query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: names})
	roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	stream, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*any.Any{query}}})

	if err != nil {
		if !strings.Contains(err.Error(), "context canceled") {
			log.Logger(ctx).Error("Failed to retrieve roles", zap.Error(err), zap.Any("c", ctx))
		}
		return nil
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()

		if err != nil {
			break
		}

		roles = append(roles, response.GetRole())
	}

	var sorted []*idm.Role
	for _, name := range names {
		for _, role := range roles {
			if role.Uuid == name {
				sorted = append(sorted, role)
			}
		}
	}
	//log.Logger(ctx).Debug("GetRoles", zap.Any("roles", sorted))
	return sorted
}

// GetACLsForRoles compiles ALCs for a list of roles
func GetACLsForRoles(ctx context.Context, roles []*idm.Role, actions ...*idm.ACLAction) []*idm.ACL {

	var acls []*idm.ACL

	if len(roles) == 0 {
		return acls
	}

	// First we retrieve the roleIDs from the role names
	var roleIDs []string
	for _, role := range roles {
		roleIDs = append(roleIDs, role.Uuid)
	}

	q1, q2 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)
	q1.Actions = actions
	q2.RoleIDs = roleIDs

	q1Any, err := ptypes.MarshalAny(q1)
	if err != nil {
		return acls
	}

	q2Any, err := ptypes.MarshalAny(q2)
	if err != nil {
		return acls
	}
	//s := time.Now()
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q1Any, q2Any},
			Operation:  service.OperationType_AND,
		},
	})

	if err != nil {
		log.Logger(ctx).Error("GetACLsForRoles", zap.Error(err))
		return nil
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()

		if err != nil {
			break
		}

		acls = append(acls, response.GetACL())
	}

	//log.Logger(ctx).Debug("GetACLsForRoles", zap.Any("acls", acls), zap.Any("roles", roles), zap.Any("actions", actions), zap.Duration("t", time.Now().Sub(s)))

	return acls
}

// GetACLsForWorkspace compiles ACLs list attached to a given workspace
func GetACLsForWorkspace(ctx context.Context, workspaceIds []string, actions ...*idm.ACLAction) (acls []*idm.ACL, err error) {

	var subQueries []*any.Any
	q1, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{WorkspaceIDs: workspaceIds})
	q2, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{Actions: actions})
	subQueries = append(subQueries, q1, q2)

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{
			SubQueries: subQueries,
			Operation:  service.OperationType_AND,
		},
	})

	if err != nil {
		log.Logger(ctx).Error("GetACLsForWorkspace", zap.Error(err))
		return nil, err
	}

	defer stream.Close()
	for {
		response, err := stream.Recv()
		if err != nil {
			break
		}
		acls = append(acls, response.GetACL())
	}
	//log.Logger(ctx).Debug("GetACLsForWorkspace", zap.Any("acls", acls), zap.Any("wsId", workspaceId), zap.Any("action", action))

	return acls, nil

}

// Compute a list of accessible workspaces, given a set of Read and Deny ACLs.
func GetWorkspacesForACLs(ctx context.Context, list *AccessList) []*idm.Workspace {

	var workspaces []*idm.Workspace

	workspaceNodes := list.GetWorkspacesNodes()
	if len(workspaceNodes) == 0 {
		// DO NOT PERFORM SEARCH, OR IT WILL RETRIEVE ALL WORKSPACES
		return workspaces
	}

	workspaceClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())

	var queries []*any.Any
	for workspaceID := range workspaceNodes {
		query, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{Uuid: workspaceID})
		queries = append(queries, query)
	}

	stream, err := workspaceClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service.Query{
			SubQueries: queries,
			Operation:  service.OperationType_OR,
		},
	})
	if err != nil {
		log.Logger(ctx).Error("search workspace request has failed", zap.Error(err))
		return nil
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()

		if err != nil {
			break
		}

		ws := response.GetWorkspace()
		for nodeUuid := range workspaceNodes[ws.UUID] {
			ws.RootUUIDs = append(ws.RootUUIDs, nodeUuid)
		}
		workspaces = append(workspaces, ws)
	}

	//log.Logger(ctx).Debug("GetWorkspacesForACLs", zap.Any("workspaces", workspaces))

	return workspaces
}

func FindUserNameInContext(ctx context.Context) (string, claim.Claims) {

	var userName string
	var claims claim.Claims
	if ctx.Value(claim.ContextKey) != nil {
		claims = ctx.Value(claim.ContextKey).(claim.Claims)
		userName = claims.Name
	} else if ctx.Value(common.PYDIO_CONTEXT_USER_KEY) != nil {
		userName = ctx.Value(common.PYDIO_CONTEXT_USER_KEY).(string)
	} else if ctx.Value(strings.ToLower(common.PYDIO_CONTEXT_USER_KEY)) != nil {
		userName = ctx.Value(strings.ToLower(common.PYDIO_CONTEXT_USER_KEY)).(string)
	} else if meta, ok := metadata.FromContext(ctx); ok {
		if value, exists := meta[common.PYDIO_CONTEXT_USER_KEY]; exists {
			userName = value
		} else if value, exists := meta[strings.ToLower(common.PYDIO_CONTEXT_USER_KEY)]; exists {
			userName = value
		}
	}
	return userName, claims

}

// Use package function to compile ACL and Workspaces for a given user ( = list of roles inside the Claims)
func AccessListFromContextClaims(ctx context.Context) (accessList *AccessList, err error) {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok {
		log.Logger(ctx).Debug("No Claims in Context, workspaces will be empty - probably anonymous user")
		accessList = NewAccessList([]*idm.Role{})
		return accessList, nil
	}

	roles := GetRoles(ctx, strings.Split(claims.Roles, ","))
	accessList = NewAccessList(roles)
	accessList.Append(GetACLsForRoles(ctx, roles, AclRead, AclDeny, AclWrite, AclLock, AclPolicy))
	ResolvePolicyRequest = func(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
		cli := idm.NewPolicyEngineServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, defaults.NewClient())
		return cli.IsAllowed(ctx, request)
	}
	accessList.Flatten(ctx)

	idmWorkspaces := GetWorkspacesForACLs(ctx, accessList)
	for _, workspace := range idmWorkspaces {
		accessList.Workspaces[workspace.UUID] = workspace
	}

	return accessList, nil
}

func AccessListFromUser(ctx context.Context, userNameOrUuid string, isUuid bool) (accessList *AccessList, user *idm.User, err error) {

	if isUuid {
		user, err = SearchUniqueUser(ctx, "", userNameOrUuid)
	} else {
		user, err = SearchUniqueUser(ctx, userNameOrUuid, "")
	}
	if err != nil {
		return
	}

	accessList, err = AccessListFromRoles(ctx, user.Roles, false, true)

	return
}

// SearchUniqueUser provides a shortcurt to search user services for one specific user
func SearchUniqueUser(ctx context.Context, login string, uuid string, queries ...*idm.UserSingleQuery) (user *idm.User, err error) {
	userCli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	var searchRequests []*any.Any
	if uuid != "" {
		searchRequest, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: uuid})
		searchRequests = append(searchRequests, searchRequest)
	} else if login != "" {
		searchRequest, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: login})
		searchRequests = append(searchRequests, searchRequest)
	}
	for _, q := range queries {
		searchRequest, _ := ptypes.MarshalAny(q)
		searchRequests = append(searchRequests, searchRequest)
	}
	if len(searchRequests) == 0 {
		return nil, fmt.Errorf("please provide at one of login, uuid or queries")
	}
	streamer, err := userCli.SearchUser(ctx, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: searchRequests, Operation: service.OperationType_AND},
	})
	if err != nil {
		return
	}
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		user = resp.GetUser()
		break
	}
	if user == nil {
		return nil, errors.NotFound(common.SERVICE_USER, "Cannot find user with this login or uuid")
	}
	return
}

// IsUserLocked checks if the passed user has a logout attribute defined.
func IsUserLocked(user *idm.User) bool {
	var hasLock bool
	if user.Attributes != nil {
		if l, ok := user.Attributes["locks"]; ok {
			var locks []string
			if e := json.Unmarshal([]byte(l), &locks); e == nil {
				for _, lock := range locks {
					if lock == "logout" {
						hasLock = true
						break
					}
				}
			}
		}
	}
	return hasLock
}

// AccessListFromRoles loads the Acls and flatten them, eventually loading the discovered workspaces
func AccessListFromRoles(ctx context.Context, roles []*idm.Role, countPolicies bool, loadWorkspaces bool) (accessList *AccessList, err error) {

	accessList = NewAccessList(roles)
	search := []*idm.ACLAction{AclRead, AclDeny, AclWrite}
	if countPolicies {
		search = append(search, AclPolicy)
		ResolvePolicyRequest = func(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
			return &idm.PolicyEngineResponse{Allowed: true}, nil
		}
	}
	accessList.Append(GetACLsForRoles(ctx, roles, search...))
	accessList.Flatten(ctx)

	if loadWorkspaces {
		idmWorkspaces := GetWorkspacesForACLs(ctx, accessList)
		for _, workspace := range idmWorkspaces {
			accessList.Workspaces[workspace.UUID] = workspace
		}
	}

	return

}

func AccessListLoadFrontValues(ctx context.Context, accessList *AccessList) error {

	values := GetACLsForRoles(ctx, accessList.OrderedRoles, AclFrontAction_, AclFrontParam_)
	accessList.FrontPluginsValues = values
	//log.Logger(ctx).Debug("Frontend ACL Values", zap.Any("values", values), zap.Any("flattenedValues", accessList.FlattenedFrontValues()))

	return nil
}

// CheckContentLock finds if there is a global lock registered in ACLs.
func CheckContentLock(ctx context.Context, node *tree.Node) error {
	if node.Uuid == "" {
		return nil
	}
	var userName string
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		userName = claims.Name
	}

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	// Look for "quota" ACLs on this node
	singleQ := &idm.ACLSingleQuery{NodeIDs: []string{node.Uuid}, Actions: []*idm.ACLAction{{Name: AclContentLock.Name}}}
	//log.Logger(ctx).Debug("SEARCHING FOR LOCKS IN ACLS", zap.Any("q", singleQ))
	q, _ := ptypes.MarshalAny(singleQ)
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
	if err != nil {
		return err
	}
	defer stream.Close()
	for {
		rsp, e := stream.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		acl := rsp.ACL
		if userName == "" || acl.Action.Value != userName {
			return errors.Forbidden("file.locked", "This file is locked by another user")
		}
		break
	}
	return nil
}
