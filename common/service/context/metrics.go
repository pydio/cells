package servicecontext

import (
	"context"
	"net/http"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common/service/metrics"
	"github.com/uber-go/tally"
)

func NewMetricsWrapper(service micro.Service) {

	var options []micro.Option
	ctx := service.Options().Context

	name := GetServiceName(ctx)
	options = append(options, micro.WrapHandler(wrapperByName(name)))
	service.Init(options...)

}

func wrapperByName(name string) server.HandlerWrapper {

	return func(fn server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			scope := metrics.GetMetricsForService(name)
			if scope == tally.NoopScope {
				return fn(ctx, req, rsp)
			}
			scope.Counter("grpc_calls").Inc(1)
			tsw := scope.Timer("grpc_time").Start()
			defer tsw.Stop()
			return fn(ctx, req, rsp)
		}
	}
}

func NewMetricsHttpWrapper(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scope := metrics.GetMetricsForService(GetServiceName(r.Context()))
		if scope == tally.NoopScope {
			h.ServeHTTP(w, r)
			return
		}
		scope.Counter("rest_calls").Inc(1)
		tsw := scope.Timer("rest_time").Start()
		defer tsw.Stop()
		h.ServeHTTP(w, r)

	})

}
