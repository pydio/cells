package idmtest

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/server/stubs/inject"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/propagator"
	srv "github.com/pydio/cells/v5/idm/policy/grpc"
)

// NewUsersService registers a mock - Warning, passed context must contain necessary data to resolve DAO
func NewPolicyService(ctx context.Context, svc service.Service) (grpc.ClientConnInterface, error) {

	serv := &idm.PolicyEngineServiceStub{
		PolicyEngineServiceServer: srv.NewHandler(),
	}
	mock := &inject.SvcInjectorMock{ClientConnInterface: serv, Svc: svc}
	ctx = propagator.With(ctx, service.ContextKey, svc)
	return mock, nil
}
