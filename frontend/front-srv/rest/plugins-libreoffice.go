package rest

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
)

const LibreOffice = "libreoffice"

func init() {
	config.RegisterProxy("frontend/plugin/editor.libreoffice", config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if m, o := val.(map[string]interface{}); o {
			if b, isBool := m[config.KeyFrontPluginEnabled].(bool); isBool {
				fmt.Println("Hijacked config setter for ", pa, val, "applying to service configs", b)
				_ = s.Val("services", common.ServiceWebNamespace_+LibreOffice, "enabled").Set(b)
			}
		}
		return s.Val(pa...).Set(val)
	}))

	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+LibreOffice),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.AutoRestart(true),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithHTTP(func(ctx context.Context, mux server.HttpMux) error {
				pconf := config.Get("frontend", "plugin", "editor.libreoffice")
				enabled := pconf.Val(config.KeyFrontPluginEnabled).Default(false).Bool()
				if !enabled {
					log.Logger(ctx).Info("Skipping LibreOffice plugin as not enabled")
					return nil
				}
				log.Logger(ctx).Info("Starting LibreOffice proxy")

				tls := pconf.Val("LIBREOFFICE_SSL").Default(true).Bool()
				host := pconf.Val("LIBREOFFICE_HOST").Default("localhost").String()
				port := pconf.Val("LIBREOFFICE_PORT").Default("9980").String()
				version := pconf.Val("LIBREOFFICE_CODE_VERSION").Default("v6").String()

				LeafletURI := "leaflet"
				WebsocketURI := "lool"
				if version != "v6" {
					LeafletURI = "browser"
					WebsocketURI = "cool"
				}

				scheme := "http"
				if tls {
					scheme = "https"
				}

				u, err := url.Parse(fmt.Sprintf("%s://%s:%s", scheme, host, port))
				if err != nil {
					return err
				}
				// Setup a reverse proxy
				proxy := httputil.NewSingleHostReverseProxy(u)
				mux.HandleFunc("/"+LeafletURI+"/", func(writer http.ResponseWriter, request *http.Request) {
					proxy.ServeHTTP(writer, request)
				})
				mux.HandleFunc("/"+WebsocketURI+"/", func(writer http.ResponseWriter, request *http.Request) {
					proxy.ServeHTTP(writer, request)
				})
				mux.HandleFunc("/hosting/discovery/", func(writer http.ResponseWriter, request *http.Request) {
					proxy.ServeHTTP(writer, request)
				})

				return nil
			}),
		)
	})

}
