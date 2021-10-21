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
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/user"
	"path/filepath"

	caddyutils "github.com/mholt/caddy"
	"github.com/mholt/caddy/caddytls"
	"github.com/micro/go-micro/server"

	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	_ "github.com/pydio/cells/common/caddy/proxy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	errorUtils "github.com/pydio/cells/common/utils/error"
)

var (
	caddyfile = `
{{range .Sites}}
{{$ExternalHost := .ExternalHost}}
{{$Maintenance := .Maintenance}}
{{$MaintenanceConditions := .MaintenanceConditions}}
{{$SiteWebRoot := .WebRoot}}
{{$Site := .}}
{{range .Binds}}{{.}} {{end}}{
	{{if $Maintenance}}
	redir 303 { 
		{{range $MaintenanceConditions}}
		{{.}}
		{{end}}
		if {path} not /maintenance.html
		/maintenance.html
	}
	{{end}}

	{{if not $.FrontReady}}
	redir 303 { 
		if {path} not /starting.html
		/starting.html
	}
	{{end}}

	pydioproxy /a  {{$.MicroService}} {
		without /a
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	pydioproxy /oidc {{$.OAuthService}} {
		insecure_skip_verify
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	pydioproxy /io   {{$.GatewayService}} {
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	pydioproxy /data {{$.GatewayService}} {
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	pydioproxy /buckets {{$.GatewayService}} {
		without /buckets
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	pydioproxy /ws {{$.WebSocketService}} {
		websocket
		without /ws
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	pydioproxy /dav {{$.WebDAVService}} {
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Content-Security-Policy "script-src 'none'"
		header_downstream X-Content-Security-Policy "sandbox"
	}
	
{{if $.FrontReady}}
	pydioproxy /plug/ {{$.FrontendService}} {
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Cache-Control "public, max-age=31536000"
	}
	pydioproxy {{$.PublicBaseUri}}/ {{$.FrontendService}} {
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	pydioproxy {{$.PublicBaseUri}}/plug/ {{$.FrontendService}} {
		fail_timeout 20s
		without {{$.PublicBaseUri}}
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
		header_downstream Cache-Control "public, max-age=31536000"
	}
	pydioproxy /user/reset-password/ {{$.FrontendService}} {
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}

	pydioproxy /robots.txt {{$.FrontendService}} {
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
	
	pydioproxy /login {{$.FrontendService}} {
		without /login
		with /gui
		fail_timeout 20s
		header_upstream Host {{if $ExternalHost}}{{$ExternalHost}}{{else}}{host}{{end}}
		header_upstream X-Real-IP {remote}
		header_upstream X-Forwarded-Proto {scheme}
	}
{{end}}
{{if .HasTLS}}
	pydioproxy /grpc {{$.GrpcService}} {
		tls
		without /grpc
		insecure_skip_verify
		fail_timeout 20s
	}
	
	rewrite {
		if {>Content-type} has "application/grpc"
		to /grpc/{path}
	}
{{end}}

	redir 302 {
		{{if .HasTLS}}if {>Content-type} not_has "application/grpc"{{end}}
		if {>Authorization} not_has "AWS4-HMAC-SHA256"
		if {path} is /
		/ /login
	}

	rewrite {
		if {>Authorization} has "AWS4-HMAC-SHA256"
		if {path} is / 
		to /buckets{path}
	}

	rewrite {
		if {>Authorization} has "AWS4-HMAC-SHA256"
		if {path} starts_with "/probe-bucket-sign"
		to /buckets{path}
	}

	{{range $.PluginTemplates}}
	{{call . $Site}}
	{{end}}
	
	rewrite {
		if {path} not_starts_with "/a/"
		if {path} not_starts_with "/oidc/"
		if {path} not_starts_with "/io"
		if {path} not_starts_with "/data"
		if {path} not_starts_with "/buckets"
		if {path} not_starts_with "/ws/"
		if {path} not_starts_with "/plug/"
		if {path} not_starts_with "/dav"
		{{range $.PluginPathes}}
		if {path} not_starts_with "{{.}}"
		{{end}}
		if {path} not_starts_with "{{$.PublicBaseUri}}/"
		if {path} not_starts_with "/user/reset-password"
		if {path} not_starts_with "/robots.txt"
		to {path} {path}/ /login
	}

	root "{{if $SiteWebRoot}}{{$SiteWebRoot}}{{else}}{{$.WebRoot}}{{end}}"

	{{if .TLS}}tls {{.TLS}}{{end}}
	{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
	errors "{{$.Logs}}/caddy_errors.log"
	log "{{$.Logs}}/caddy_logs.log"
}

{{if .SSLRedirect}}
{{range $k,$v := .Redirects}}
{{$k}} {
	redir {{$v}}
}
{{end}}
{{end}}

{{end}}
	`

	caddyconf = struct {
		// Sites definition
		Sites []caddy.SiteConf
		// Services names
		MicroService     string
		OAuthService     string
		GatewayService   string
		WebSocketService string
		FrontendService  string
		WebDAVService    string
		GrpcService      string
		// Custom webroot - Generally pointing to a non-existing folder
		WebRoot string
		// Public links base URI
		PublicBaseUri string
		// Dedicated log file for caddy errors to ease debugging
		Logs string
		// Front service is pre-checked before template generation
		FrontReady bool
		// Additional modifiers used for templating
		PluginTemplates []caddy.TemplateFunc
		PluginPathes    []string
	}{
		MicroService:     common.ServiceMicroApi,
		OAuthService:     common.ServiceWebNamespace_ + common.ServiceOAuth,
		GatewayService:   common.ServiceGatewayData,
		WebSocketService: common.ServiceGatewayNamespace_ + common.ServiceWebSocket,
		FrontendService:  common.ServiceWebNamespace_ + common.ServiceFrontStatics,
		WebDAVService:    common.ServiceGatewayDav,
		GrpcService:      common.ServiceGatewayGrpc,
	}
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGatewayProxy),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("Main HTTP proxy for exposing a unique address to the world"),
			// service.Unique(true),
			service.WithGeneric(func(opts ...server.Option) server.Server {
				srv := &gatewayProxyServer{context.TODO()}

				return service.NewGenericServer(srv, opts...)
			}),
			service.BeforeInit(func(s service.Service) error {
				caddy.Enable(caddyfile, play)
				return nil
			}),
			service.AfterStart(func(s service.Service) error {

				logFunc := log.Logger(s.Options().Context).Debug
				restartFunc := func() {
					caddy.Restart()
				}
				watcher := newWatcher(logFunc, restartFunc)

				// Watching broker events
				if err := watcher.subscribeToBroker(); err != nil {
					return err
				}

				// Watching plugins
				for _, cPath := range caddy.GetConfigPaths() {
					err := watcher.subscribeToConfigs(cPath...)
					if err != nil {
						return err
					}
				}

				// Watching sites
				err := watcher.subscribeToConfigs("defaults", "sites")
				if err != nil {
					return err
				}

				return nil
			}),
		)
	})
}

type gatewayProxyServer struct {
	ctx context.Context
}

func (g *gatewayProxyServer) Start() error {
	ctx := g.ctx

	if sites, er := config.LoadSites(); er == nil {
		// TODO : THIS COULD BE SET A SITE LEVEL INSIDE CADDY CONFIGS
		useLE := false
		for _, s := range sites {
			if s.HasTLS() && s.GetLetsEncrypt() != nil {
				le := s.GetLetsEncrypt()
				if le.AcceptEULA {
					caddytls.Agreed = true
				}
				if le.StagingCA {
					caddytls.DefaultCAUrl = caddy.DefaultCaStagingUrl
				}
				useLE = true
				break
			}
		}
		if useLE {
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

				return err
			}
		}
	}

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
		} else if errorUtils.IsErrorPortBusy(err) {
			//log.Logger(ctx).Error("port is busy - return retry error", zap.Error(err))
			return errors.New(errorUtils.ErrServiceStartNeedsRetry + " - " + err.Error())
		}

		return err
	}

	return nil
}

func (g *gatewayProxyServer) Addresses() []net.Addr {
	var addresses []net.Addr
	for _, s := range caddy.GetInstance().Servers() {
		addresses = append(addresses, s.Addr())
	}
	return addresses
}

func (g *gatewayProxyServer) Stop() error {
	instance := caddy.GetInstance()
	if instance != nil {
		return caddy.GetInstance().Stop()
	}
	return nil
}

func play(site ...caddy.SiteConf) (*bytes.Buffer, error) {
	LoadCaddyConf()

	template := caddy.Get().GetTemplate()

	buf := bytes.NewBuffer([]byte{})
	if err := template.Execute(buf, caddyconf); err != nil {
		return nil, err
	}
	if common.LogLevel == zap.DebugLevel {
		fmt.Println(buf.String())
	}

	return buf, nil
}

// LoadCaddyConf reads the pydio config and fills a CaddyTemplateConf object ready
// to be executed by template.
func LoadCaddyConf() error {

	caddyconf.Logs = config.ApplicationWorkingDir(config.ApplicationDirLogs)
	caddyconf.WebRoot = "/" + uuid.New()
	caddyconf.PublicBaseUri = config.GetPublicBaseUri()

	caddyconf.FrontReady = caddy.ServiceReady(caddyconf.FrontendService)
	if !caddyconf.FrontReady {
		if mDir, e := caddy.GetMaintenanceRoot(); e == nil {
			caddyconf.WebRoot = mDir
		}
	}

	sites, er := config.LoadSites()
	if er != nil {
		return er
	}
	caddyconf.Sites, er = caddy.SitesToCaddyConfigs(sites)
	if er != nil {
		return er
	}

	return nil
}

func insurePathIsWritable(ctx context.Context, parDir string) error {

	// Try to create the default parent location.
	err := os.MkdirAll(parDir, 0700)
	if err != nil {
		return err
	}

	// Perform a touch like test to be OS independent
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
