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
	"fmt"
	"strings"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	tenant2 "github.com/pydio/cells/v4/common/runtime/tenant"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/ckeys"
	metadata2 "github.com/pydio/cells/v4/common/service/context/metadata"
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
	var reg registry.Registry
	runtimecontext.Get(serverRuntimeContext, registry.ContextKey, &reg)
	return func(ctx context.Context) (context.Context, bool, error) {
		return runtimecontext.With(ctx, registry.ContextKey, reg), true, nil
	}
}

// TargetNameToServiceNameContext extracts service name from grpc meta "targetname" and inject it in the context
func TargetNameToServiceNameContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if tName := md.Get(ckeys.TargetServiceName); strings.Join(tName, "") != "" {
				return runtimecontext.WithServiceName(ctx, strings.Join(tName, "")), true, nil
			}
		}
		return ctx, false, nil
	}
}

var (
	clientConns = make(map[string]grpc.ClientConnInterface)
	configStore = make(map[string]config.Store)
)

func setContextForTenant(ctx context.Context) (context.Context, error) {
	tenantID := "default"
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if t := md.Get("tenant"); len(t) > 0 {
			tenantID = strings.Join(t, "")
		}
	}
	if mm, ok := metadata2.FromContextRead(ctx); ok {
		if p, ok := mm[common.XPydioTenantUuid]; ok {
			tenantID = p
		}
	}
	tenant, err := tenant2.GetManager().TenantByID(tenantID)
	if err != nil {
		return ctx, err
	}

	cc, ok := clientConns[tenantID]
	if !ok {
		var err error
		cc, err = grpc.Dial("xds://"+tenantID+".cells.com/cells",
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			// grpc.WithConnectParams(grpc.ConnectParams{MinConnectTimeout: 1 * time.Minute, Backoff: backoffConfig}),
			grpc.WithChainUnaryInterceptor(
				clientgrpc.ErrorNoMatchedRouteRetryUnaryClientInterceptor(),
				clientgrpc.ErrorFormatUnaryClientInterceptor(),
				servicecontext.OperationIdUnaryClientInterceptor(),
				clientgrpc.MetaUnaryClientInterceptor(),
			),
			grpc.WithChainStreamInterceptor(
				clientgrpc.ErrorNoMatchedRouteRetryStreamClientInterceptor(),
				clientgrpc.ErrorFormatStreamClientInterceptor(),
				servicecontext.OperationIdStreamClientInterceptor(),
				clientgrpc.MetaStreamClientInterceptor(),
			),
			grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
		)
		if err != nil {
			fmt.Println("And the error is ? ", err)
		}
		clientConns[tenantID] = cc
	}
	ctx = clientcontext.WithClientConn(ctx, cc)

	cfg, ok := configStore[tenantID]
	if !ok {
		if c, err := config.OpenStore(ctx, "xds://"+tenantID+".cells.com/cells"); err == nil {
			cfg = c
		} else {
			cfg = config.Main()
		}

		configStore[tenantID] = cfg
	}

	ctx = runtimecontext.With(ctx, config.ContextKey, cfg)
	ctx = runtimecontext.With(ctx, tenant2.ContextKey, tenant)

	return ctx, nil
}

func TenantIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		var err error
		ctx, err = setContextForTenant(ctx)
		return ctx, true, err
	}
}

func setContextForService(ctx context.Context) context.Context {
	service := "default"
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if t := md.Get("service"); len(t) > 0 {
			service = strings.Join(t, "")
		}
	}

	//c := servercontext.GetConfig(ctx)

	//ctx = context2.WithConfig(ctx, c.Val("services", service))
	ctx = runtimecontext.WithServiceName(ctx, service)
	return ctx
}

func ServiceIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		ctx = setContextForService(ctx)

		return ctx, true, nil
	}
}

func HandlerInterceptor() func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		var err error
		ctx, err = setContextForTenant(ctx)
		return ctx, true, err
	}
}
