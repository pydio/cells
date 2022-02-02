package generic

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceTestNamespace_+common.ServiceHealthCheck),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Service launching a test discovery server."),
			// service.WithStorage(config.NewDAO),
			service.WithGeneric(func(c context.Context, srv *generic.Server) error {
				srv.Handle(func() error {
					fmt.Println("Server generic started")
					return nil
				})

				return nil
			}),
		)
	})
}
