package generic

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	routing.RegisterRoute("health", "Testing Healthcheck API", "/health")
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+common.ServiceHealthCheck),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Service launching a test discovery server."),
			// service.WithStorage(config.NewDAO),
			service.WithHTTP(func(c context.Context, mux routing.RouteRegistrar) error {
				mux.Route("health").Handle("/", http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
					_, _ = rw.Write([]byte("this is a test"))
				}))

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute("health")
				return nil
			}),
		)
	})
}
