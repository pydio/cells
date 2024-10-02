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

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/stats"
	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v4/common/runtime"
)

func init() {
	RegisterStatsHandler(func(ctx context.Context, isClient bool) stats.Handler {
		if isClient {
			return &customHandler{Handler: otelgrpc.NewClientHandler(), isClient: true}
		} else {
			return &customHandler{Handler: otelgrpc.NewServerHandler(), isClient: false}
		}
	})
}

type statsHandlers func(ctx context.Context, isClient bool) stats.Handler

var (
	st []statsHandlers
)

func RegisterStatsHandler(h statsHandlers) {
	st = append(st, h)
}

func GrpcServerStatsHandler(ctx context.Context) (oo []grpc.ServerOption) {
	if ctx == nil {
		ctx = context.Background()
	}
	for _, h := range st {
		oo = append(oo, grpc.StatsHandler(h(ctx, false)))
	}
	return
}

func GrpcClientStatsHandler(ctx context.Context) (oo []grpc.DialOption) {
	if ctx == nil {
		ctx = context.Background()
	}
	for _, h := range st {
		oo = append(oo, grpc.WithStatsHandler(h(ctx, true)))
	}
	return
}

// SpanFromContext reads trace.SpanContext from context
func SpanFromContext(ctx context.Context) trace.SpanContext {
	return trace.SpanContextFromContext(ctx)
}

// HttpTracingMiddleware enabled tracing on HTTP server
func HttpTracingMiddleware(operation string) func(h http.Handler) http.Handler {
	return otelhttp.NewMiddleware(operation)
}

type customHandler struct {
	stats.Handler
	isClient bool
}

func (cs *customHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
	// Check if this is the end of an RPC call
	if end, ok := s.(*stats.End); ok {
		if cs.isClient {
			// Client : find service name
			if svc := runtime.GetServiceName(ctx); svc != "" {
				span := trace.SpanFromContext(ctx)
				span.SetAttributes(attribute.String("pydio.service.name", svc))
			}
		} else {
			// Server, find the service key
			if md, o := metadata.FromIncomingContext(ctx); o {
				if svc, set := md["service"]; set {
					span := trace.SpanFromContext(ctx)
					span.SetAttributes(attribute.String("pydio.service.name", svc[0]))
				}
			}
		}
		if cs.isClient && end.Error != nil && status.Code(end.Error) == codes.Canceled {
			end.Error = nil
			cs.Handler.HandleRPC(ctx, end)
			return
		}
	}
	cs.Handler.HandleRPC(ctx, s)
}
