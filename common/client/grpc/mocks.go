package grpc

import (
	"context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health/grpc_health_v1"
)

var mox = map[string]grpc.ClientConnInterface{}

// RegisterMock registers a stubbed ClientConnInterface for a given service
func RegisterMock(serviceName string, mock grpc.ClientConnInterface) {
	mox[serviceName] = &mockHSWrapper{mock: mock}
}

type mockHSWrapper struct {
	mock grpc.ClientConnInterface
}

func (m *mockHSWrapper) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	if method == "/grpc.health.v1.Health/Check" {
		reply = grpc_health_v1.HealthCheckResponse{Status: grpc_health_v1.HealthCheckResponse_SERVING}
		return nil
	}
	return m.mock.Invoke(ctx, method, args, reply, opts...)
}

func (m *mockHSWrapper) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return m.mock.NewStream(ctx, desc, method, opts...)
}
