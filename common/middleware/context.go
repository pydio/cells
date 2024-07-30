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
	"net/http"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	tenant2 "github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

// ClientConnIncomingContext adds the ClientConn to context
func ClientConnIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	clientConn := runtime.GetClientConn(serverRuntimeContext)
	return func(ctx context.Context) (context.Context, bool, error) {
		return runtime.WithClientConn(ctx, clientConn), true, nil
	}
}

// RegistryIncomingContext injects the registry in context
func RegistryIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	var reg registry.Registry
	propagator.Get(serverRuntimeContext, registry.ContextKey, &reg)
	return func(ctx context.Context) (context.Context, bool, error) {
		return propagator.With(ctx, registry.ContextKey, reg), true, nil
	}
}

// TargetNameToServiceNameContext extracts service name from grpc meta "targetname" and inject it in the context
func TargetNameToServiceNameContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if tName := md.Get(common.CtxTargetServiceName); strings.Join(tName, "") != "" {
				return runtime.WithServiceName(ctx, strings.Join(tName, "")), true, nil
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
	if mm, ok := propagator.FromContextRead(ctx); ok {
		if p, ok := mm[common.XPydioTenantUuid]; ok {
			tenantID = p
		}
	}
	tenant, err := tenant2.GetManager().TenantByID(tenantID)
	if err != nil {
		return ctx, err
	}

	/* TODO - Replace by pool? Should this be initialized here? ping @charles after refactoring this
	cc, ok := clientConns[tenantID]
	if !ok {
		var err error
		opts := []grpc.DialOption{
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			// grpc.WithConnectParams(grpc.ConnectParams{MinConnectTimeout: 1 * time.Minute, Backoff: backoffConfig}),
			grpc.WithChainUnaryInterceptor(
				ErrorNoMatchedRouteRetryUnaryClientInterceptor(),
				ErrorFormatUnaryClientInterceptor(),
				propagator.MetaUnaryClientInterceptor(common.CtxCellsMetaPrefix),
			),
			grpc.WithChainStreamInterceptor(
				ErrorNoMatchedRouteRetryStreamClientInterceptor(),
				ErrorFormatStreamClientInterceptor(),
				propagator.MetaStreamClientInterceptor(common.CtxCellsMetaPrefix),
			),
		}
		opts = append(opts, GrpcClientStatsHandler(nil)...)
		cc, err = grpc.NewClient("xds://"+tenantID+".cells.com/cells", opts...)
		if err != nil {
			fmt.Println("And the error is ? ", err)
		}
		clientConns[tenantID] = cc
	}
	ctx = runtime.WithClientConn(ctx, cc)

	cfg, ok := configStore[tenantID]
	if !ok {
		if c, err := config.OpenStore(ctx, "xds://"+tenantID+".cells.com/cells"); err == nil {
			cfg = c
		} else {
			cfg = config.Main()
		}

		configStore[tenantID] = cfg
	}

	ctx = propagator.With(ctx, config.ContextKey, cfg)*/
	ctx = propagator.With(ctx, tenant2.ContextKey, tenant)

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
	ctx = runtime.WithServiceName(ctx, service)
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

func WebTenantMiddleware(ctx context.Context, endpoint string, serviceContextKey any, srv server.Server, h http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		ctx := propagator.ForkContext(req.Context(), ctx)

		var reg registry.Registry
		propagator.Get(ctx, registry.ContextKey, &reg)

		path := strings.TrimSuffix(req.RequestURI, req.URL.Path)
		if endpoint != "" {
			path = endpoint
		}

		endpoints := reg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{srv}),
			registry.WithAdjacentTargetOptions(registry.WithName(path), registry.WithType(pb.ItemType_ENDPOINT)),
		)

		for _, ep := range endpoints {
			services := reg.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{ep}),
				registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
			)

			if len(services) != 1 {
				continue
			}

			ctx = propagator.With(ctx, serviceContextKey, services[0])
		}

		ctx, _, _ = TenantIncomingContext(nil)(ctx)

		h.ServeHTTP(rw, req.WithContext(ctx))
	})
}
