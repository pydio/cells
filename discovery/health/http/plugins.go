package generic

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+common.ServiceHealthCheck),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Service launching a test discovery server."),
			// service.WithStorage(config.NewDAO),
			service.WithHTTP(func(c context.Context, mux server.HttpMux) error {
				mux.HandleFunc("/test", func(rw http.ResponseWriter, r *http.Request) {
					rw.Write([]byte("this is a test"))
				})

				return nil
			}),
		)
	})
}
