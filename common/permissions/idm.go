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
	"strings"
	"time"

	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	//usersCachePool *openurl.Pool[cache.Cache]
	//usersOnce      sync.Once
	usersCacheConfig = cache.Config{
		Prefix:      "users",
		Eviction:    "5s",
		CleanWindow: "30s",
	}
)

func getUsersCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, usersCacheConfig)
}

// GetRolesForUser loads the roles of a given user.
func GetRolesForUser(ctx context.Context, user *idm.User, createMissing bool) ([]*idm.Role, error) {

	var roles []*idm.Role
	var foundRoles = map[string]*idm.Role{}

	var roleIds []string
	for _, r := range user.Roles {
		roleIds = append(roleIds, r.Uuid)
	}

	if len(roleIds) == 0 {
		return roles, nil
	}

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GetRolesForUser", 1)
	defer span.End()

	roleClient := idmc.RoleServiceClient(ctx)

	query, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: roleIds,
	})

	stream, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{query},
		},
	})
	if er := commons.ForEach(stream, err, func(response *idm.SearchRoleResponse) error {
		foundRoles[response.GetRole().GetUuid()] = response.GetRole()
		return nil
	}); er != nil {
		return nil, er
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
				return nil, e
			}

		} else {

			roles = append(roles, role) // Still put empty role here

		}
	}

	return roles, nil
}

// GetRoles Objects from a list of role names.
func GetRoles(ctx context.Context, names []string) ([]*idm.Role, error) {

	var roles []*idm.Role
	if len(names) == 0 {
		return roles, nil
	}

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GetRoles", 1)
	defer span.End()

	query, _ := anypb.New(&idm.RoleSingleQuery{Uuid: names})
	stream, err := idmc.RoleServiceClient(ctx).SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*anypb.Any{query}}})
	if er := commons.ForEach(stream, err, func(t *idm.SearchRoleResponse) error {
		roles = append(roles, t.GetRole())
		return nil
	}); er != nil {
		return nil, er
	}

	var sorted []*idm.Role
	for _, name := range names {
		for _, role := range roles {
			if role.Uuid == name {
				sorted = append(sorted, role)
			}
		}
	}
	return sorted, nil
}

// GetACLsForRoles compiles ALCs for a list of roles.
func GetACLsForRoles(ctx context.Context, roles []*idm.Role, actions ...*idm.ACLAction) ([]*idm.ACL, error) {

	var acls []*idm.ACL

	if len(roles) == 0 {
		return acls, nil
	}

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GetACLsForRoles", 1)
	defer span.End()

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
	return performACLSearch(ctx, &service.Query{
		SubQueries: []*anypb.Any{q1Any, q2Any},
		Operation:  service.OperationType_AND,
	})
}

// GetACLsForWorkspace compiles ACLs list attached to a given workspace.
func GetACLsForWorkspace(ctx context.Context, workspaceIds []string, actions ...*idm.ACLAction) ([]*idm.ACL, error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GetACLsForWorkspace", 1)
	defer span.End()

	var subQueries []*anypb.Any
	q1, _ := anypb.New(&idm.ACLSingleQuery{WorkspaceIDs: workspaceIds})
	q2, _ := anypb.New(&idm.ACLSingleQuery{Actions: actions})
	subQueries = append(subQueries, q1, q2)
	return performACLSearch(ctx, &service.Query{
		SubQueries: subQueries,
		Operation:  service.OperationType_AND,
	})

}

// GetACLsForActions find all ACLs for a given list of actions
func GetACLsForActions(ctx context.Context, actions ...*idm.ACLAction) ([]*idm.ACL, error) {
	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GetACLsForActions", 1)
	defer span.End()

	var subQueries []*anypb.Any
	q1, _ := anypb.New(&idm.ACLSingleQuery{Actions: actions})
	subQueries = append(subQueries, q1)
	return performACLSearch(ctx, &service.Query{
		SubQueries: subQueries,
	})
}

func performACLSearch(ctx context.Context, query *service.Query) (aa []*idm.ACL, e error) {
	stream, err := idmc.ACLServiceClient(ctx).SearchACL(ctx, &idm.SearchACLRequest{
		Query: query,
	})
	e = commons.ForEach(stream, err, func(t *idm.SearchACLResponse) error {
		aa = append(aa, t.GetACL())
		return nil
	})
	return
}

func workspacesByUUIDs(ctx context.Context, uuids []string) (ww []*idm.Workspace, e error) {
	workspaceClient := idmc.WorkspaceServiceClient(ctx)
	var queries []*anypb.Any
	for _, id := range uuids {
		query, _ := anypb.New(&idm.WorkspaceSingleQuery{Uuid: id})
		queries = append(queries, query)
	}

	stream, err := workspaceClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service.Query{
			SubQueries: queries,
			Operation:  service.OperationType_OR,
		},
	})
	e = commons.ForEach(stream, err, func(t *idm.SearchWorkspaceResponse) error {
		ww = append(ww, t.GetWorkspace())
		return nil
	})
	return

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
	} else if meta, ok := propagator.FromContextRead(ctx); ok {
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

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "AccessListForLockedNodes", 1)
	defer span.End()

	accessList = NewAccessList()

	acls, _ := GetACLsForActions(ctx, AclLock)

	accessList.AppendACLs(acls...)
	accessList.masksByUUIDs = make(map[string]Bitmask)

	b := Bitmask{}
	b.AddFlag(FlagLock)

	for _, acl := range acls {
		accessList.masksByUUIDs[acl.NodeID] = b
	}

	if er := accessList.loadNodePathAcls(ctx, resolver); er != nil {
		return nil, er
	}

	return accessList, nil
}

// AccessListFromContextClaims uses package function to compile ACL and Workspaces for a given user ( = list of roles inside the Claims)
func AccessListFromContextClaims(ctx context.Context) (accessList *AccessList, err error) {

	accessList = NewAccessList()

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok {
		log.Logger(ctx).Debug("No Claims in Context, workspaces will be empty - probably anonymous user")
		return
	}
	if cached, ok := newFromCache(ctx, claims.GetUniqueKey()); ok {

		return cached, nil
	}

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "AccessListFromContextClaims", 1)
	defer span.End()

	log.Logger(ctx).Debug("Reloading a new version of AccessList")

	//fmt.Println("Loading AccessList")
	roles, e := GetRoles(ctx, strings.Split(claims.Roles, ","))
	if e != nil {
		return nil, errors.Tag(e, errors.AccessListNotFound)
	}
	accessList.AppendRoles(roles...)
	aa, e := GetACLsForRoles(ctx, roles, AclRead, AclDeny, AclWrite, AclLock, AclPolicy)
	if e != nil {
		return nil, errors.Tag(e, errors.AccessListNotFound)
	}
	accessList.AppendACLs(aa...)
	accessList.Flatten(ctx)

	if claims.ProvidesScopes {
		accessList.AppendClaimsScopes(claims.Scopes)
	}

	if er := accessList.LoadWorkspaces(ctx, workspacesByUUIDs); er != nil {
		return nil, errors.Tag(er, errors.AccessListNotFound)
	}

	if er := accessList.cache(ctx, claims.GetUniqueKey()); er != nil {
		log.Logger(ctx).Warn("Could not store ACL to cache: "+er.Error(), zap.Error(err))
	}
	return
}

// AccessListFromUser loads roles for a given user, by name or UUID, and subsequently calls AccessListFromRoles
func AccessListFromUser(ctx context.Context, userNameOrUuid string, isUuid bool) (accessList *AccessList, user *idm.User, err error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "AccessListFromUser", 1)
	defer span.End()

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
		if cached, ok := newFromCache(ctx, "by-roles-"+keyLookup); ok {
			log.Logger(ctx).Debug("AccessListFromUser - AccessList already in cache")
			accessList = cached
			return
		}
	}

	accessList, err = AccessListFromRoles(ctx, user.Roles, true, true)

	if err == nil && len(keyLookup) > 0 {
		_ = accessList.cache(ctx, "by-roles-"+keyLookup)
	}

	return
}

// AccessListFromRoles loads the Acls and flatten them, eventually loading the discovered workspaces.
func AccessListFromRoles(ctx context.Context, roles []*idm.Role, countPolicies bool, loadWorkspaces bool) (accessList *AccessList, err error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "AccessListFromRoles", 1)
	defer span.End()

	accessList = NewAccessList(roles...)
	search := []*idm.ACLAction{AclRead, AclDeny, AclWrite}
	if countPolicies {
		search = append(search, AclPolicy)
	}
	aa, e := GetACLsForRoles(ctx, roles, search...)
	if e != nil {
		return nil, e
	}
	accessList.AppendACLs(aa...)
	accessList.Flatten(ctx)

	if loadWorkspaces {
		if er := accessList.LoadWorkspaces(ctx, workspacesByUUIDs); er != nil {
			return nil, er
		}
	}

	return

}

// SearchUniqueUser provides a shortcut to search user services for one specific user.
func SearchUniqueUser(ctx context.Context, login string, uuid string, queries ...*idm.UserSingleQuery) (user *idm.User, err error) {

	if login != "" && len(queries) == 0 {
		if getUsersCache(ctx).Get(login, &user) {
			return user, nil
		}
	} else if uuid != "" && len(queries) == 0 {
		if getUsersCache(ctx).Get(uuid, &user) {
			return user, nil
		}
	}

	//var span trace.Span
	//ctx, span = tracing.StartLocalSpan(ctx, "SearchUniqueUser", 1)
	//defer span.End()

	userCli := idmc.UserServiceClient(ctx)
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
		return nil, errors.Tag(errors.New("please provide at least one of login, uuid or queries"), errors.StatusBadRequest)
	}
	ct, can := context.WithTimeout(ctx, 10*time.Second)
	defer can()
	resp, err := userCli.SearchOne(ct, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: searchRequests, Operation: service.OperationType_AND},
	})
	if err != nil {
		return nil, err //serviceerrors.NotFound("user.not.found", "cannot find user with this login or uuid %w", err) - SHOULD ALREADY BE A UserNotFound
	}
	user = resp.GetUser()
	// Store to quick cache
	if len(queries) == 0 {
		ka := getUsersCache(ctx)
		if uuid != "" {
			_ = ka.Set(uuid, user)
		} else if login != "" {
			_ = ka.Set(login, user)
		}
	}
	return
}

// GroupExists finds a group by its full path
func GroupExists(ctx context.Context, group string) (*idm.User, bool) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "GroupExists", 1)
	defer span.End()

	userCli := idmc.UserServiceClient(ctx)
	var searchRequests []*anypb.Any
	searchRequest, _ := anypb.New(&idm.UserSingleQuery{FullPath: group})
	searchRequests = append(searchRequests, searchRequest)
	ct, can := context.WithTimeout(ctx, 10*time.Second)
	defer can()
	streamer, err := userCli.SearchUser(ct, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: searchRequests, Operation: service.OperationType_AND},
	})
	if err != nil {
		return nil, false
	}
	if resp, e := streamer.Recv(); e != nil {
		return nil, false
	} else {
		return resp.GetUser(), true
	}

}

// SearchUniqueWorkspace is a wrapper of SearchWorkspace to load a unique workspace
func SearchUniqueWorkspace(ctx context.Context, wsUuid string, wsSlug string, queries ...*idm.WorkspaceSingleQuery) (*idm.Workspace, error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "SearchUniqueWorkspace", 1)
	defer span.End()

	wsCli := idmc.WorkspaceServiceClient(ctx)
	if wsUuid != "" {
		queries = append(queries, &idm.WorkspaceSingleQuery{Uuid: wsUuid})
	} else if wsSlug != "" {
		queries = append(queries, &idm.WorkspaceSingleQuery{Slug: wsSlug})
	}
	if len(queries) == 0 {
		return nil, errors.WithMessage(errors.StatusBadRequest, "please provide at least one of uuid, slug or custom query")
	}
	requests := make([]*anypb.Any, len(queries))
	for _, q := range queries {
		pq, _ := anypb.New(q)
		requests = append(requests, pq)
	}
	st, e := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: requests, Limit: 1}})
	resp, ok, e := commons.MustStreamOne(st, e)
	if e != nil {
		return nil, e
	} else if ok {
		return resp.GetWorkspace(), nil
	} else {
		return nil, errors.WithMessage(errors.WorkspaceNotFound, "cannot find workspace with these queries")
	}
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

// AccessListLoadFrontValues loads all ACLs starting with actions: and parameters: for the
// current list of ordered roles
func AccessListLoadFrontValues(ctx context.Context, accessList *AccessList) error {

	if accessList.frontACLs != nil {
		return nil
	}

	values, er := GetACLsForRoles(ctx, accessList.GetRoles(), AclFrontAction_, AclFrontParam_)
	if er != nil {
		return er
	}
	accessList.frontACLs = values

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
// based on a list of N.AppearsIn workspaces descriptions
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

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "CheckContentLock", 1)
	defer span.End()

	// Look for "quota" ACLs on this node
	singleQ := &idm.ACLSingleQuery{NodeIDs: []string{node.Uuid}, Actions: []*idm.ACLAction{{Name: AclContentLock.Name}}}
	//log.Logger(ctx).Debug("SEARCHING FOR LOCKS IN ACLS", zap.Any("q", singleQ))
	q, _ := anypb.New(singleQ)
	stream, err := idmc.ACLServiceClient(ctx).SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if err != nil {
		return err
	}
	rsp, e := stream.Recv()
	if errors.IsStreamFinished(e) {
		return nil
	} else if e != nil {
		return e
	}
	acl := rsp.ACL
	if userName == "" || acl.Action.Value != userName {
		return errors.WithStack(errors.StatusLocked)
	}
	return nil
}

func ForceClearUserCache(ctx context.Context, login string) {
	_ = getUsersCache(ctx).Delete(login)
}
