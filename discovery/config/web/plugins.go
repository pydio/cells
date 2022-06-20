package rest

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

func init() {

	config.RegisterRestEditablePath("frontend", "plugin")
	config.RegisterRestEditablePath("services", "pydio.grpc.update")
	config.RegisterRestEditablePath("services", "pydio.grpc.mailer")
	config.RegisterRestEditablePath("services", "pydio.rest.share")

	f := func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceConfig),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Configuration"),
			service.WithWeb(func(c context.Context) service.WebHandler {
				return &Handler{MainCtx: c}
			}),
		)
	}

	runtime.Register("main", f)
	runtime.Register("install", f)
}
