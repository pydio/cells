package rest

import (
	"context"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

const LiveKit = "livekit"

func init() {

	if os.Getenv("CELLS_ENABLE_LIVEKIT") == "" {
		return
	}

	config.RegisterProxy("frontend/plugin/action.livekit", config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if m, o := val.(map[string]interface{}); o {
			if b, isBool := m[config.KeyFrontPluginEnabled].(bool); isBool {
				_ = s.Val("services", common.ServiceWebNamespace_+LiveKit, "enabled").Set(b)
			}
		}
		return s.Val(pa...).Set(val)
	}))

	routing.RegisterRoute("livekit", "Livekit Plugin for video calls", "/rtc")

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+LiveKit),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.AutoRestart(true),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithHTTP(func(ctx context.Context, mux routing.RouteRegistrar) error {

				enabled := config.Get(ctx, "frontend", "plugin", "action.livekit", config.KeyFrontPluginEnabled).Bool()
				lkUrl := config.Get(ctx, "frontend", "plugin", "action.livekit", "LK_WS_URL").String()
				if !enabled || lkUrl == "" {
					log.Logger(ctx).Info("Skipping Livekit plugin as not enabled")
					return nil
				}
				u, e := url.Parse(lkUrl)
				if e != nil {
					return e
				}
				log.Logger(ctx).Info("Starting Livekit proxy")
				// Setup a reverse proxy
				proxy := httputil.NewSingleHostReverseProxy(u)
				mux.Route("livekit").Handle("/", proxy)

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute("livekit")
				return nil
			}),
		)
	})

}
