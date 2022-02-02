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

	"github.com/pydio/cells/v4/common/client/grpc"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
)

func (m *UsersSelector) MultipleSelection() bool {
	return m.Collect
}

// Select performs a query on the User Service to load a list of users. The more generic IdmSelector should be used instead.
func (m *UsersSelector) Select(ctx context.Context, input ActionMessage, objects chan interface{}, done chan bool) error {

	defer func() {
		done <- true
	}()
	// Push Claims in Context to impersonate this user
	var query *service.Query
	if len(m.Users) > 0 {
		var queries []*anypb.Any
		for _, user := range m.Users {
			if user.Login != "" {
				q, _ := anypb.New(&idm.UserSingleQuery{Login: user.Login})
				queries = append(queries, q)
			} else if user.Uuid != "" {
				q, _ := anypb.New(&idm.UserSingleQuery{Uuid: user.Uuid})
				queries = append(queries, q)
			}
		}
		query = &service.Query{SubQueries: queries}
	} else if m.Query != nil {
		query = m.Query
	} else if m.All {
		query = &service.Query{SubQueries: []*anypb.Any{}}
	}
	if query == nil {
		return nil
	}
	userClient := idm.NewUserServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceUser))
	s, e := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: query})
	if e != nil {
		return e
	}
	defer s.CloseSend()
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

	return nil
}

// Filter is not implemented. Use IdmSelector object instead
func (n *UsersSelector) Filter(ctx context.Context, input ActionMessage) (ActionMessage, bool) {
	return input, true
}
