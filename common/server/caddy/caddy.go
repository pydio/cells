/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package caddy

import (
	"bytes"
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"html/template"
	"net"
	"net/http/pprof"
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig"
	_ "github.com/caddyserver/caddy/v2/modules/standard"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/hooks"
	"github.com/pydio/cells/v4/common/server/caddy/mux"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	caddyRestartDebounce = 5 * time.Second
	caddyfile            = `
{
  auto_https disable_redirects
  admin off
}

{{range .Sites}}
{{$SiteWebRoot := .WebRoot}}
{{$ExternalHost := .ExternalHost}}
{{$Maintenance := .Maintenance}}
{{$MaintenanceConditions := .MaintenanceConditions}}
{{range .Binds}}{{.}} {{end}} {

	root * "{{if $SiteWebRoot}}{{$SiteWebRoot}}{{else}}{{$.WebRoot}}{{end}}"

	@list_buckets {
		path / /probe-bucket-sign*
		header Authorization *AWS4-HMAC-SHA256*
	}

	route /* {
		{{if $ExternalHost}}request_header Host {{$ExternalHost}}{{end}}
		request_header X-Real-IP {http.request.remote}
		request_header X-Forwarded-Proto {http.request.scheme}

		{{if $Maintenance}}
		# Special redir for maintenance mode
		@rmatcher {
			{{range $MaintenanceConditions}}{{.}}
			{{end}}
			not path /maintenance.html
		}
		request_header X-Maintenance-Redirect "true"
		redir @rmatcher /maintenance.html
		{{end}}	

		# Special rewrite for s3 list buckets (always sent on root path)
		rewrite @list_buckets /io{path}

		# Apply mux
		mux

		# If mux did not find endpoint, redirect all to root and re-apply mux
		rewrite /* /
		mux
	}

	{{if .TLS}}tls {{.TLS}}{{end}}
	{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
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
)

type Server struct {
	*server.ListableMux
	id   string
	name string
	meta map[string]string

	serveDir        string
	rootCtx         context.Context
	restartRequired bool
	watchDone       chan struct{}

	addresses         []string
	externalAddresses []string
	Confs             []byte
}

func New(ctx context.Context, dir string) (server.Server, error) {
	srvMUX := server.NewListableMux()
	srvMUX.HandleFunc("/debug/pprof/", pprof.Index)
	srvMUX.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	srvMUX.HandleFunc("/debug/pprof/profile", pprof.Profile)
	srvMUX.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	srvMUX.HandleFunc("/debug/pprof/trace", pprof.Trace)

	//We could use github.com/rantav/go-grpc-channelz to expose channelz
	//srvMUX.Handle("/debug/grpc/", channelz.CreateHandler("/debug/grpc", ":8001"))

	mux.RegisterServerMux(ctx, srvMUX)

	caddyStorePath := filepath.Join(config.ApplicationWorkingDir(), "caddy")
	_ = os.MkdirAll(caddyStorePath, 0755)
	if _, e := os.Stat(caddyStorePath); e == nil {
		caddy.DefaultStorage.Path = caddyStorePath
		caddy.ConfigAutosavePath = filepath.Join(caddyStorePath, "autosave.json")
	}

	srv := &Server{
		id:   "caddy-" + uuid.New(),
		name: "caddy",
		meta: server.InitPeerMeta(),

		rootCtx:     ctx,
		serveDir:    dir,
		watchDone:   make(chan struct{}, 1),
		ListableMux: srvMUX,
	}
	if err := srv.ComputeConfs(); err != nil {
		return nil, err
	}

	go srv.watchReload()

	return server.NewServer(ctx, srv), nil
}

func (s *Server) Serve() error {
	return caddy.Load(s.Confs, true)
}

func (s *Server) ComputeConfs() error {
	// Creating temporary caddy file
	sites, err := config.LoadSites()
	if err != nil {
		return err
	}

	caddySites, err := SitesToCaddyConfigs(sites)
	if err != nil {
		return err
	}

	tmpl, err := template.New("pydiocaddy").Parse(caddyfile)
	if err != nil {
		return err
	}

	type TplData struct {
		Sites   []SiteConf
		WebRoot string
	}
	tplData := TplData{Sites: caddySites}
	if s.serveDir != "" {
		tplData.WebRoot = s.serveDir
	}

	buf := bytes.NewBuffer([]byte{})
	if err := tmpl.Execute(buf, tplData); err != nil {
		return err
	}

	b := buf.Bytes()
	// fmt.Println(string(b))

	// Load config directly from memory
	adapter := caddyconfig.GetAdapter("caddyfile")
	confs, ww, err := adapter.Adapt(b, map[string]interface{}{})
	if err != nil {
		return err
	}
	for _, w := range ww {
		log.Logger(s.rootCtx).Warn(w.String())
	}
	s.Confs = confs

	s.addresses = []string{} // Empty slice on restart
	for _, site := range caddySites {
		for _, bind := range site.GetBinds() {
			s.addresses = append(s.addresses, bind)

			host, port, err := net.SplitHostPort(bind)
			if err != nil {
				continue
			}
			ip := net.ParseIP(host)
			if ip == nil || ip.IsUnspecified() {
				s.externalAddresses = append(s.externalAddresses, net.JoinHostPort(runtime.DefaultAdvertiseAddress(), port))
			} else {
				s.externalAddresses = append(s.externalAddresses, bind)
			}
		}
	}
	return nil
}

func (s *Server) Type() server.ServerType {
	return server.ServerType_HTTP
}

func (s *Server) Stop() error {
	close(s.watchDone)
	return caddy.Stop()
}

func (s *Server) Address() []string {
	return s.externalAddresses
}

func (s *Server) Endpoints() []string {
	return s.ListableMux.Patterns()
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*server.HttpMux); ok {
		*v = s.ListableMux
		return true
	}
	if v, ok := i.(*server.PatternsProvider); ok {
		*v = s.ListableMux
		return true
	}
	return false
}

func (s *Server) watchReload() {
	for {
		select {
		case <-hooks.RestartChan:
			log.Logger(context.Background()).Debug("Received Proxy Restart Event")
			s.restartRequired = true
		case <-time.After(caddyRestartDebounce):
			if s.restartRequired {
				log.Logger(context.Background()).Debug("Restarting Proxy Now")
				s.restartRequired = false
				e := s.ComputeConfs()
				if e == nil {
					e = caddy.Load(s.Confs, true)
				}
				if e != nil {
					log.Logger(s.rootCtx).Error("Could not restart caddy", zap.Error(e))
				}
			}
		case <-s.watchDone:
			fmt.Println("Stopping hooks watcher for caddy confs")
			return
		}
	}

}
