package middleware

import (
	"context"

	"google.golang.org/grpc"
	"google.golang.org/grpc/stats"
)

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
