package mux

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"google.golang.org/grpc"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/caddyserver/caddy/v2/caddyconfig/httpcaddyfile"
	"github.com/caddyserver/caddy/v2/modules/caddyhttp"
	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/maintenance"
	servercontext "github.com/pydio/cells/v4/common/server/context"
)

func RegisterServerMux(ctx context.Context, s server.HttpMux) {
	caddy.RegisterModule(Middleware{
		c: clientcontext.GetClientConn(ctx),
		r: servercontext.GetRegistry(ctx),
		s: s,
	})
	httpcaddyfile.RegisterHandlerDirective("mux", parseCaddyfile)
}

type Middleware struct {
	c grpc.ClientConnInterface
	r registry.Registry
	s server.HttpMux
}

// CaddyModule returns the Caddy module information.
func (m Middleware) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID:  "http.handlers.mux",
		New: func() caddy.Module { return &m },
	}
}

// Provision adds routes to the main server
func (m Middleware) Provision(ctx caddy.Context) error {
	return nil
}

// ServeHTTP implements caddyhttp.MiddlewareHandler.
func (m Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next caddyhttp.Handler) error {

	// Special case for application/grpc
	if strings.Contains(r.Header.Get("Content-Type"), "application/grpc") {
		// TODO V4 ?
		gserv, e := m.r.Get(common.ServiceGatewayGrpc, registry.WithType(pb.ItemType_SERVICE))
		if e != nil || gserv == nil {
			http.NotFound(w, r)
			return nil
		}
		gs := gserv.(registry.Service)
		if len(gs.Nodes()) == 0 {
			http.NotFound(w, r)
			return nil
		}
		node := gs.Nodes()[0]
		u, err := url.Parse("https://localhost" + strings.Replace(node.Address()[0], "[::]", "", -1))
		if err != nil {
			return err
		}
		proxy := httputil.NewSingleHostReverseProxy(u)
		proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
			fmt.Println("Got Error in Grpc Reverse Proxy:", err.Error())
		}

		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		proxy.ServeHTTP(w, r.WithContext(ctx))
		return nil
	}

	if r.RequestURI == "/maintenance.html" && r.Header.Get("X-Maintenance-Redirect") != "" {
		bb, _ := maintenance.Assets.ReadFile("maintenance.html")
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.WriteHeader(303)
		w.Write(bb)
		return nil
	}

	// try to find it in the current mux
	_, pattern := m.s.Handler(r)
	if len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		m.s.ServeHTTP(w, r.WithContext(ctx))
		return nil
	}

	// Couldn't find it in the mux, we go through the registered endpoints
	nodes, err := m.r.List(registry.WithType(pb.ItemType_NODE))
	if err != nil {
		return err
	}

	for _, item := range nodes {
		node, ok := item.(registry.Node)
		if !ok {
			continue
		}
		for _, endpoint := range node.Endpoints() {
			if endpoint == "/" {
				continue
			}
			if strings.HasPrefix(r.URL.Path, endpoint) {
				// TODO v4 - proxy should be set once when watching the node
				u, err := url.Parse("http://" + strings.Replace(node.Address()[0], "[::]", "", -1))
				if err != nil {
					return err
				}
				proxy := httputil.NewSingleHostReverseProxy(u)
				proxy.ServeHTTP(w, r)
				return nil
			}
		}
	}

	// no matching filter found
	return next.ServeHTTP(w, r)
}

// UnmarshalCaddyfile implements caddyfile.Unmarshaler.
func (m Middleware) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	/*for d.Next() {
		if !d.Args(&m.Output) {
			return d.ArgErr()
		}
	}*/
	return nil
}

func (m Middleware) WrapListener(ln net.Listener) net.Listener {
	fmt.Println("The address is ? ", ln.Addr())
	return ln
}

// parseCaddyfile unmarshals tokens from h into a new Middleware.
func parseCaddyfile(h httpcaddyfile.Helper) (caddyhttp.MiddlewareHandler, error) {
	var m Middleware
	err := m.UnmarshalCaddyfile(h.Dispenser)
	return m, err
}
