package api

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/pydio/cells/v4/common/client"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	server.ProxyURLMux().Register("caddy-api", &Opener{})
	server.ProxyURLMux().Register("caddy-api+tls", &Opener{tls: true})
}

type Opener struct {
	tls bool
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	if u.Host == "" {
		return nil, fmt.Errorf("empty host for proxy caddy-api")
	}
	if o.tls {
		return New(ctx, "https://"+u.Host)
	} else {
		return New(ctx, "http://"+u.Host)
	}
}

type Server struct {
	*caddy.RawServer
	routing.RouteRegistrar

	caddyApi string
	balancer clienthttp.Balancer
}

func New(ctx context.Context, caddyApi string) (server.Server, error) {

	srvID := "proxy" + "-" + uuid.New()
	srvMUX := routing.NewRouteRegistrar()

	srv := &Server{
		RawServer: caddy.New(ctx, srvID, "proxy", map[string]string{}),

		caddyApi:       caddyApi,
		RouteRegistrar: srvMUX,
	}

	return server.NewServer(ctx, srv), nil
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, er error) {

	reg := servicecontext.GetRegistry(s.RootContext())
	rc, _ := client.NewResolverCallback(reg)
	s.balancer = clienthttp.NewBalancer(s.ID())
	rc.Add(s.ReloadProxy)
	return nil, s.ReloadProxy(reg)

}

func (s *Server) ReloadProxy(reg registry.Registry) error {
	er := s.balancer.Build(reg)
	if er != nil {
		return er
	}
	caddyConfig, _, er := s.CaddyConfFromRoutes(func(endpoint string) ([]*url.URL, error) {
		return s.balancer.ListEndpointTargets(endpoint, true)
	}, true)
	if er != nil {
		return er
	}

	reader := bytes.NewReader(caddyConfig)
	resp, er := http.Post(s.caddyApi+"/load", "application/json", reader)
	if er != nil {
		return er
	}
	if resp.StatusCode != 200 {
		return fmt.Errorf("cannot post to caddy server, code was %d", resp.StatusCode)
	}
	return nil

}

func (s *Server) Clone() interface{} {
	clone := &Server{
		RawServer: s.RawServer.Clone().(*caddy.RawServer),
	}
	return clone
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*routing.RouteRegistrar); ok {
		*v = s.RouteRegistrar
		return true
	}
	return false
}
