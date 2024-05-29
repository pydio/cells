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

package middleware

import (
	"context"
	"net/http"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service/metrics"
)

func HttpWrapperMetrics(ctx context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scope := metrics.GetMetricsForService(runtime.GetServiceName(r.Context()))
		scope.Counter("rest_calls").Inc(1)
		tsw := scope.Timer("rest_time").Start()
		defer tsw.Stop()
		h.ServeHTTP(w, r)
	})
}

type ServiceRetriever interface {
	ServiceName() string
}

func MetricsUnaryServerInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		if meta, ok := metadata.FromIncomingContext(ctx); ok {
			if serviceName, ok2 := meta["service"]; ok2 {
				scope := metrics.GetMetricsForService(strings.Join(serviceName, ""))
				scope.Counter("grpc_calls").Inc(1)
				tsw := scope.Timer("grpc_time").Start()
				defer tsw.Stop()
			}
		}
		return handler(ctx, req)
	}
}

func MetricsStreamServerInterceptor() grpc.StreamServerInterceptor {
	return func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		// srv, ok := info.(ServiceRetriever)
		// if ok {
		// 	scope := metrics.GetMetricsForService(srv.ServiceName())
		//	if scope != tally.NoopScope {
		//		scope.Counter("grpc_calls").Inc(1)
		//		tsw := scope.Timer("grpc_time").Start()
		//		defer tsw.Stop()
		//	}
		//}

		return handler(srv, stream)
	}
}
