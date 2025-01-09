package rest

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

const LibreOffice = "libreoffice"

var (
	registeredRoutes []string
)

const (
	RouteMainV6    = "collabora-main-v6"
	RouteMain      = "collabora-main"
	RouteWsV6      = "collabora-websocket-v6"
	RouteWs        = "collabora-websocket"
	RouteDiscovery = "collabora-discovery"
)

func init() {
	config.RegisterProxy("frontend/plugin/editor.libreoffice", config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if m, o := val.(map[string]interface{}); o {
			if b, isBool := m[config.KeyFrontPluginEnabled].(bool); isBool {
				_ = s.Val("services", common.ServiceWebNamespace_+LibreOffice, "enabled").Set(b)
			}
		}
		return s.Val(pa...).Set(val)
	}))

	routing.RegisterRoute(RouteMainV6, "Collabora Leaflet API", "/leaflet")
	routing.RegisterRoute(RouteMain, "Collabora Leaflet API", "/browser")
	routing.RegisterRoute(RouteWsV6, "Collabora Websocket API", "/lool")
	routing.RegisterRoute(RouteWs, "Collabora Websocket API", "/cool")
	routing.RegisterRoute(RouteDiscovery, "Collabora Discovery API", "/hosting/discovery")

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+LibreOffice),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.AutoRestart(true),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithHTTP(func(ctx context.Context, mux routing.RouteRegistrar) error {
				pconf := config.Get(ctx, "frontend", "plugin", "editor.libreoffice")
				enabled := pconf.Val(config.KeyFrontPluginEnabled).Default(false).Bool()
				if !enabled {
					log.Logger(ctx).Info("Skipping LibreOffice plugin as not enabled")
					return nil
				}
				log.Logger(ctx).Info("Starting LibreOffice proxy")

				useTls := pconf.Val("LIBREOFFICE_SSL").Default(true).Bool()
				skipVerify := pconf.Val("LIBREOFFICE_SSL_SKIP_VERIFY").Default(true).Bool()
				host := pconf.Val("LIBREOFFICE_HOST").Default("localhost").String()
				port := pconf.Val("LIBREOFFICE_PORT").Default("9980").String()

				scheme := "http"
				if useTls {
					scheme = "https"
				}

				u, err := url.Parse(fmt.Sprintf("%s://%s:%s", scheme, host, port))
				if err != nil {
					return err
				}
				// Setup a reverse proxy
				proxy := httputil.NewSingleHostReverseProxy(u)
				proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
					log.Logger(ctx).Error("Error in libreoffice reverse proxy: "+err.Error(), zap.Error(err))
					writer.WriteHeader(http.StatusBadGateway)
				}
				if useTls && skipVerify {
					proxy.Transport = &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}
				}
				routes := []string{
					RouteMain,
					RouteWs,
					RouteDiscovery,
					RouteMainV6,
					RouteWsV6,
				}
				for _, route := range routes {
					mux.Route(route).Handle("/", proxy)
				}
				registeredRoutes = append(registeredRoutes, routes...)

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				for _, p := range registeredRoutes {
					mux.DeregisterRoute(p)
				}
				registeredRoutes = []string{}
				return nil
			}),
		)
	})

}
