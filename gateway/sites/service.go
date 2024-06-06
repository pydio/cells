package sites

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {
		proxyURL := runtime.ProxyServerURL()
		if proxyURL == "" {
			return
		}
		service.NewService(
			service.Name(common.ServiceWebNamespace_+"sites"),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("Web-facing Reverse Proxy"),
			service.WithGeneric(func(ctx context.Context, srv *generic.Server) error {
				s, e := server.OpenProxy(ctx, proxyURL)
				if e != nil {
					return e
				}
				return s.Serve()
			}),
		)
	})
}
