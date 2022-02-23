package metrics

import (
	"context"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/gateway/metrics/prometheus"
)

const (
	serviceName = common.ServiceGatewayNamespace_ + common.ServiceMetrics
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		if viper.GetBool("enable_metrics") {
			service.NewService(
				service.Name(serviceName),
				service.Context(ctx),
				service.Tag(common.ServiceTagGateway),
				service.Description("Gather metrics for external tools (prometheus and pprof formats)"),
				service.WithGeneric(func(c context.Context, server *generic.Server) error {
					srv := &metricsServer{ctx: c, name: serviceName}
					return srv.Start()
				}),
			)
		}
	})
}

type metricsServer struct {
	ctx  context.Context
	name string
}

func (g *metricsServer) Start() error {
	return prometheus.WatchTargets(g.ctx, g.name)
}

func (g *metricsServer) Stop() error {
	prometheus.StopWatchingTargets()

	return nil
}

// NoAddress implements NonAddressable interface
func (g *metricsServer) NoAddress() string {
	return prometheus.GetFileName(serviceName)
}
