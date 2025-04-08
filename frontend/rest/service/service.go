package service

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/service/frontend/sessions"
	"github.com/pydio/cells/v5/frontend/rest"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		drivers := service.StorageDrivers{}
		drivers.Register(sessions.NewSQLDAO)
		drivers.Register(sessions.NewCookieDAO)
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceFrontend),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.Description("REST service for serving specific requests directly to frontend"),
			service.PluginBoxes(rest.BasePluginsBox),
			service.WithStorageDrivers(drivers),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up:            manager.StorageMigration(),
				},
			}),
			service.WithWebMiddleware(func(h http.Handler) http.Handler {
				return sessions.NewSessionWrapper(h, "POST:/frontend/binaries")
			}),
			service.WithWeb(func(c context.Context) service.WebHandler {
				return rest.NewFrontendHandler()
			}),
		)
	})

}
