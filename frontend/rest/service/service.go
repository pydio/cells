package service

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/frontend/sessions"
	"github.com/pydio/cells/v4/frontend/rest"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceFrontend),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.Description("REST service for serving specific requests directly to frontend"),
			service.PluginBoxes(rest.BasePluginsBox),
			service.WithStorageDrivers(sessions.NewCookieDAO, sessions.NewSQLDAO),
			service.WithWebMiddleware(func(h http.Handler) http.Handler {
				return sessions.NewSessionWrapper(h, "POST:/frontend/binaries")
			}),
			service.WithWeb(func(c context.Context) service.WebHandler {
				return rest.NewFrontendHandler()
			}),
		)
	})

}
