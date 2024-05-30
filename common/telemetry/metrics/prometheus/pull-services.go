package prometheus

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"net/url"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel/sdk/metric"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

const (
	promFileServiceName = common.ServiceGenericNamespace_ + "prometheus-file"
	promSDServiceName   = common.ServiceWebNamespace_ + "prometheus"
)

type basicAuth struct {
	login, pwd []byte
	inner      http.Handler
}

func (b *basicAuth) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if l, p, o := r.BasicAuth(); o && subtle.ConstantTimeCompare([]byte(l), b.login) == 1 && subtle.ConstantTimeCompare([]byte(p), b.pwd) == 1 {
		b.inner.ServeHTTP(w, r)
		return
	}
	w.Header().Set("WWW-Authenticate", `Basic realm="cells metrics"`)
	w.WriteHeader(401)
	w.Write([]byte("Unauthorized.\n"))
}

func newPromHttpService(ctx context.Context, pure bool, with, stop func(ctx context.Context, mux routing.RouteRegistrar) error) {

	var opts []service.ServiceOption
	opts = append(opts,
		service.Name(promSDServiceName),
		service.Context(ctx),
		service.Tag(common.ServiceTagGateway),
		service.Description("Expose metrics for external tools (prometheus and pprof formats)"),
		service.ForceRegister(true), // Always register in all processes
		service.WithHTTPStop(stop),
	)
	if pure {
		opts = append(opts, service.WithPureHTTP(with))
	} else {
		opts = append(opts, service.WithHTTP(with))
	}
	service.NewService(opts...)

}

type fileProvider struct {
	metric.Reader
	filePath string
}

func (f *fileProvider) InitHTTPPullService(ctx context.Context, route string) {

	pattern := fmt.Sprintf("/%s", runtime.ProcessRootID())
	// Generic service to watch targets
	if !runtime.IsFork() {
		service.NewService(
			service.Name(promFileServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("Gather metrics endpoints for prometheus inside a prom.json file"),
			service.WithGeneric(func(c context.Context, server *generic.Server) error {
				srv := &metricsServer{
					ctx:         c,
					serviceName: promFileServiceName,
					filePath:    f.filePath,
				}
				return srv.Start()
			}),
		)
	}
	// Expose metrics on given pattern
	newPromHttpService(
		ctx,
		!runtime.IsFork(),
		func(ctx context.Context, mux routing.RouteRegistrar) error {
			mux.Route(route).Handle(pattern, promhttp.Handler())
			return nil
		},
		func(ctx context.Context, mux routing.RouteRegistrar) error {
			mux.DeregisterRoute(route)
			return nil
		},
	)
}

type httpProvider struct {
	metric.Reader
	login, pwd string
}

func (p *httpProvider) InitHTTPPullService(ctx context.Context, route string) {

	// Expose metrics and index on given pattern
	pattern := fmt.Sprintf("/%s", runtime.ProcessRootID())

	newPromHttpService(
		ctx,
		false,
		func(ctx context.Context, mux routing.RouteRegistrar) error {
			router := mux.Route(route)
			router.Handle(pattern, &basicAuth{inner: promhttp.Handler(), login: []byte(p.login), pwd: []byte(p.pwd)})
			/// For main process, also add the central index
			if !runtime.IsFork() {
				index := NewIndex(ctx)
				router.Handle("/sd", &basicAuth{inner: index, login: []byte(p.login), pwd: []byte(p.pwd)})
			}
			return nil
		},
		func(ctx context.Context, mux routing.RouteRegistrar) error {
			mux.DeregisterRoute(route)
			return nil
		})
}

// NewIndex creates an http.Handler to server index page
func NewIndex(c context.Context) http.Handler {
	return &indexHandler{ctx: c}
}

type indexHandler struct {
	ctx context.Context
}

func (p *indexHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	var reg registry.Registry
	propagator.Get(p.ctx, registry.ContextKey, &reg)

	externalURL := routing.GetDefaultSiteURL()
	u, _ := url.Parse(externalURL)
	targets := processesAsTargets(p.ctx, reg, true, u.Host)
	writer.Header().Set("Content-Type", "application/json")
	jj, _ := targets.ToJson()
	writer.Write(jj)
	writer.WriteHeader(200)
	return

}
