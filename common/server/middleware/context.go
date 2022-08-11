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

package middleware

import (
	"context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"strings"

	servercontext "github.com/pydio/cells/v4/common/server/context"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
)

// ClientConnIncomingContext adds the ClientConn to context
func ClientConnIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	var clientConn grpc.ClientConnInterface
	clientcontext.GetClientConn(serverRuntimeContext, &clientConn)
	return func(ctx context.Context) (context.Context, bool, error) {
		return clientcontext.WithClientConn(ctx, clientConn), true, nil
	}
}

// RegistryIncomingContext injects the registry in context
func RegistryIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	registry := servercontext.GetRegistry(serverRuntimeContext)
	return func(ctx context.Context) (context.Context, bool, error) {
		return servercontext.WithRegistry(ctx, registry), true, nil
	}
}

// TargetNameToServiceNameContext extracts service name from grpc meta "targetname" and inject it in the context
func TargetNameToServiceNameContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if tName := md.Get("targetname"); strings.Join(tName, "") != "" {
				return servicecontext.WithServiceName(ctx, strings.Join(tName, "")), true, nil
			}
		}
		return ctx, false, nil
	}
}
