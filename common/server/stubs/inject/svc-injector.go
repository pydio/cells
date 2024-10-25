package inject

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type SvcInjectorMock struct {
	grpc.ClientConnInterface
	Svc service.Service
}

func (s *SvcInjectorMock) Invoke(ctx context.Context, method string, args any, reply any, opts ...grpc.CallOption) error {
	ctx = propagator.With(ctx, service.ContextKey, s.Svc)
	return s.ClientConnInterface.Invoke(ctx, method, args, reply, opts...)
}

func (s *SvcInjectorMock) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	ctx = propagator.With(ctx, service.ContextKey, s.Svc)
	return s.ClientConnInterface.NewStream(ctx, desc, method, opts...)
}
