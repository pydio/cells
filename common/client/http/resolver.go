package http

import (
	"context"
	"crypto/tls"
	"fmt"
	"google.golang.org/grpc"
	"net/http"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/maintenance"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var grpcTransport = &http.Transport{
	TLSClientConfig:   &tls.Config{InsecureSkipVerify: true},
	ForceAttemptHTTP2: true,
}

type Resolver interface {
	ServeHTTP(w http.ResponseWriter, r *http.Request) (bool, error)
	Init(ctx context.Context, s server.HttpMux)
	Stop()
}

func NewResolver() Resolver {
	return &resolver{}
}

type resolver struct {
	c            grpc.ClientConnInterface
	r            registry.Registry
	s            server.HttpMux
	b            Balancer
	rc           client.ResolverCallback
	monitorOAuth grpc2.HealthMonitor
	monitorUser  grpc2.HealthMonitor
	userReady    bool
}

func (m *resolver) Init(ctx context.Context, s server.HttpMux) {

	conn := clientcontext.GetClientConn(ctx)
	reg := servercontext.GetRegistry(ctx)
	rc, _ := client.NewResolverCallback(reg)
	bal := NewBalancer()
	rc.Add(bal.Build)

	m.c = conn
	m.rc = rc
	m.r = reg
	m.s = s
	m.b = bal

	if runtime.LastInitType() != "install" {
		monitorOAuth := grpc2.NewHealthChecker(ctx)
		go monitorOAuth.Monitor(common.ServiceOAuth)
		m.monitorOAuth = monitorOAuth

		monitorUser := grpc2.NewHealthChecker(ctx)
		go monitorUser.Monitor(common.ServiceUser)
		m.monitorUser = monitorUser
	}

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
	// Special case for application/grpc
	if strings.Contains(r.Header.Get("Content-Type"), "application/grpc") {
		proxy, e := m.b.PickService(common.ServiceGatewayGrpc)
		if e != nil {
			http.NotFound(w, r)
			return false, fmt.Errorf("cannot find grpc gateway")
		}
		// We assume that internally, the GRPCs service is serving self-signed
		proxy.Transport = grpcTransport
		// Wrap context and server request
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)
		proxy.ServeHTTP(w, r.WithContext(ctx))
		return true, nil
	}

	if (m.monitorOAuth != nil && !m.monitorOAuth.Up()) || (m.monitorUser != nil && !m.monitorUser.Up()) {
		var bb []byte
		if strings.Contains(r.Header.Get("Accept"), "text/html") {
			if !m.monitorOAuth.Up() {
				log.Logger(r.Context()).Warn("Returning server is starting because grpc.oauth monitor is not Up")
			} else {
				log.Logger(r.Context()).Warn("Returning server is starting because grpc.user service is not ready")
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
	_, pattern := m.s.Handler(r)
	if len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		m.s.ServeHTTP(w, r.WithContext(ctx))
		return true, nil
	}

	proxy, e := m.b.PickEndpoint(r.URL.Path)
	if e == nil {
		proxy.ServeHTTP(w, r)
		return true, nil
	}
	return false, nil
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
