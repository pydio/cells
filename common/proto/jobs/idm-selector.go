/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package jobs

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
)

func (m *IdmSelector) MultipleSelection() bool {
	return m.Collect
}

// Select IDM Objects by a given query
func (m *IdmSelector) Select(client client.Client, ctx context.Context, objects chan interface{}, done chan bool) error {

	defer func() {
		done <- true
	}()
	// Push Claims in Context to impersonate this user
	var query *service.Query
	if m.Query != nil {
		query = m.Query
	} else if m.All {
		query = &service.Query{SubQueries: []*any.Any{}}
	}
	if query == nil {
		return nil
	}
	switch m.Type {
	case IdmSelectorType_User:
		userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, client)
		s, e := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: query})
		if e != nil {
			return e
		}
		defer s.Close()
		for {
			resp, e := s.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			objects <- resp.User
		}
	case IdmSelectorType_Role:
		roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, client)
		if s, e := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: query}); e != nil {
			return e
		} else {
			defer s.Close()
			for {
				resp, er := s.Recv()
				if er != nil {
					break
				}
				if resp == nil {
					continue
				}
				objects <- resp.Role
			}
		}
	case IdmSelectorType_Workspace:
		wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, client)
		if s, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query}); e != nil {
			return e
		} else {
			defer s.Close()
			for {
				resp, er := s.Recv()
				if er != nil {
					break
				}
				if resp == nil {
					continue
				}
				objects <- resp.Workspace
			}
		}
	case IdmSelectorType_Acl:
		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, client)
		if s, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: query}); e != nil {
			return e
		} else {
			defer s.Close()
			for {
				resp, er := s.Recv()
				if er != nil {
					break
				}
				if resp == nil {
					continue
				}
				objects <- resp.ACL
			}
		}
	default:
		break
	}

	return nil
}

// Filter IDM objects by a query
func (m *IdmSelector) Filter(input ActionMessage) ActionMessage {

	if m.All {
		return input
	}
	var matchers []idm.Matcher
	switch m.Type {
	case IdmSelectorType_User:
		if len(input.Users) == 0 {
			return input
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.UserSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Users = []*idm.User{}
				return input
			} else {
				matchers = append(matchers, target)
			}
		}
		var uu []*idm.User
		for _, u := range input.Users {
			if m.matchQueries(u, matchers) {
				uu = append(uu, u)
			}
		}
		input.Users = uu
	case IdmSelectorType_Role:
		if len(input.Roles) == 0 {
			return input
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.RoleSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Roles = []*idm.Role{}
				return input
			} else {
				matchers = append(matchers, target)
			}
		}
		var rr []*idm.Role
		for _, r := range input.Roles {
			if m.matchQueries(r, matchers) {
				rr = append(rr, r)
			}
		}
		input.Roles = rr
	case IdmSelectorType_Workspace:
		if len(input.Workspaces) == 0 {
			return input
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.WorkspaceSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Workspaces = []*idm.Workspace{}
				return input
			} else {
				matchers = append(matchers, target)
			}
		}
		var ww []*idm.Workspace
		for _, w := range input.Workspaces {
			if m.matchQueries(w, matchers) {
				ww = append(ww, w)
			}
		}
		input.Workspaces = ww
	case IdmSelectorType_Acl:
		if len(input.Acls) == 0 {
			return input
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.ACLSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Acls = []*idm.ACL{}
				return input
			} else {
				matchers = append(matchers, target)
			}
		}
		var aa []*idm.ACL
		for _, a := range input.Acls {
			if m.matchQueries(a, matchers) {
				aa = append(aa, a)
			}
		}
		input.Acls = aa
	default:
		break
	}

	return input
}

func (m *IdmSelector) matchQueries(object interface{}, matchers []idm.Matcher) bool {
	var bb []bool
	for _, matcher := range matchers {
		bb = append(bb, matcher.Matches(object))
	}
	return service.ReduceQueryBooleans(bb, m.Query.Operation)
}
