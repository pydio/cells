package grpc

import (
	"context"
	"google.golang.org/grpc/health/grpc_health_v1"
	"log"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/runtime"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		srv, ok := ctx.Value("grpcServerKey").(*grpc.Server)
		if !ok {
			log.Println("Context does not contain server key")
			return
		}

		grpc_health_v1.RegisterHealthServer(srv, &Handler{})
	})
}
