/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

// Package proxy loads a Caddy service to provide a unique access to all services and serve the PHP frontend
package proxy

import (
	"context"
	"fmt"
	"html/template"
	"net/url"
	"path/filepath"

	"github.com/mholt/caddy"
	"github.com/mholt/caddy/caddyhttp/httpserver"
	"github.com/mholt/caddy/caddytls"

	"github.com/micro/go-micro/broker"
	_ "github.com/micro/go-plugins/client/grpc"
	_ "github.com/micro/go-plugins/server/grpc"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service"
)

var (
	instance      *caddy.Instance
	caddytemplate = template.New(common.SERVICE_GATEWAY_PROXY)
	caddyfile     = `
		{{.Bind.Host}} {
		proxy /a  {{.Micro.Host}} {
			without /a
			transparent
		}
		proxy /auth {{.Dex.Host}} {
			without /auth
			transparent
		}
		proxy /io   {{.Gateway.Host}} {
			transparent
		}
		proxy /data {{.Gateway.Host}} {
			transparent
		}
		proxy /ws   {{.WebSocket.Host}} {
			websocket
			without /ws
		}
		proxy /plug/   {{.FrontPlugins.Host}} {
			transparent
			header_downstream Cache-Control "public, max-age=31536000"
		}
		proxy /dav/ {{.DAV.Host}} {
			transparent
		}

		proxy /public/ {{.FrontPlugins.Host}}/public {
			transparent
			without /public/
		}

		proxy /user/reset-password/ {{.FrontPlugins.Host}} {
			transparent
		}

		proxy /robots.txt {{.FrontPlugins.Host}} {
			transparent
		}

		proxy /login {{.FrontPlugins.Host}}/gui {
			transparent
			without /login
		}

		redir 302 {
		  if {path} is /
		  / /login
		}

		{{range .PluginTemplates}}
		{{call .}}
		{{end}}

		rewrite {
			if {path} not_starts_with "/a/"
			if {path} not_starts_with "/auth/"
			if {path} not_starts_with "/io"
			if {path} not_starts_with "/data"
			if {path} not_starts_with "/ws/"
			if {path} not_starts_with "/plug/"
			if {path} not_starts_with "/dav/"
			{{range .PluginPathes}}
			if {path} not_starts_with "{{.}}"
			{{end}}
			if {path} not_starts_with "/public/"
			if {path} not_starts_with "/user/reset-password"
			if {path} not_starts_with "/robots.txt"
			to {path} {path}/ /login
		}

		{{if .TLS}}tls {{.TLS}}{{end}}
		errors "{{.Logs}}/caddy_errors.log"
		}
		{{if .HttpRedirectSource}}
		http://{{.HttpRedirectSource.Host}} {
		redir https://{{.HttpRedirectTarget.Host}}
		}
		{{end}}
	`
	caddyconf = struct {
		// Main site URL
		Bind *url.URL

		// Micro REST API dispatcher
		Micro *url.URL
		// Open ID Connect Service
		Dex *url.URL
		// S3 Gateway
		Gateway *url.URL
		// WebSocket server
		WebSocket *url.URL
		// Plugins loader for frontend
		FrontPlugins *url.URL
		// WebDAV server
		DAV *url.URL
		// WOPI server
		WOPI *url.URL
		// Collabora definition from plugins
		Collabora *url.URL
		// Dedicated log file for caddy errors to ease debugging
		Logs string
		// Caddy compliant TLS string, either "self_signed" or paths to "cert key"
		TLS string
		// If TLS is enabled, also enable auto-redirect from http to https
		HTTPRedirectSource *url.URL
		HTTPRedirectTarget *url.URL
	}{}
)

// CaddyTemplateConf feeds Caddy template file with data
type CaddyTemplateConf struct {
}

func init() {

	service.NewService(
		service.Name(common.SERVICE_GATEWAY_PROXY),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.Description("Main HTTP proxy for exposing a unique address to the world"),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {

			caddy.AppName = common.PackageLabel
			caddy.AppVersion = common.Version().String()
			httpserver.HTTP2 = false

			certEmail := config.Get("cert", "proxy", "email").String("")
			if certEmail != "" {
				caddytls.Agreed = true
				caURL := config.Get("cert", "proxy", "caUrl").String("")
				fmt.Println("### Configuring LE SSL, CA URL:", caURL)
				caddytls.DefaultCAUrl = caURL
			}

			err := LoadCaddyConf()
			if err != nil {
				return nil, nil, nil, err
			}

			if err := config.InitCaddyFile(common.SERVICE_GATEWAY_PROXY, caddyconf); err != nil {
				return nil, nil, nil, err
			}

			// now load inside caddy
			caddyfile, err := caddy.LoadCaddyfile(common.SERVICE_GATEWAY_PROXY)
			if err != nil {
				return nil, nil, nil, err
			}

			// start caddy server
			instance, err = caddy.Start(caddyfile)
			if err != nil {
				return nil, nil, nil, err
			}

			return service.RunnerFunc(func() error {
					instance.Wait()
					return nil
				}), service.CheckerFunc(func() error {
					if len(instance.Servers()) == 0 {
						return fmt.Errorf("No servers have been started")
					}
					return nil
				}), service.StopperFunc(func() error {
					instance.Stop()
					return nil
				}), nil
		}),
		service.AfterStart(func(s service.Service) error {

			handler := func() error {
				if instance == nil {
					return nil
				}

				// now load inside caddy
				caddyfile, err := caddy.LoadCaddyfile("http")
				if err != nil {
					return err
				}

				// Kick off the restart; our work is done
				// caddy.EmitEvent(caddy.InstanceRestartEvent, nil)

				_, err = instance.Restart(caddyfile)
				if err != nil {
					return err
				}
				return nil
			}

			// Adding subscriber
			broker.Subscribe(common.TOPIC_SERVICE_START, func(p broker.Publication) error { return handler() })
			broker.Subscribe(common.TOPIC_SERVICE_STOP, func(p broker.Publication) error { return handler() })

			// Watching plugins
			if w, err := config.Watch("frontend", "plugin"); err != nil {
				return err
			} else {
				go func() {
					defer w.Stop()
					for {
						_, err := w.Next()
						if err != nil {
							break
						}

						handler()
					}
				}()
			}

			return nil
		}),
	)
}

// LoadCaddyConf reads the pydio config and fill a CaddyTemplateConf object ready
// to be executed by template
func LoadCaddyConf() error {

	caddyconf.Logs = filepath.Join(config.ApplicationDataDir(), "logs")

	if bindUrl := config.Get("defaults", "urlInternal").String(""); bindUrl == "" {
		return fmt.Errorf("cannot find urlInternal configuration")
	} else {
		caddyconf.Bind, _ = url.Parse(bindUrl)
	}
	servicesHost := "localhost" // This should be detected on a per-service basis

	tls := config.Get("cert", "proxy", "ssl").Bool(false)
	if tls {
		if self := config.Get("cert", "proxy", "self").Bool(false); self {
			caddyconf.TLS = "self_signed"
		} else if certEmail := config.Get("cert", "proxy", "email").String(""); certEmail != "" {
			caddyconf.TLS = certEmail
		} else {
			cert := config.Get("cert", "proxy", "certFile").String("")
			key := config.Get("cert", "proxy", "keyFile").String("")
			if cert != "" && key != "" {
				caddyconf.TLS = fmt.Sprintf("%s %s", cert, key)
			} else {
				fmt.Println("Missing one of certFile/keyFile in SSL declaration. Will not enable SSL on proxy")
			}
		}
		if redir := config.Get("cert", "proxy", "httpRedir").Bool(false); redir && c.TLS != "" {
			if extUrl := config.Get("defaults", "url").String(""); extUrl != "" {
				var e error
				if caddyconf.HTTPRedirectTarget, e = url.Parse(extUrl); e == nil {
					caddyconf.HTTPRedirectSource, _ = url.Parse("http://" + c.HttpRedirectTarget.Hostname())
				}
			} else {
				return fmt.Errorf("cannot find url configuration")
			}
		}
	}

	// internalUrlFromServices("pydio.gateway.rest")

	// if p, e := internalUrlFromConfig("micro.api", []string{"services", common.SERVICE_MICRO_API, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.Micro = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("dex", []string{"services", common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH, "dex", "web", "http"}, servicesHost, tls, true); e == nil {
	// 	caddyconf.Dex = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("gateway.data", []string{"services", common.SERVICE_GATEWAY_DATA, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.Gateway = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("websocket", []string{"services", common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.WebSocket = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("web statics", []string{"services", common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.FrontPlugins = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("dav", []string{"services", common.SERVICE_GATEWAY_DAV, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.DAV = p
	// } else {
	// 	return c, e
	// }
	//
	// if p, e := internalUrlFromConfig("wopi", []string{"services", common.SERVICE_GATEWAY_WOPI, "port"}, servicesHost, tls); e == nil {
	// 	caddyconf.WOPI = p
	// } else {
	// 	return c, e
	// }

	// if p, e := internalUrlFromConfig("collabora", []string{"frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_PORT"}, Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_HOST").String(""), Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_SSL").Bool(true)); e == nil {
	// 	c.Collabora = p
	// } else {
	// 	c.Collabora = nil
	// }

	return nil
}
