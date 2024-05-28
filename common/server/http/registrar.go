package http

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

// NewRegistrar creates a routing.RouteRegistrar wrapped with registry
func NewRegistrar(ctx context.Context, serverID string) routing.RouteRegistrar {
	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)
	base := routing.NewRouteRegistrar()
	return &regRegistrar{
		RouteRegistrar: base,
		reg:            reg,
		srvID:          serverID,
	}
}

type regRegistrar struct {
	routing.RouteRegistrar
	reg   registry.Registry
	srvID string
}

type regRoute struct {
	routing.Route
	reg   registry.Registry
	srvID string
}

// Route overrides parent to wrap Route
func (r *regRegistrar) Route(id string) routing.Route {
	route := r.RouteRegistrar.Route(id)
	return &regRoute{
		Route: route,
		srvID: r.srvID,
		reg:   r.reg,
	}
}

func (r *regRoute) Handle(pattern string, handler http.Handler, opts ...routing.HandleOption) {
	r.Route.Handle(pattern, handler, opts...)
	ep := util.CreateEndpoint(r.Route.Endpoint(pattern), handler, map[string]string{"type": "http"})
	_ = r.reg.Register(ep, registry.WithEdgeTo(r.srvID, "server", map[string]string{"serverType": "http"}))
}
