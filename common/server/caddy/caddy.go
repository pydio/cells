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
	"go.uber.org/zap"
	"html/template"
	"net"
	"net/http/pprof"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	_ "github.com/caddyserver/caddy/v2/modules/standard"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/mux"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	caddytemplate = `
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

func init() {
	server.DefaultURLMux().Register("caddy", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	return New(ctx, "")
}

type Server struct {
	*server.ListableMux
	id   string
	name string
	meta map[string]string

	serveDir        string
	rootCtx         context.Context
	restartRequired bool

	caddyConfig []byte
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
		ListableMux: srvMUX,
	}

	return server.NewServer(ctx, srv), nil
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, er error) {
	aa, err := s.ComputeConfs()
	if err != nil {
		return nil, err
	}

	if er := caddy.Load(s.caddyConfig, true); er != nil {
		return nil, er
	}

	for _, a := range aa {
		ii = append(ii, util.CreateAddress(a, nil))
	}

	for _, e := range s.ListableMux.Patterns() {
		ii = append(ii, util.CreateEndpoint(e, nil))
	}

	return
}

func (s *Server) ComputeConfs() ([]string, error) {
	// Creating temporary caddy file
	sites, err := config.LoadSites()
	if err != nil {
		return nil, err
	}

	caddySites, err := SitesToCaddyConfigs(sites)
	if err != nil {
		return nil, err
	}

	tmpl, err := template.New("pydiocaddy").Parse(caddytemplate)
	if err != nil {
		return nil, err
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
		return nil, err
	}

	b := buf.Bytes()
	b = caddyfile.Format(b)

	if common.LogLevel == zap.DebugLevel {
		fmt.Println(string(b))
	}

	// Load config directly from memory
	adapter := caddyconfig.GetAdapter("caddyfile")
	confs, ww, err := adapter.Adapt(b, map[string]interface{}{})
	if err != nil {
		return nil, err
	}
	for _, w := range ww {
		log.Logger(s.rootCtx).Warn(w.String())
	}
	s.caddyConfig = confs

	var addresses []string
	for _, site := range caddySites {
		for _, bind := range site.GetBinds() {
			//s.addresses = append(s.addresses, bind)

			bind = strings.TrimPrefix(bind, "http://")
			bind = strings.TrimPrefix(bind, "https://")

			host, port, err := net.SplitHostPort(bind)
			if err != nil {
				continue
			}
			ip := net.ParseIP(host)
			if ip == nil || ip.IsUnspecified() {
				addresses = append(addresses, net.JoinHostPort(runtime.DefaultAdvertiseAddress(), port))
			} else {
				addresses = append(addresses, bind)
			}
		}
	}
	return addresses, nil
}

func (s *Server) Type() server.Type {
	return server.TypeHttp
}

func (s *Server) Stop() error {
	return caddy.Stop()
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
