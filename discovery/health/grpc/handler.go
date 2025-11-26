package grpc

import (
	"context"
	"fmt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"google.golang.org/grpc/health/grpc_health_v1"
)

type Handler struct{}

func (h *Handler) List(ctx context.Context, request *grpc_health_v1.HealthListRequest) (*grpc_health_v1.HealthListResponse, error) {
	return nil, status.Error(codes.Unimplemented, "not implemented")
}

func (h *Handler) Check(ctx context.Context, req *grpc_health_v1.HealthCheckRequest) (*grpc_health_v1.HealthCheckResponse, error) {
	fmt.Println("health checking")
	return &grpc_health_v1.HealthCheckResponse{
		Status: grpc_health_v1.HealthCheckResponse_SERVING,
	}, nil
}

func (h *Handler) Watch(req *grpc_health_v1.HealthCheckRequest, w grpc_health_v1.Health_WatchServer) error {

	return nil
}
