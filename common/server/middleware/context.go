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
	"github.com/pydio/cells/v4/common"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/ckeys"
	metadata2 "github.com/pydio/cells/v4/common/service/context/metadata"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"strings"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
)

// ClientConnIncomingContext adds the ClientConn to context
func ClientConnIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	clientConn := clientcontext.GetClientConn(serverRuntimeContext)
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
			if tName := md.Get(ckeys.TargetServiceName); strings.Join(tName, "") != "" {
				return servicecontext.WithServiceName(ctx, strings.Join(tName, "")), true, nil
			}
		}
		return ctx, false, nil
	}
}

var (
	clientConns = make(map[string]grpc.ClientConnInterface)
	configStore = make(map[string]config.Store)
)

func setContextForTenant(ctx context.Context) context.Context {
	tenant := "default"
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if t := md.Get("tenant"); len(t) > 0 {
			tenant = strings.Join(t, "")
		}
	}
	if mm, ok := metadata2.FromContextRead(ctx); ok {
		if p, ok := mm[common.XPydioTenantUuid]; ok {
			tenant = p
		}
	}

	cc, ok := clientConns[tenant]
	if !ok {
		cc, _ = grpc.Dial("xds://"+tenant+".cells.com/cells",
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			// grpc.WithConnectParams(grpc.ConnectParams{MinConnectTimeout: 1 * time.Minute, Backoff: backoffConfig}),
			grpc.WithChainUnaryInterceptor(
				clientgrpc.ErrorNoMatchedRouteRetryUnaryClientInterceptor(),
				clientgrpc.ErrorFormatUnaryClientInterceptor(),
				servicecontext.SpanUnaryClientInterceptor(),
				clientgrpc.MetaUnaryClientInterceptor(),
				otelgrpc.UnaryClientInterceptor(),
			),
			grpc.WithChainStreamInterceptor(
				clientgrpc.ErrorNoMatchedRouteRetryStreamClientInterceptor(),
				clientgrpc.ErrorFormatStreamClientInterceptor(),
				servicecontext.SpanStreamClientInterceptor(),
				clientgrpc.MetaStreamClientInterceptor(),
				otelgrpc.StreamClientInterceptor(),
			),
		)
		clientConns[tenant] = cc
	}
	ctx = clientcontext.WithClientConn(ctx, cc)

	cfg, ok := configStore[tenant]
	if !ok {
		cfg, _ = config.OpenStore(ctx, "xds://"+tenant+".cells.com/cells")
		configStore[tenant] = cfg
	}
	ctx = servercontext.WithConfig(ctx, cfg)

	return ctx
}

func TenantIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		ctx = setContextForTenant(ctx)

		return ctx, true, nil
	}
}

func HandlerInterceptor() func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		ctx = setContextForTenant(ctx)

		return ctx, true, nil
	}
}
