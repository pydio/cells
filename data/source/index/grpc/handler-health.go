package grpc

import (
	"context"

	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/data/source"
)

// Ready implements ReadyzServer.Ready by adding a stat on the index root node
func (s *TreeServer) Ready(ctx context.Context, req *server.ReadyCheckRequest) (*server.ReadyCheckResponse, error) {
	healthResp, e := s.HealthServer.Check(ctx, &grpc_health_v1.HealthCheckRequest{})
	if e != nil {
		return &server.ReadyCheckResponse{
			HealthCheckResponse: healthResp,
			ReadyStatus:         server.ReadyStatus_NotReady,
		}, errors.Tag(e, errors.HealthCheckError)
	}
	// ?eed to consider that in terms of multi-DS context
	var ds string
	if ok := propagator.Get(ctx, source.DataSourceContextKey, &ds); ok {
		// Check corresponding datasource
		if _, e = s.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/"}}); e != nil {
			return &server.ReadyCheckResponse{
				HealthCheckResponse: healthResp,
				ReadyStatus:         server.ReadyStatus_NotReady,
				Components: map[string]*server.ComponentStatus{
					"db": {ReadyStatus: server.ReadyStatus_NotReady, Details: "cannot connect to DB: " + e.Error()},
				},
			}, errors.Tag(e, errors.HealthCheckError)
		}
	}
	return &server.ReadyCheckResponse{
		HealthCheckResponse: healthResp,
		ReadyStatus:         server.ReadyStatus_Ready,
		Components: map[string]*server.ComponentStatus{
			"db": {ReadyStatus: server.ReadyStatus_Ready, Details: "could read root node from DB"},
		},
	}, nil
}
