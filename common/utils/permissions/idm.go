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

package permissions

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"io"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/cache"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	usersCache cache.Cache
)

func init() {
	c, _ := cache.OpenCache(context.TODO(), runtime.ShortCacheURL() + "?evictionTime=5s&cleanWindow=30s")
	usersCache = c
}

// GetRolesForUser loads the roles of a given user.
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

	roleClient := idm.NewRoleServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceRole))

	query, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: roleIds,
	})

	if stream, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{query},
		},
	}); err != nil {
		log.Logger(ctx).Error("failed to retrieve roles", zap.Error(err))
		return nil
	} else {

		defer stream.CloseSend()

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

// GetRoles Objects from a list of role names.
func GetRoles(ctx context.Context, names []string) ([]*idm.Role, error) {

	var roles []*idm.Role
	if len(names) == 0 {
		return roles, nil
	}

	query, _ := anypb.New(&idm.RoleSingleQuery{Uuid: names})
	roleClient := idm.NewRoleServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceRole))
	stream, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*anypb.Any{query}}})

	if err != nil {
		return nil, err
	}

	for {
		response, err := stream.Recv()

		if err != nil {
			if err != io.EOF {
				return nil, err
			}
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
	return sorted, nil
}

// GetACLsForRoles compiles ALCs for a list of roles.
func GetACLsForRoles(ctx context.Context, roles []*idm.Role, actions ...*idm.ACLAction) ([]*idm.ACL, error) {

	var acls []*idm.ACL

	if len(roles) == 0 {
		return acls, nil
	}

	// First we retrieve the roleIDs from the role names
	var roleIDs []string
	for _, role := range roles {
		roleIDs = append(roleIDs, role.Uuid)
	}

	q1, q2 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)
	q1.Actions = actions
	q2.RoleIDs = roleIDs

	q1Any, err := anypb.New(q1)
	if err != nil {
		return acls, err
	}

	q2Any, err := anypb.New(q2)
	if err != nil {
		return acls, err
	}
	//s := time.Now()
	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{q1Any, q2Any},
			Operation:  service.OperationType_AND,
		},
	})

	if err != nil {
		log.Logger(ctx).Error("GetACLsForRoles", zap.Error(err))
		return nil, err
	}

	for {
		response, err := stream.Recv()

		if err != nil {
			if err != io.EOF {
				return nil, err
			}
			break
		}

		acls = append(acls, response.GetACL())
	}

	//log.Logger(ctx).Debug("GetACLsForRoles", zap.Any("acls", acls), zap.Any("roles", roles), zap.Any("actions", actions), zap.Duration("t", time.Now().Sub(s)))

	return acls, nil
}

// GetACLsForWorkspace compiles ACLs list attached to a given workspace.
func GetACLsForWorkspace(ctx context.Context, workspaceIds []string, actions ...*idm.ACLAction) (acls []*idm.ACL, err error) {

	var subQueries []*anypb.Any
	q1, _ := anypb.New(&idm.ACLSingleQuery{WorkspaceIDs: workspaceIds})
	q2, _ := anypb.New(&idm.ACLSingleQuery{Actions: actions})
	subQueries = append(subQueries, q1, q2)

	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
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

	defer stream.CloseSend()
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

// GetWorkspacesForACLs computes a list of accessible workspaces, given a set of Read and Deny ACLs.
func GetWorkspacesForACLs(ctx context.Context, list *AccessList) []*idm.Workspace {

	var workspaces []*idm.Workspace

	workspaceNodes := list.GetWorkspacesNodes()
	if len(workspaceNodes) == 0 {
		// DO NOT PERFORM SEARCH, OR IT WILL RETRIEVE ALL WORKSPACES
		return workspaces
	}

	workspaceClient := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))

	var queries []*anypb.Any
	for workspaceID := range workspaceNodes {
		query, _ := anypb.New(&idm.WorkspaceSingleQuery{Uuid: workspaceID})
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

	return workspaces
}

func GetACLsForActions(ctx context.Context, actions ...*idm.ACLAction) (acls []*idm.ACL, err error) {
	var subQueries []*anypb.Any
	q1, _ := anypb.New(&idm.ACLSingleQuery{Actions: actions})
	subQueries = append(subQueries, q1)

	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{
			SubQueries: subQueries,
		},
	})

	if err != nil {
		log.Logger(ctx).Error("GetACLsForActions", zap.Error(err))
		return nil, err
	}

	defer stream.CloseSend()
	for {
		response, err := stream.Recv()
		if err != nil {
			break
		}
		acls = append(acls, response.GetACL())
	}

	return acls, nil
}

func FindUserNameInContext(ctx context.Context) (string, claim.Claims) {

	var userName string
	var claims claim.Claims
	if ctx.Value(claim.ContextKey) != nil {
		claims = ctx.Value(claim.ContextKey).(claim.Claims)
		userName = claims.Name
	} else if ctx.Value(common.PydioContextUserKey) != nil {
		userName = ctx.Value(common.PydioContextUserKey).(string)
	} else if ctx.Value(strings.ToLower(common.PydioContextUserKey)) != nil {
		userName = ctx.Value(strings.ToLower(common.PydioContextUserKey)).(string)
	} else if meta, ok := metadata.FromContextRead(ctx); ok {
		if value, exists := meta[common.PydioContextUserKey]; exists {
			userName = value
		} else if value, exists := meta[strings.ToLower(common.PydioContextUserKey)]; exists {
			userName = value
		}
	}
	return userName, claims
}

// AccessListForLockedNodes builds a flattened node list containing all currently locked nodes
func AccessListForLockedNodes(ctx context.Context, resolver VirtualPathResolver) (accessList *AccessList, err error) {
	accessList = NewAccessList([]*idm.Role{})

	acls, _ := GetACLsForActions(ctx, AclLock)

	accessList.Append(acls)
	accessList.NodesAcls = make(map[string]Bitmask)

	b := Bitmask{}
	b.AddFlag(FlagLock)

	for _, acl := range acls {
		accessList.NodesAcls[acl.NodeID] = b
	}

	accessList.LoadNodePathsAcls(ctx, resolver)

	return accessList, nil
}

// AccessListFromContextClaims uses package function to compile ACL and Workspaces for a given user ( = list of roles inside the Claims)
func AccessListFromContextClaims(ctx context.Context) (accessList *AccessList, err error) {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok {
		log.Logger(ctx).Debug("No Claims in Context, workspaces will be empty - probably anonymous user")
		accessList = NewAccessList([]*idm.Role{})
		return accessList, nil
	}
	if data, ok := getAclCache().Get(claims.SessionID + claims.Subject); ok {
		if accessList, ok = data.(*AccessList); ok {
			//fmt.Println("=> Returning accesslist from cache")
			return
		}
	}
	//fmt.Println("Loading AccessList")
	roles, e := GetRoles(ctx, strings.Split(claims.Roles, ","))
	if e != nil {
		return nil, e
	}
	accessList = NewAccessList(roles)
	aa, e := GetACLsForRoles(ctx, roles, AclRead, AclDeny, AclWrite, AclLock, AclPolicy)
	if e != nil {
		return nil, e
	}
	accessList.Append(aa)
	accessList.Flatten(ctx)

	if claims.ProvidesScopes {
		accessList.AppendClaimsScopes(claims.Scopes)
	}

	idmWorkspaces := GetWorkspacesForACLs(ctx, accessList)
	for _, workspace := range idmWorkspaces {
		accessList.Workspaces[workspace.UUID] = workspace
	}
	getAclCache().Set(claims.SessionID+claims.Subject, accessList)
	return accessList, nil
}

func AccessListFromUser(ctx context.Context, userNameOrUuid string, isUuid bool) (accessList *AccessList, user *idm.User, err error) {

	// Prepare a cancellable context as sub-calls will open many streams.
	var ca context.CancelFunc
	ctx, ca = context.WithCancel(ctx)
	defer ca()

	if isUuid {
		user, err = SearchUniqueUser(ctx, "", userNameOrUuid)
	} else {
		user, err = SearchUniqueUser(ctx, userNameOrUuid, "")
	}
	if err != nil {
		return
	}

	var rr []string
	for _, role := range user.Roles {
		rr = append(rr, role.Uuid)
	}
	keyLookup := strings.Join(rr, "-")
	if len(keyLookup) > 0 {
		if data, ok := getAclCache().Get("by-roles-" + keyLookup); ok {
			if accessList, ok = data.(*AccessList); ok {
				log.Logger(ctx).Debug("AccessListFromUser - AccessList already in cache")
				return
			}
		}
	}

	accessList, err = AccessListFromRoles(ctx, user.Roles, true, true)

	if err == nil && len(keyLookup) > 0 {
		getAclCache().Set("by-roles-"+keyLookup, accessList)
	}

	return
}

// SearchUniqueUser provides a shortcurt to search user services for one specific user.
func SearchUniqueUser(ctx context.Context, login string, uuid string, queries ...*idm.UserSingleQuery) (user *idm.User, err error) {

	if login != "" && len(queries) == 0 {
		if u, ok := usersCache.Get(login); ok {
			if us, o := u.(*idm.User); o {
				return us, nil
			}
		}
	} else if uuid != "" && len(queries) == 0 {
		if u, ok := usersCache.Get(uuid); ok {
			if us, o := u.(*idm.User); o {
				return us, nil
			}
		}
	}

	userCli := idm.NewUserServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceUser))
	var searchRequests []*anypb.Any
	if uuid != "" {
		searchRequest, _ := anypb.New(&idm.UserSingleQuery{Uuid: uuid})
		searchRequests = append(searchRequests, searchRequest)
	} else if login != "" {
		searchRequest, _ := anypb.New(&idm.UserSingleQuery{Login: login})
		searchRequests = append(searchRequests, searchRequest)
	}
	for _, q := range queries {
		searchRequest, _ := anypb.New(q)
		searchRequests = append(searchRequests, searchRequest)
	}
	if len(searchRequests) == 0 {
		return nil, fmt.Errorf("please provide at least one of login, uuid or queries")
	}
	ct, can := context.WithTimeout(ctx, 10*time.Second)
	defer can()
	streamer, err := userCli.SearchUser(ct, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: searchRequests, Operation: service.OperationType_AND},
	})
	if err != nil {
		return
	}
	resp, e := streamer.Recv()
	if e == io.EOF || e == io.ErrUnexpectedEOF {
		return nil, errors.NotFound("user.not.found", "cannot find user with this login or uuid")
	} else if e != nil {
		return nil, e
	}
	user = resp.GetUser()
	// Store to quick cache
	if len(queries) == 0 {
		usersCache.Set(login, user)
		usersCache.Set(uuid, user)
	}
	return
}

// SearchUniqueWorkspace is a wrapper of SearchWorkspace to load a unique workspace
func SearchUniqueWorkspace(ctx context.Context, wsUuid string, wsSlug string, queries ...*idm.WorkspaceSingleQuery) (*idm.Workspace, error) {

	wsCli := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))
	if wsUuid != "" {
		queries = append(queries, &idm.WorkspaceSingleQuery{Uuid: wsUuid})
	} else if wsSlug != "" {
		queries = append(queries, &idm.WorkspaceSingleQuery{Slug: wsSlug})
	}
	if len(queries) == 0 {
		return nil, errors.BadRequest("bad.request", "please provide at least one of uuid, slug or custom query")
	}
	requests := make([]*anypb.Any, len(queries))
	for _, q := range queries {
		pq, _ := anypb.New(q)
		requests = append(requests, pq)
	}
	st, e := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: requests}})
	if e != nil {
		return nil, e
	}
	resp, e := st.Recv()
	if e == io.EOF || e == io.ErrUnexpectedEOF {
		return nil, errors.NotFound("ws.not.found", "cannot find workspace with these queries")
	} else if e != nil {
		return nil, e
	}
	return resp.GetWorkspace(), nil

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

// AccessListFromRoles loads the Acls and flatten them, eventually loading the discovered workspaces.
func AccessListFromRoles(ctx context.Context, roles []*idm.Role, countPolicies bool, loadWorkspaces bool) (accessList *AccessList, err error) {

	accessList = NewAccessList(roles)
	search := []*idm.ACLAction{AclRead, AclDeny, AclWrite}
	if countPolicies {
		search = append(search, AclPolicy)
		/*
			ResolvePolicyRequest = func(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
				return &idm.PolicyEngineResponse{Allowed: true}, nil
			}
		*/
	}
	aa, e := GetACLsForRoles(ctx, roles, search...)
	if e != nil {
		return nil, e
	}
	accessList.Append(aa)
	accessList.Flatten(ctx)

	if loadWorkspaces {
		idmWorkspaces := GetWorkspacesForACLs(ctx, accessList)
		for _, workspace := range idmWorkspaces {
			accessList.Workspaces[workspace.UUID] = workspace
		}
	}

	return

}

// AccessListLoadFrontValues loads all ACLs starting with actions: and parameters: for the
// current list of ordered roles
func AccessListLoadFrontValues(ctx context.Context, accessList *AccessList) error {

	if accessList.FrontPluginsValues != nil {
		return nil
	}

	values, er := GetACLsForRoles(ctx, accessList.OrderedRoles, AclFrontAction_, AclFrontParam_)
	if er != nil {
		return er
	}
	accessList.FrontPluginsValues = values

	return nil
}

// FrontValuesScopesFromWorkspaces computes scopes to check when retrieving front plugin configuration
func FrontValuesScopesFromWorkspaces(wss []*idm.Workspace) (scopes []string) {
	scopes = append(scopes, FrontWsScopeAll)
	for _, ws := range wss {
		if ws.Scope != idm.WorkspaceScope_ADMIN {
			scopes = append(scopes, FrontWsScopeShared)
		}
	}
	for _, ws := range wss {
		scopes = append(scopes, ws.UUID)
	}
	return
}

// FrontValuesScopesFromWorkspaceRelativePaths computes scopes to check when retrieving front plugin configuration,
// based on a list of Node.AppearsIn workspaces descriptions
func FrontValuesScopesFromWorkspaceRelativePaths(wss []*tree.WorkspaceRelativePath) (scopes []string) {
	// Default scope
	scopes = append(scopes, FrontWsScopeAll)
	// If one ws is a cell or link, narrow down the scope
	for _, ws := range wss {
		if ws.WsScope != idm.WorkspaceScope_ADMIN.String() {
			scopes = append(scopes, FrontWsScopeShared)
			break
		}
	}
	// Additional scope based on Ws Uuid
	for _, ws := range wss {
		scopes = append(scopes, ws.WsUuid)
	}
	return
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

	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	// Look for "quota" ACLs on this node
	singleQ := &idm.ACLSingleQuery{NodeIDs: []string{node.Uuid}, Actions: []*idm.ACLAction{{Name: AclContentLock.Name}}}
	//log.Logger(ctx).Debug("SEARCHING FOR LOCKS IN ACLS", zap.Any("q", singleQ))
	q, _ := anypb.New(singleQ)
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if err != nil {
		return err
	}
	defer stream.CloseSend()
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

func ForceClearUserCache(login string) {
	usersCache.Delete(login)
}
