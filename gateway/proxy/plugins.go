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

// Package proxy loads a Caddy service to provide a unique access to all services and serve the Javascript frontend.
package proxy

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/url"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	caddyutils "github.com/mholt/caddy"
	"github.com/mholt/caddy/caddytls"
	"github.com/micro/go-micro/broker"
	_ "github.com/micro/go-plugins/client/grpc"
	_ "github.com/micro/go-plugins/server/grpc"
	"github.com/pborman/uuid"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
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
	proxy /oidc {{.OAuth | urls}} {
		insecure_skip_verify
		header_upstream Host {host}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	proxy /io   {{.Gateway | serviceAddress}} {
		header_upstream Host {{.ExternalHost}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	proxy /data {{.Gateway | serviceAddress}} {
		header_upstream Host {{.ExternalHost}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	proxy /ws   {{.WebSocket | urls}} {
		websocket
		without /ws
	}
	proxy /dav {{.DAV | urls}} {
		header_upstream Host {host}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	
	proxy /plug/ {{.FrontPlugins | urls}} {
		header_upstream Host {host}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Cache-Control "public, max-age=31536000"
	}
	proxy /public/ {{.FrontPlugins | urls}} {
		header_upstream Host {host}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	proxy /public/plug/ {{.FrontPlugins | urls}} {
		without /public
		header_upstream Host {host}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Cache-Control "public, max-age=31536000"
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
{{if .ProxyGRPC}}
	proxy /grpc https://{{.ProxyGRPC | urls}} {
		without /grpc
		insecure_skip_verify
	}
	
	rewrite {
		if {>Content-type} has "application/grpc"
		to /grpc/{path}
	}
{{end}}

	redir 302 {
		{{if .ProxyGRPC}}if {>Content-type} not_has "application/grpc"{{end}}
		if {path} is /
		/ /login
	}
	
	{{range .PluginTemplates}}
	{{call .}}
	{{end}}
	
	rewrite {
		if {path} not_starts_with "/a/"
		if {path} not_starts_with "/oidc/"
		if {path} not_starts_with "/io"
		if {path} not_starts_with "/data"
		if {path} not_starts_with "/ws/"
		if {path} not_starts_with "/plug/"
		if {path} not_starts_with "/dav"
		{{range .PluginPathes}}
		if {path} not_starts_with "{{.}}"
		{{end}}
		if {path} not_starts_with "/public/"
		if {path} not_starts_with "/user/reset-password"
		if {path} not_starts_with "/robots.txt"
		to {path} {path}/ /login
	}

	root {{.WebRoot}}

	{{if .TLS}}tls {{.TLS}}{{end}}
	{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
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
		OAuth        string
		Gateway      string
		WebSocket    string
		FrontPlugins string
		DAV          string
		ProxyGRPC    string
		WebRoot      string
		// Dedicated log file for caddy errors to ease debugging
		Logs string
		// Caddy compliant TLS string, either "self_signed", a valid email for Let's encrypt managed certificate or paths to "cert key"
		TLS     string
		TLSCert string
		TLSKey  string
		// If TLS is enabled, also enable auto-redirect from http to https
		HTTPRedirectSource *url.URL
		HTTPRedirectTarget *url.URL

		PluginTemplates []caddy.TemplateFunc
		PluginPathes    []string
	}{
		Micro:        common.SERVICE_MICRO_API,
		OAuth:        common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH,
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

				//httpserver.HTTP2 = false

				certEmail := config.Get("cert", "proxy", "email").String("")
				if certEmail != "" {
					caddytls.Agreed = true
					caURL := config.Get("cert", "proxy", "caUrl").String("")
					log.Logger(ctx).Debug(fmt.Sprintf("Configuring Let's Encrypt - SSL process, CA URL: %s", caURL))
					caddytls.DefaultCAUrl = caURL

					// Pre-check to insure path for automated generation of certificate is writable
					caddyWDir := caddyutils.AssetsPath()
					if err := insurePathIsWritable(ctx, caddyWDir); err != nil {

						log.Logger(ctx).Error("*******************************************************************")
						log.Logger(ctx).Error("   ERROR: ")
						log.Logger(ctx).Error("   You have chosen Let's Encrypt automatic management of TLS certificate,")
						log.Logger(ctx).Error("   but it seems that you do not have sufficient permissions on Caddy's working directory: ")
						log.Logger(ctx).Error("   " + caddyWDir)
						log.Logger(ctx).Error("   (WRITE permission is required for the user that runs the App)")
						log.Logger(ctx).Error("          ")
						if u, er := user.Current(); er == nil {
							log.Logger(ctx).Error("          Currently running as'" + u.Username + "'")
							log.Logger(ctx).Error("          ")
						}
						log.Logger(ctx).Error("*******************************************************************")

						return nil, nil, nil, err
					}
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

					for {
						if err == nil || !errorUtils.IsErrorPortBusy(err) {
							break
						}
						//log.Logger(ctx).Error("port is busy - return retry error", zap.Error(err))
						return nil, nil, nil, fmt.Errorf(errorUtils.ErrServiceStartNeedsRetry)
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
				if _, err := broker.Subscribe(common.TOPIC_SERVICE_STARTED, func(p broker.Publication) error {
					sName := string(p.Message().Body)
					if needsRestart(sName) {
						log.Logger(s.Options().Context).Debug("Received Start Message - Will Restart Caddy - ", zap.Any("serviceName", sName))

						return caddy.Restart()
					}
					return nil
				}); err != nil {
					return err
				}
				if _, err := broker.Subscribe(common.TOPIC_SERVICE_STOPPED, func(p broker.Publication) error {
					sName := string(p.Message().Body)
					if needsRestart(sName) {
						log.Logger(s.Options().Context).Debug("Received Stop Message - Will Restart Caddy - ", zap.Any("stopEvent", sName))
						return caddy.Restart()
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

	caddyconf.Logs = config.ApplicationWorkingDir(config.ApplicationDirLogs)
	caddyconf.WebRoot = "/" + uuid.New()

	u, err := url.Parse(config.Get("defaults", "urlInternal").String(""))
	if err != nil {
		return err
	}

	caddyconf.Micro = common.SERVICE_MICRO_API
	external := viper.Get("grpc_external")
	externalSet := external != nil && external.(string) != ""

	protocol := "http://"
	tls := config.Get("cert", "proxy", "ssl").Bool(false)
	if tls {
		protocol = "https://"
		if self := config.Get("cert", "proxy", "self").Bool(false); self {
			caddyconf.TLS = "self_signed"
		} else if certEmail := config.Get("cert", "proxy", "email").String(""); certEmail != "" {
			caddyconf.TLS = certEmail
			if !externalSet {
				caddyconf.ProxyGRPC = common.SERVICE_GATEWAY_GRPC
			}
		} else {
			cert := config.Get("cert", "proxy", "certFile").String("")
			key := config.Get("cert", "proxy", "keyFile").String("")
			if cert != "" && key != "" {
				caddyconf.TLSCert = cert
				caddyconf.TLSKey = key
				if !externalSet {
					caddyconf.ProxyGRPC = common.SERVICE_GATEWAY_GRPC
				}
			} else {
				fmt.Println("Missing one of certFile/keyFile in SSL declaration. Will not enable SSL on proxy")
			}
		}
	}

	_ = protocol
	// Test multiple hots
	// caddyconf.Bind = "local.pydio:" + u.Port() + " localhost:" + u.Port() //protocol + u.Host
	// Test ALL hosts
	caddyconf.Bind = ":" + u.Port()

	if redir := config.Get("cert", "proxy", "httpRedir").Bool(false); redir && (caddyconf.TLS != "" || caddyconf.TLSCert != "" && caddyconf.TLSKey != "") {
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

func insurePathIsWritable(ctx context.Context, parDir string) error {

	// Try to create the default parent location.
	err := os.MkdirAll(parDir, 0700)
	if err != nil {
		return err
	}

	// Perform a touch like test to be OS independant
	fullPath := filepath.Join(parDir, "test-writable.txt")
	file, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer func() {
		file.Close()
		os.Remove(fullPath)
	}()

	_, err = io.WriteString(file, "Testing Caddy Working Dir is Writable")
	if err != nil {
		return err
	}
	return nil
}
