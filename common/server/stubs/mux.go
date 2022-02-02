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

package stubs

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/grpc"
)

type MuxService struct {
	servers map[string]grpc.ClientConnInterface
}

func (m *MuxService) Register(serviceName string, conn grpc.ClientConnInterface) {
	if m.servers == nil {
		m.servers = make(map[string]grpc.ClientConnInterface)
	}
	m.servers[serviceName] = conn
}

func (m *MuxService) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	if m.servers == nil {
		return fmt.Errorf("mux service not has no registers")
	}
	srvName := strings.Split(strings.TrimLeft(method, "/"), "/")[0]
	if conn, ok := m.servers[srvName]; ok {
		return conn.Invoke(ctx, method, args, reply, opts...)
	} else {
		return fmt.Errorf("cannot find associated service for " + srvName)
	}
}

func (m *MuxService) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	if m.servers == nil {
		return nil, fmt.Errorf("mux service not has no registers")
	}
	srvName := strings.Split(strings.TrimLeft(method, "/"), "/")[0]
	if conn, ok := m.servers[srvName]; ok {
		return conn.NewStream(ctx, desc, method, opts...)
	} else {
		return nil, fmt.Errorf("cannot find associated service for " + srvName)
	}
}
