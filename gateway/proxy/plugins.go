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
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"

	"github.com/mholt/caddy/caddyhttp/httpserver"
	"github.com/mholt/caddy/caddytls"
	"github.com/micro/go-micro/broker"
	_ "github.com/micro/go-plugins/client/grpc"
	_ "github.com/micro/go-plugins/server/grpc"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	service2 "github.com/pydio/cells/common/service/proto"
	errorUtils "github.com/pydio/cells/common/utils/error"
)

var (
	caddyfile = `
		{{.Bind}} {
		proxy /a  {{.Micro | urls}} {
			without /a
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}
		proxy /auth/dex {{.Dex | urls}} {
			insecure_skip_verify
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}
		proxy /io   {{.Gateway | serviceAddress}} {
			header_upstream Host {{.ExternalHost}}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}
		proxy /data {{.Gateway | serviceAddress}} {
			header_upstream Host {{.ExternalHost}}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}
		proxy /ws   {{.WebSocket | urls}} {
			websocket
			without /ws
		}
		proxy /plug/ {{.FrontPlugins | urls}} {
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
			header_downstream Cache-Control "public, max-age=31536000"
		}
		proxy /dav/ {{.DAV | urls}} {
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}

		proxy /public/ {{.FrontPlugins | urls}} {
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}

		proxy /user/reset-password/ {{.FrontPlugins | urls}} {
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}

		proxy /robots.txt {{.FrontPlugins | urls}} {
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
		}

		proxy /login {{urls .FrontPlugins "/gui"}} {
			without /login
			header_upstream Host {host}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
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

		{{if .HTTPRedirectSource}}
		http://{{.HTTPRedirectSource.Host}} {
			redir https://{{.HTTPRedirectTarget.Host}}
		}
		{{end}}
	`

	caddyconf = struct {
		// Main site URL
		Bind         string
		ExternalHost string
		Micro        string
		Dex          string
		Gateway      string
		WebSocket    string
		FrontPlugins string
		DAV          string
		// Dedicated log file for caddy errors to ease debugging
		Logs string
		// Caddy compliant TLS string, either "self_signed" or paths to "cert key"
		TLS string
		// If TLS is enabled, also enable auto-redirect from http to https
		HTTPRedirectSource *url.URL
		HTTPRedirectTarget *url.URL

		PluginTemplates []caddy.TemplateFunc
		PluginPathes    []string
	}{
		Micro:        common.SERVICE_MICRO_API,
		Dex:          common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_AUTH,
		Gateway:      common.SERVICE_GATEWAY_DATA,
		WebSocket:    common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET,
		FrontPlugins: common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS,
		DAV:          common.SERVICE_GATEWAY_DAV,
	}
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GATEWAY_PROXY),
			service.Tag(common.SERVICE_TAG_GATEWAY),
			service.Description("Main HTTP proxy for exposing a unique address to the world"),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {

				httpserver.HTTP2 = false

				certEmail := config.Get("cert", "proxy", "email").String("")
				if certEmail != "" {
					caddytls.Agreed = true
					caURL := config.Get("cert", "proxy", "caUrl").String("")
					log.Logger(ctx).Debug(fmt.Sprintf("Configuring Let's Encrypt - SSL process, CA URL: %s", caURL))
					caddytls.DefaultCAUrl = caURL
				}

				caddy.Enable(caddyfile, play)

				caddyconf.PluginTemplates = caddy.GetTemplates()
				caddyconf.PluginPathes = caddy.GetPathes()

				err := caddy.Start()
				if err != nil {
					if isErr, port := errorUtils.IsErrorPortPermissionDenied(err); isErr {
						log.Logger(ctx).Error("*******************************************************************")
						log.Logger(ctx).Error(fmt.Sprintf("   ERROR: Cannot bind to port %d.   ", port))
						log.Logger(ctx).Error("   You should probably run the following command ")
						log.Logger(ctx).Error("   otherwise the main internal proxy cannot start")
						log.Logger(ctx).Error("   and your application will be unreachable.")
						log.Logger(ctx).Error("   $ sudo setcap 'cap_net_bind_service=+ep' <path to your binary>")
						log.Logger(ctx).Error("*******************************************************************")
					}

					return nil, nil, nil, err
				}

				instance := caddy.GetInstance()

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

				needsRestart := func(sName string) bool {
					return strings.HasPrefix(sName, common.SERVICE_GATEWAY_NAMESPACE_) || strings.HasPrefix(sName, common.SERVICE_WEB_NAMESPACE_)
				}

				// Adding subscriber
				if _, err := broker.Subscribe(common.TOPIC_SERVICE_START, func(p broker.Publication) error {
					sName := string(p.Message().Body)
					if needsRestart(sName) {
						log.Logger(s.Options().Context).Debug("Received Start Message - Will Restart Caddy - ", zap.Any("serviceName", sName))
						return caddy.Restart()
					}
					return nil
				}); err != nil {
					return err
				}
				if _, err := broker.Subscribe(common.TOPIC_SERVICE_STOP, func(p broker.Publication) error {
					var se service2.StopEvent
					if e := json.Unmarshal(p.Message().Body, &se); e == nil {
						if needsRestart(se.ServiceName) {
							log.Logger(s.Options().Context).Debug("Received Stop Message - Will Restart Caddy - ", zap.Any("stopEvent", &se))
							return caddy.Restart()
						}
					}
					return nil
				}); err != nil {
					return err
				}

				// Watching plugins
				for _, cPath := range caddy.GetConfigPaths() {
					if w, err := config.Watch(cPath...); err != nil {
						return err
					} else {
						go func() {
							defer w.Stop()
							for {
								_, err := w.Next()
								if err != nil {
									break
								}
								caddy.Restart()
							}
						}()
					}
				}

				return nil
			}),
		)
	})
}

func play() (*bytes.Buffer, error) {
	LoadCaddyConf()

	template := caddy.Get().GetTemplate()

	buf := bytes.NewBuffer([]byte{})
	if err := template.Execute(buf, caddyconf); err != nil {
		return nil, err
	}
	if common.LogLevel == zap.DebugLevel {
		fmt.Println(string(buf.Bytes()))
	}

	return buf, nil
}

// LoadCaddyConf reads the pydio config and fills a CaddyTemplateConf object ready
// to be executed by template.
func LoadCaddyConf() error {

	caddyconf.Logs = filepath.Join(config.ApplicationDataDir(), "logs")

	u, err := url.Parse(config.Get("defaults", "urlInternal").String(""))
	if err != nil {
		return err
	}

	caddyconf.Micro = common.SERVICE_MICRO_API

	protocol := "http://"
	tls := config.Get("cert", "proxy", "ssl").Bool(false)
	if tls {
		protocol = "https://"
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
	}

	caddyconf.Bind = protocol + u.Host

	if redir := config.Get("cert", "proxy", "httpRedir").Bool(false); redir && caddyconf.TLS != "" {
		if extUrl := config.Get("defaults", "url").String(""); extUrl != "" {
			var e error
			if caddyconf.HTTPRedirectTarget, e = url.Parse(extUrl); e == nil {
				caddyconf.HTTPRedirectSource, _ = url.Parse("http://" + caddyconf.HTTPRedirectTarget.Hostname())
			}
		} else {
			return fmt.Errorf("cannot find url configuration")
		}
	}

	uExt, err := url.Parse(config.Get("defaults", "url").String(""))
	if err == nil {
		caddyconf.ExternalHost = uExt.Host
	}

	return nil
}
