package http

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/middleware"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/caddy/maintenance"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var grpcTransport = &http.Transport{
	TLSClientConfig:   &tls.Config{InsecureSkipVerify: true},
	ForceAttemptHTTP2: true,
}

type Resolver interface {
	ServeHTTP(w http.ResponseWriter, r *http.Request) (bool, error)
	Init(ctx context.Context, serverID string, rr routing.RouteRegistrar)
	Stop()
}

// Mux wraps a standard MUX as an interface
type Mux interface {
	Handler(r *http.Request) (h http.Handler, pattern string)
	ServeHTTP(w http.ResponseWriter, r *http.Request)
}

// NewResolver creates an http resolver; If rootOnNotFound is set, non-matching patterns
// will be rewritten to base path and resolver will be run against it
func NewResolver() Resolver {
	return &resolver{}
}

type cachedProxy struct {
	target string
	*httputil.ReverseProxy
}

type resolver struct {
	c            grpc.ClientConnInterface
	r            registry.Registry
	rr           routing.RouteRegistrar
	s            Mux
	b            Balancer
	rc           client.ResolverCallback
	monitorOAuth grpc2.HealthMonitor
	monitorUser  grpc2.HealthMonitor
	userReady    bool

	proxiesCache []*cachedProxy
}

func (m *resolver) Init(ctx context.Context, serverID string, rr routing.RouteRegistrar) {

	conn := runtime.GetClientConn(ctx)

	var reg registry.Registry
	propagator.Get(ctx, registry.ContextSOTWKey, &reg)
	rc, _ := client.NewResolverCallback(reg)

	bal := NewBalancer(ctx, serverID)
	rc.Add(bal.Build)

	m.c = conn
	m.rc = rc
	m.r = reg
	m.rr = rr
	m.b = bal

	// todo
	/*
		if runtime.LastInitType() != "install" {
			m.monitorOAuth = grpc2.NewHealthCheckerWithRetries(ctx, 5*time.Second, 30*time.Second)
			m.monitorUser = grpc2.NewHealthCheckerWithRetries(ctx, 5*time.Second, 30*time.Second)

			go m.monitorOAuth.Monitor(common.ServiceOAuth)
			go m.monitorUser.Monitor(common.ServiceUser)
		}
	*/

}

func (m *resolver) Stop() {
	if m.rc != nil {
		m.rc.Stop()
	}
	if m.monitorOAuth != nil {
		m.monitorOAuth.Stop()
	}
	if m.monitorUser != nil {
		m.monitorUser.Stop()
	}
}

func (m *resolver) ServeHTTP(w http.ResponseWriter, r *http.Request) (bool, error) {

	r, er := middleware.ApplyHTTPIncomingContextModifiers(r)
	if er != nil {
		return false, er
	}

	ctx := propagator.WithAdditionalMetadata(r.Context(), map[string]string{
		common.XPydioSiteHash: r.Header.Get(common.XPydioSiteHash),
	})

	r = r.WithContext(ctx)
	// This may rewrite the request, by resolving the underlying endpoints
	m.rr.ApplyRewrites(r)

	// Special case for application/grpc
	if strings.Contains(r.Header.Get("Content-Type"), "application/grpc") {
		proxyTarget, e := m.b.PickService(common.ServiceGatewayGrpc)
		if e != nil {
			http.NotFound(w, r)
			return false, fmt.Errorf("cannot find grpc gateway")
		}
		proxy := m.getProxy(proxyTarget)
		// We assume that internally, the GRPCs service is serving self-signed
		proxy.Transport = grpcTransport
		// Wrap context and server request
		ctx = runtime.WithClientConn(ctx, m.c)
		ctx = propagator.With(ctx, registry.ContextKey, m.r)
		proxy.ServeHTTP(w, r.WithContext(ctx))
		return true, nil
	}

	if (m.monitorOAuth != nil && !m.monitorOAuth.Up()) || (m.monitorUser != nil && !m.monitorUser.Up()) {
		var bb []byte
		if strings.Contains(r.Header.Get("Accept"), "text/html") {
			if !m.monitorOAuth.Up() {
				log.Logger(ctx).Warn("Returning server is starting because grpc.oauth monitor is not Up")
			} else {
				log.Logger(ctx).Warn("Returning server is starting because grpc.user service is not ready")
			}
			bb, _ = maintenance.Assets.ReadFile("starting.html")
			w.Header().Set("Content-Type", "text/html")
		} else {
			er := &rest.Error{
				Code:   "503",
				Title:  "Server is starting",
				Detail: "Server is starting, please retry later",
			}
			bb, _ = json.Marshal(er)
			w.Header().Set("Content-Type", "application/json")
		}
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.Header().Set("Retry-After", "10")
		w.WriteHeader(503)
		_, er := w.Write(bb)
		return true, er
	}

	if r.RequestURI == "/maintenance.html" && r.Header.Get("X-Maintenance-Redirect") != "" {
		bb, _ := maintenance.Assets.ReadFile("maintenance.html")
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.WriteHeader(503)
		_, er := w.Write(bb)
		return true, er
	}

	// try to find it in the current mux
	ctx = runtime.WithClientConn(ctx, m.c)
	ctx = propagator.With(ctx, registry.ContextKey, m.r)

	if m.s == nil {
		mu := http.NewServeMux()
		m.rr.IteratePatterns(func(pattern string, handler http.Handler) {
			// Wrap handler in OTEL middleware
			otl := middleware.HttpTracingMiddleware(pattern)
			mu.Handle(pattern, otl(handler))
		})
		m.s = mu
	}
	// fmt.Println(r.URL.Path, r.RequestURI)
	// Try to match pattern - Custom check for "/" : must be exactly /
	if h, pattern := m.s.Handler(r); len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		h.ServeHTTP(w, r.WithContext(ctx))
		return true, nil
	}

	proxyTarget, e := m.b.PickEndpoint(r.URL.Path)
	if e == nil {
		m.getProxy(proxyTarget).ServeHTTP(w, r.WithContext(ctx))
		return true, nil
	}

	if m.rr.CanRewriteAndCatchAll(r) {
		if h, pat := m.s.Handler(r); len(pat) > 0 {
			h.ServeHTTP(w, r)
			return true, nil
		}
	}

	return false, nil
}

func (m *resolver) getProxy(url *url.URL) *httputil.ReverseProxy {
	for _, p := range m.proxiesCache {
		if p.target == url.String() {
			return p.ReverseProxy
		}
	}
	proxy := httputil.NewSingleHostReverseProxy(url)
	proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
		if err.Error() == "context canceled" {
			return
		}
		log.Logger(request.Context()).Error("Proxy Error :"+err.Error(), zap.Error(err))
		writer.WriteHeader(http.StatusBadGateway)
	}
	m.proxiesCache = append(m.proxiesCache, &cachedProxy{target: url.String(), ReverseProxy: proxy})
	return proxy
}

func (m *resolver) rewriteToRoot(r *http.Request) {
	r.URL.Path = "/"
	r.URL.RawPath = "/"
	r.RequestURI = r.URL.RequestURI()
}

func (m *resolver) userServiceReady() bool {
	if m.userReady {
		return true
	}
	/// Detect service grpc.user is ready
	if ss, e := m.r.List(
		registry.WithName(common.ServiceGrpcNamespace_+common.ServiceUser),
		registry.WithType(pb.ItemType_SERVICE),
		registry.WithMeta(registry.MetaStatusKey, string(registry.StatusReady))); e == nil && len(ss) > 0 {
		m.userReady = true
		return true
	}
	return false
}
