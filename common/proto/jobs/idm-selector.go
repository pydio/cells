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
	"github.com/golang/protobuf/proto"

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
func (m *IdmSelector) Select(cl client.Client, ctx context.Context, input ActionMessage, objects chan interface{}, done chan bool) error {

	defer func() {
		done <- true
	}()
	// Push Claims in Context to impersonate this user
	var query *service.Query
	if m.Query != nil {
		query = m.cloneEvaluated(ctx, input, m.Query)
	} else if m.All {
		query = &service.Query{SubQueries: []*any.Any{}}
	}
	if query == nil {
		return nil
	}
	switch m.Type {
	case IdmSelectorType_User:
		userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, cl)
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
		roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, cl)
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
		wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, cl)
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
		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, cl)
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
func (m *IdmSelector) Filter(ctx context.Context, input ActionMessage) (ActionMessage, *ActionMessage, bool) {

	var opposite *ActionMessage

	if m.All && (m.Query == nil || len(m.Query.SubQueries) == 0) {
		return input, nil, true
	}
	var matchers []idm.Matcher
	var pass bool

	switch m.Type {
	case IdmSelectorType_User:
		if len(input.Users) == 0 {
			return input, nil, false // break!
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.UserSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Users = []*idm.User{}
				return input, nil, false
			} else {
				matchers = append(matchers, m.evaluate(ctx, input, target))
			}
		}
		var uu []*idm.User
		var xx []*idm.User
		for _, u := range input.Users {
			if m.matchQueries(u, matchers) {
				uu = append(uu, u)
			} else {
				xx = append(xx, u)
			}
		}
		input.Users = uu
		pass = len(input.Users) > 0
		if len(xx) > 0 {
			op := input
			op.Users = xx
			opposite = &op
		}

	case IdmSelectorType_Role:
		if len(input.Roles) == 0 {
			return input, nil, false
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.RoleSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Roles = []*idm.Role{}
				return input, nil, false
			} else {
				matchers = append(matchers, m.evaluate(ctx, input, target))
			}
		}
		var rr []*idm.Role
		var xx []*idm.Role
		for _, r := range input.Roles {
			if m.matchQueries(r, matchers) {
				rr = append(rr, r)
			} else {
				xx = append(xx, r)
			}
		}
		input.Roles = rr
		pass = len(input.Roles) > 0
		if len(xx) > 0 {
			op := input
			op.Roles = xx
			opposite = &op
		}

	case IdmSelectorType_Workspace:
		if len(input.Workspaces) == 0 {
			return input, nil, false
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.WorkspaceSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Workspaces = []*idm.Workspace{}
				return input, nil, false
			} else {
				matchers = append(matchers, m.evaluate(ctx, input, target))
			}
		}
		var ww []*idm.Workspace
		var xx []*idm.Workspace
		for _, w := range input.Workspaces {
			if m.matchQueries(w, matchers) {
				ww = append(ww, w)
			} else {
				xx = append(xx, w)
			}
		}
		input.Workspaces = ww
		pass = len(input.Workspaces) > 0
		if len(xx) > 0 {
			op := input
			op.Workspaces = xx
			opposite = &op
		}

	case IdmSelectorType_Acl:
		if len(input.Acls) == 0 {
			return input, nil, false
		}
		for _, an := range m.Query.SubQueries {
			target := &idm.ACLSingleQuery{}
			if e := ptypes.UnmarshalAny(an, target); e != nil {
				input.Acls = []*idm.ACL{}
				return input, nil, false
			} else {
				matchers = append(matchers, m.evaluate(ctx, input, target))
			}
		}
		var aa []*idm.ACL
		var xx []*idm.ACL
		for _, a := range input.Acls {
			if m.matchQueries(a, matchers) {
				aa = append(aa, a)
			} else {
				xx = append(xx, a)
			}
		}
		input.Acls = aa
		pass = len(input.Acls) > 0
		if len(xx) > 0 {
			op := input
			op.Acls = xx
			opposite = &op
		}

	default:
		break
	}


	return input, opposite, pass
}

func (m *IdmSelector) matchQueries(object interface{}, matchers []idm.Matcher) bool {
	var bb []bool
	for _, matcher := range matchers {
		bb = append(bb, matcher.Matches(object))
	}
	return service.ReduceQueryBooleans(bb, m.Query.Operation)
}

func (m *IdmSelector) cloneEvaluated(ctx context.Context, input ActionMessage, query *service.Query) *service.Query {
	if len(GetFieldEvaluators()) == 0 {
		return query
	}
	q := proto.Clone(m.Query).(*service.Query)
	for i, sub := range q.SubQueries {
		u := &idm.UserSingleQuery{}
		r := &idm.RoleSingleQuery{}
		ws := &idm.WorkspaceSingleQuery{}
		a := &idm.ACLSingleQuery{}
		if e:= ptypes.UnmarshalAny(sub, ws); e == nil {
			q.SubQueries[i], _ = ptypes.MarshalAny(m.evaluate(ctx, input, ws).(*idm.WorkspaceSingleQuery))
		} else if e:= ptypes.UnmarshalAny(sub, r); e == nil {
			q.SubQueries[i], _ = ptypes.MarshalAny(m.evaluate(ctx, input, r).(*idm.RoleSingleQuery))
		}else if e:= ptypes.UnmarshalAny(sub, u); e == nil {
			q.SubQueries[i], _ = ptypes.MarshalAny(m.evaluate(ctx, input, u).(*idm.UserSingleQuery))
		}else if e:= ptypes.UnmarshalAny(sub, a); e == nil {
			q.SubQueries[i], _ = ptypes.MarshalAny(m.evaluate(ctx, input, a).(*idm.ACLSingleQuery))
		}
	}
	return q
}

func (m *IdmSelector) evaluate(ctx context.Context, input ActionMessage, singleQuery interface{}) idm.Matcher {
	if uQ, o := singleQuery.(*idm.UserSingleQuery); o {
		uQ.Uuid = EvaluateFieldStr(ctx, input, uQ.Uuid)
		uQ.Login = EvaluateFieldStr(ctx, input, uQ.Login)
		uQ.AttributeValue = EvaluateFieldStr(ctx, input, uQ.AttributeValue)
		uQ.AttributeName = EvaluateFieldStr(ctx, input, uQ.AttributeName)
		uQ.HasRole = EvaluateFieldStr(ctx, input, uQ.HasRole)
		uQ.FullPath = EvaluateFieldStr(ctx, input, uQ.FullPath)
		uQ.GroupPath = EvaluateFieldStr(ctx, input, uQ.GroupPath)
		return uQ
	} else if rQ, o := singleQuery.(*idm.RoleSingleQuery); o {
		rQ.Uuid = EvaluateFieldStrSlice(ctx, input, rQ.Uuid)
		rQ.Label = EvaluateFieldStr(ctx, input, rQ.Label)
		return rQ
	} else if wQ, o := singleQuery.(*idm.WorkspaceSingleQuery); o {
		wQ.Label = EvaluateFieldStr(ctx, input, wQ.Label)
		wQ.Uuid = EvaluateFieldStr(ctx, input, wQ.Uuid)
		wQ.Description = EvaluateFieldStr(ctx, input, wQ.Description)
		wQ.Slug = EvaluateFieldStr(ctx, input, wQ.Slug)
		return wQ
	} else if aQ, o := singleQuery.(*idm.ACLSingleQuery); o {
		aQ.NodeIDs = EvaluateFieldStrSlice(ctx, input, aQ.NodeIDs)
		aQ.WorkspaceIDs = EvaluateFieldStrSlice(ctx, input, aQ.WorkspaceIDs)
		aQ.RoleIDs = EvaluateFieldStrSlice(ctx, input, aQ.RoleIDs)
		for _, ac := range aQ.Actions {
			ac.Name = EvaluateFieldStr(ctx, input, ac.Name)
			ac.Value = EvaluateFieldStr(ctx, input, ac.Value)
		}
		return aQ
	}
	return singleQuery.(idm.Matcher)
}