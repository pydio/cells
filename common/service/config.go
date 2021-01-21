package service

import (
	"context"
	"net/http"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common/config"
	servicecontext "github.com/pydio/cells/common/service/context"
)

func newConfigProvider(service micro.Service) error {

	// TODO : WATCH CONFIGS FOR RELOADING ???
	ctx := service.Options().Context

	var options []micro.Option

	// Going to get the configs from the config service
	options = append(options, micro.BeforeStart(func() error {
		name := servicecontext.GetServiceName(ctx)

		//log.Logger(ctx).Debug("Service configuration retrieved", zap.String("service", name), zap.Any("cfg", cfg))
		ctx = servicecontext.WithConfig(ctx, config.Get("services", name))
		service.Init(micro.Context(ctx))

		return nil
	}))

	options = append(options, micro.WrapHandler(NewConfigHandlerWrapper(service)))

	service.Init(options...)

	return nil
}

// NewConfigHandlerWrapper wraps the service config within the handler so it can be accessed by the handler itself.
func NewConfigHandlerWrapper(service micro.Service) server.HandlerWrapper {
	return func(h server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			configMap := servicecontext.GetConfig(service.Options().Context)
			ctx = servicecontext.WithConfig(ctx, configMap)
			return h(ctx, req, rsp)
		}
	}
}

// NewConfigHTTPHandlerWrapper is the same as ConfigHandlerWrapper but for pure http
func NewConfigHTTPHandlerWrapper(h http.Handler, serviceName string) (http.Handler, error) {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := r.Context()
		c = servicecontext.WithConfig(c, config.Get("services", serviceName))
		r = r.WithContext(c)
		h.ServeHTTP(w, r)
	}), nil
}
