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

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
)

func (m *UsersSelector) MultipleSelection() bool {
	return m.Collect
}

// Select performs a query on the User Service to load a list of users. The more generic IdmSelector should be used instead.
func (m *UsersSelector) Select(cl client.Client, ctx context.Context, input ActionMessage, objects chan interface{}, done chan bool) error {

	defer func() {
		done <- true
	}()
	// Push Claims in Context to impersonate this user
	var query *service.Query
	if len(m.Users) > 0 {
		queries := []*any.Any{}
		for _, user := range m.Users {
			if user.Login != "" {
				q, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: user.Login})
				queries = append(queries, q)
			} else if user.Uuid != "" {
				q, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: user.Uuid})
				queries = append(queries, q)
			}
		}
		query = &service.Query{SubQueries: queries}
	} else if m.Query != nil {
		query = m.Query
	} else if m.All {
		query = &service.Query{SubQueries: []*any.Any{}}
	}
	if query == nil {
		return nil
	}
	userClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, cl)
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

	return nil
}

// Filter is not implemented. Use IdmSelector object instead
func (n *UsersSelector) Filter(ctx context.Context, input ActionMessage) (ActionMessage, bool) {
	return input, true
}
