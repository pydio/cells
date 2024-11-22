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

package idmtest

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/server/stubs/inject"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/propagator"
	srv "github.com/pydio/cells/v5/idm/user/grpc"
)

// NewUsersService registers a mock - Warning, passed context must contain necessary data to resolve DAO
func NewUsersService(ctx context.Context, svc service.Service, users ...*idm.User) (grpc.ClientConnInterface, error) {

	serv := &idm.UserServiceStub{
		UserServiceServer: srv.NewHandler(),
	}
	mock := &inject.SvcInjectorMock{ClientConnInterface: serv, Svc: svc}
	ctx = propagator.With(ctx, service.ContextKey, svc)
	for _, u := range users {
		_, er := serv.UserServiceServer.CreateUser(ctx, &idm.CreateUserRequest{User: u})
		if er != nil {
			return nil, er
		}
	}
	return mock, nil
}
