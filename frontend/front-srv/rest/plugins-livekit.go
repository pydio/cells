package rest

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
)

const LiveKit = "livekit"

func init() {

	if os.Getenv("CELLS_ENABLE_LIVEKIT") == "" {
		return
	}

	config.RegisterProxy("frontend/plugin/action.livekit", config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if m, o := val.(map[string]interface{}); o {
			if b, isBool := m[config.KeyFrontPluginEnabled].(bool); isBool {
				fmt.Println("Hijacked config setter for ", pa, val, "applying to service configs", b)
				_ = s.Val("services", common.ServiceWebNamespace_+LiveKit, "enabled").Set(b)
			}
		}
		return s.Val(pa...).Set(val)
	}))

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+LiveKit),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.AutoRestart(true),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithHTTP(func(ctx context.Context, mux server.HttpMux) error {

				enabled := config.Get("frontend", "plugin", "action.livekit", config.KeyFrontPluginEnabled).Bool()
				lkUrl := config.Get("frontend", "plugin", "action.livekit", "LK_WS_URL").String()
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
				mux.HandleFunc("/rtc", func(writer http.ResponseWriter, request *http.Request) {
					proxy.ServeHTTP(writer, request)
				})

				return nil
			}),
		)
	})

}
