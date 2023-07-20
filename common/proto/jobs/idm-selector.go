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

package jobs

import (
	"context"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

func (m *IdmSelector) MultipleSelection() bool {
	return m.Collect
}

func (m *IdmSelector) SelectorID() string {
	return "IdmSelector"
}

func (m *IdmSelector) SelectorLabel() string {
	if m.Label != "" {
		return m.Label
	}
	return m.SelectorID()
}

func (m *IdmSelector) FilterID() string {
	return "IdmFilter"
}

func (m *IdmSelector) ApplyClearInput(msg *ActionMessage) *ActionMessage {
	switch m.Type {
	case IdmSelectorType_User:
		return msg.WithUser(nil)
	case IdmSelectorType_Role:
		return msg.WithRole(nil)
	case IdmSelectorType_Acl:
		return msg.WithAcl(nil)
	case IdmSelectorType_Workspace:
		return msg.WithWorkspace(nil)
	default:
		return msg
	}
}

// Select IDM Objects by a given query
func (m *IdmSelector) Select(ctx context.Context, input *ActionMessage, objects chan interface{}, done chan bool) error {

	defer func() {
		done <- true
	}()

	if m.FanOutInput {
		switch m.Type {
		case IdmSelectorType_User:
			for _, user := range input.Users {
				objects <- proto.Clone(user).(*idm.User)
			}
		case IdmSelectorType_Role:
			for _, role := range input.Roles {
				objects <- proto.Clone(role).(*idm.Role)
			}
		case IdmSelectorType_Workspace:
			for _, workspace := range input.Workspaces {
				objects <- proto.Clone(workspace).(*idm.Workspace)
			}
		case IdmSelectorType_Acl:
			for _, acl := range input.Acls {
				objects <- proto.Clone(acl).(*idm.ACL)
			}
		}
		return nil
	}

	var query *service.Query
	if m.Query != nil {
		query = m.cloneEvaluated(ctx, input, m.Query)
	} else if m.All {
		query = &service.Query{SubQueries: []*anypb.Any{}}
	}
	if query == nil {
		return nil
	}
	switch m.Type {
	case IdmSelectorType_User:
		userClient := idm.NewUserServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceUser))
		s, e := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: query})
		if e != nil {
			return e
		}
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
		roleClient := idm.NewRoleServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceRole))
		if s, e := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: query}); e != nil {
			return e
		} else {
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
		wsClient := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))
		if s, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query}); e != nil {
			return e
		} else {
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
		aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
		if s, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: query}); e != nil {
			return e
		} else {
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
func (m *IdmSelector) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {

	var opposite *ActionMessage

	if m.All && (m.Query == nil || len(m.Query.SubQueries) == 0) {
		return input, nil, true
	}
	multi := &service.MultiMatcher{}
	var pass bool

	switch m.Type {
	case IdmSelectorType_User:
		if len(input.Users) == 0 {
			return input, nil, false // break!
		}
		if er := multi.Parse(m.Query, func(o *anypb.Any) (service.Matcher, error) {
			target := &idm.UserSingleQuery{}
			if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
				return nil, e
			}
			return m.evaluate(ctx, input, target), nil
		}); er != nil {
			log.TasksLogger(ctx).Error(er.Error())
			input.Users = []*idm.User{}
			break
		}
		var uu, xx []*idm.User
		for _, u := range input.Users {
			if multi.Matches(u) {
				uu = append(uu, u)
			} else {
				xx = append(xx, u)
			}
		}
		input.Users = uu
		pass = len(input.Users) > 0
		if len(xx) > 0 {
			opposite = input.Clone()
			opposite.Users = xx
		}

	case IdmSelectorType_Role:
		if len(input.Roles) == 0 {
			return input, nil, false
		}
		if er := multi.Parse(m.Query, func(o *anypb.Any) (service.Matcher, error) {
			target := &idm.RoleSingleQuery{}
			if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
				return nil, e
			}
			return m.evaluate(ctx, input, target), nil
		}); er != nil {
			log.TasksLogger(ctx).Error(er.Error())
			input.Roles = []*idm.Role{}
			break
		}
		var rr, xx []*idm.Role
		for _, r := range input.Roles {
			if multi.Matches(r) {
				rr = append(rr, r)
			} else {
				xx = append(xx, r)
			}
		}
		input.Roles = rr
		pass = len(input.Roles) > 0
		if len(xx) > 0 {
			opposite = input.Clone()
			opposite.Roles = xx
		}

	case IdmSelectorType_Workspace:
		srcWW := input.Workspaces
		if len(srcWW) == 0 {
			// Special case: on node event, load workspace based on CtxWorkspaceUuid
			if ws, ok := m.WorkspaceFromEventContext(ctx); ok {
				srcWW = append(srcWW, ws)
			} else {
				return input, nil, false
			}
		}
		if er := multi.Parse(m.Query, func(o *anypb.Any) (service.Matcher, error) {
			target := &idm.WorkspaceSingleQuery{}
			if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
				return nil, e
			}
			return m.evaluate(ctx, input, target), nil
		}); er != nil {
			log.TasksLogger(ctx).Error(er.Error())
			input.Workspaces = []*idm.Workspace{}
			break
		}
		var ww, xx []*idm.Workspace
		for _, w := range srcWW {
			if multi.Matches(w) {
				ww = append(ww, w)
			} else {
				xx = append(xx, w)
			}
		}
		input.Workspaces = ww
		pass = len(input.Workspaces) > 0
		if len(xx) > 0 {
			opposite = input.Clone()
			opposite.Workspaces = xx
		}

	case IdmSelectorType_Acl:
		if len(input.Acls) == 0 {
			return input, nil, false
		}
		if er := multi.Parse(m.Query, func(o *anypb.Any) (service.Matcher, error) {
			target := &idm.ACLSingleQuery{}
			if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
				return nil, e
			}
			return m.evaluate(ctx, input, target), nil
		}); er != nil {
			log.TasksLogger(ctx).Error(er.Error())
			input.Acls = []*idm.ACL{}
			break
		}
		var aa, xx []*idm.ACL
		for _, a := range input.Acls {
			if multi.Matches(a) {
				aa = append(aa, a)
			} else {
				xx = append(xx, a)
			}
		}
		input.Acls = aa
		pass = len(input.Acls) > 0
		if len(xx) > 0 {
			opposite = input.Clone()
			opposite.Acls = xx
		}

	default:
		break
	}

	return input, opposite, pass
}

func (m *IdmSelector) cloneEvaluated(ctx context.Context, input *ActionMessage, query *service.Query) *service.Query {
	if len(GetFieldEvaluators()) == 0 {
		return query
	}
	q := proto.Clone(m.Query).(*service.Query)
	for i, sub := range q.SubQueries {
		u := &idm.UserSingleQuery{}
		r := &idm.RoleSingleQuery{}
		ws := &idm.WorkspaceSingleQuery{}
		a := &idm.ACLSingleQuery{}
		if e := anypb.UnmarshalTo(sub, ws, proto.UnmarshalOptions{}); e == nil {
			q.SubQueries[i], _ = anypb.New(m.evaluate(ctx, input, ws).(*idm.WorkspaceSingleQuery))
		} else if e := anypb.UnmarshalTo(sub, r, proto.UnmarshalOptions{}); e == nil {
			q.SubQueries[i], _ = anypb.New(m.evaluate(ctx, input, r).(*idm.RoleSingleQuery))
		} else if e := anypb.UnmarshalTo(sub, u, proto.UnmarshalOptions{}); e == nil {
			q.SubQueries[i], _ = anypb.New(m.evaluate(ctx, input, u).(*idm.UserSingleQuery))
		} else if e := anypb.UnmarshalTo(sub, a, proto.UnmarshalOptions{}); e == nil {
			q.SubQueries[i], _ = anypb.New(m.evaluate(ctx, input, a).(*idm.ACLSingleQuery))
		}
	}
	return q
}

func (m *IdmSelector) evaluate(ctx context.Context, input *ActionMessage, singleQuery interface{}) service.Matcher {
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
		wQ.LastUpdated = EvaluateFieldStr(ctx, input, wQ.LastUpdated)
		wQ.AttributeName = EvaluateFieldStr(ctx, input, wQ.AttributeName)
		wQ.AttributeValue = EvaluateFieldStr(ctx, input, wQ.AttributeValue)
		wQ.HasAttribute = EvaluateFieldStr(ctx, input, wQ.HasAttribute)
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
	return singleQuery.(service.Matcher)
}

// WorkspaceFromEventContext tries to find the CtxWorkspaceUuid key in the context metadata and if it is set,
// lookup actual workspace by UUID.
func (m *IdmSelector) WorkspaceFromEventContext(ctx context.Context) (*idm.Workspace, bool) {
	wsUuid, o := metadata.CanonicalMeta(ctx, servicecontext.CtxWorkspaceUuid)
	if !o || wsUuid == "ROOT" {
		return nil, false
	}
	ct, ca := context.WithCancel(ctx)
	defer ca()
	if ws, er := permissions.SearchUniqueWorkspace(ct, wsUuid, ""); er == nil {
		return ws, true
	} else {
		return nil, false
	}
}
