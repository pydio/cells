/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health/grpc_health_v1"
)

var mox = map[string]grpc.ClientConnInterface{}

// RegisterMock registers a stubbed ClientConnInterface for a given service
func RegisterMock(serviceName string, mock grpc.ClientConnInterface) {
	mox[serviceName] = &mockHSWrapper{mock: mock}
}

type mockHSWrapper struct {
	mock grpc.ClientConnInterface
}

func (m *mockHSWrapper) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	if method == "/grpc.health.v1.Health/Check" {
		reply = grpc_health_v1.HealthCheckResponse{Status: grpc_health_v1.HealthCheckResponse_SERVING}
		return nil
	}
	return m.mock.Invoke(ctx, method, args, reply, opts...)
}

func (m *mockHSWrapper) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return m.mock.NewStream(ctx, desc, method, opts...)
}
