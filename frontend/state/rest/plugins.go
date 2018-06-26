package server

import (
	"net/http"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-web"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_REST_NAMESPACE_+"front-state"),
		service.Tag(common.SERVICE_TAG_FRONTEND),
		service.Description("Frontend Registry Server"),
		WithRest(func() (*RestHandler, error) {
			return NewRestHandler(), nil
		}),
	)
}

// WithRest returns a manually initialized (not via swagger) web handler
func WithRest(f func() (*RestHandler, error)) service.ServiceOption {
	return func(o *service.ServiceOptions) {
		o.Web = web.NewService()
		o.WebInit = func(service.Service) error {
			return nil
		}
		o.BeforeStart = append(o.BeforeStart, func(s service.Service) error {
			name := s.Options().Name
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			handler, _ := f()

			s.Options().Web.Init(
				web.Cmd(cmd.NewCmd()),
				web.Id(uuid.NewUUID().String()),
				web.Registry(defaults.Registry()),
				web.Name(name),
				web.AfterStart(func() error {
					log.Logger(ctx).Info("started")
					return nil
				}),
			)

			rootPath := "/front-state"

			ws := new(restful.WebService)
			ws.Consumes(restful.MIME_JSON)
			ws.Consumes(restful.MIME_XML)
			ws.Produces(restful.MIME_JSON)
			ws.Produces(restful.MIME_XML)
			ws.Path(rootPath)

			ws.Route(ws.GET("/").To(handler.State))

			wc := restful.NewContainer()
			wc.Add(ws)

			var e error
			wrapped := http.Handler(wc)

			wrapped = service.PolicyHttpWrapper(wrapped)
			wrapped = service.JWTHttpWrapper(wrapped)
			wrapped = servicecontext.HttpMetaExtractorWrapper(wrapped)
			if wrapped, e = service.NewConfigHttpHandlerWrapper(wrapped, name); e != nil {
				return e
			}
			wrapped = service.NewLogHttpHandlerWrapper(wrapped, name, servicecontext.GetServiceColor(ctx))

			s.Options().Web.Handle("/", wrapped)

			return nil
		})
	}
}
