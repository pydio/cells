package server

import (
	"context"

	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
)

func NewReadyzServer(hs *health.Server) ReadyzServer {
	return &readyzServer{
		hs: hs,
	}
}

type readyzServer struct {
	hs *health.Server
	UnimplementedReadyzServer
}

func (r *readyzServer) Ready(ctx context.Context, request *ReadyCheckRequest) (*ReadyCheckResponse, error) {
	hs, er := r.hs.Check(ctx, request.HealthCheckRequest)
	if er != nil {
		return nil, er
	}
	resp := &ReadyCheckResponse{
		HealthCheckResponse: hs,
	}
	switch hs.GetStatus() {
	case grpc_health_v1.HealthCheckResponse_SERVICE_UNKNOWN, grpc_health_v1.HealthCheckResponse_UNKNOWN:
		resp.ReadyStatus = ReadyStatus_Unknown
	case grpc_health_v1.HealthCheckResponse_NOT_SERVING:
		resp.ReadyStatus = ReadyStatus_NotReady
	case grpc_health_v1.HealthCheckResponse_SERVING:
		resp.ReadyStatus = ReadyStatus_Ready
	}
	return resp, nil
}
