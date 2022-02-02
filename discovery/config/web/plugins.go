package rest

import (
	"context"

	"github.com/pydio/cells/v4/common/config"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
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
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceConfig, []string{}),
			service.WithWeb(func(c context.Context) service.WebHandler {
				return &Handler{MainCtx: c}
			}),
		)
	}

	plugins.Register("main", f)
	plugins.Register("install", f)
}
