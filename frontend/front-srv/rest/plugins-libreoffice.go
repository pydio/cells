package rest

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/http/routes"
	"github.com/pydio/cells/v4/common/service"
)

const LibreOffice = "libreoffice"

var (
	registeredPatterns []string
)

const (
	RouteMain      = "collabora-main"
	RouteWs        = "collabora-websocket"
	RouteDiscovery = "collabora-discovery"
)

func init() {
	config.RegisterProxy("frontend/plugin/editor.libreoffice", config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if m, o := val.(map[string]interface{}); o {
			if b, isBool := m[config.KeyFrontPluginEnabled].(bool); isBool {
				_ = config.Set(b, "services", common.ServiceWebNamespace_+LibreOffice, "enabled")
			}
		}
		return s.Val(pa...).Set(val)
	}))

	routes.DeclareRoute(RouteMain, "Collabora Leaflet API", "/leaflet", routes.WithCustomResolver(func(ctx context.Context) string {
		version := config.Get("frontend", "plugin", "editor.libreoffice").Val("LIBREOFFICE_CODE_VERSION").Default("v6").String()
		if version != "v6" {
			return "/browser"
		} else {
			return "/leaflet"
		}
	}))

	routes.DeclareRoute(RouteWs, "Collabora Websocket API", "/lool", routes.WithCustomResolver(func(ctx context.Context) string {
		version := config.Get("frontend", "plugin", "editor.libreoffice").Val("LIBREOFFICE_CODE_VERSION").Default("v6").String()
		if version != "v6" {
			return "/cool"
		} else {
			return "/lool"
		}
	}))

	routes.DeclareRoute(RouteDiscovery, "Collabora Discovery API", "/hosting/discovery")

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+LibreOffice),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.AutoRestart(true),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithHTTP(func(ctx context.Context, mux routes.RouteRegistrar) error {
				pconf := config.Get("frontend", "plugin", "editor.libreoffice")
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
				mux.Route(RouteMain).Handle("/", proxy)
				mux.Route(RouteWs).Handle("/", proxy)
				mux.Route(RouteDiscovery).Handle("/", proxy)

				registeredPatterns = append(registeredPatterns, RouteMain, RouteWs, RouteDiscovery)

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routes.RouteRegistrar) error {
				for _, p := range registeredPatterns {
					log.Logger(ctx).Info("Deregistering pattern " + p + " while stopping service")
					mux.DeregisterPattern(p)
				}
				registeredPatterns = []string{}
				return nil
			}),
		)
	})

}
