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
	"net"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"text/template"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/pydio/caddyvault"
	"go.uber.org/zap"
	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto/providers"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/mux"
	"github.com/pydio/cells/v4/common/server/http/routes"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/caddyserver/caddy/v2/modules/standard"
)

const (
	caddytemplate = `
{
  auto_https disable_redirects
  admin off
{{if .Storage}}  storage {{.Storage}}{{end}}
{{if .EnableMetrics}}  servers {
    metrics
  }{{end}}
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

#    tracing {
#		span example
#	}

	route /* {
		{{if $ExternalHost}}request_header Host {{$ExternalHost}}{{end}}
		request_header X-Real-IP {http.request.remote}
		request_header X-Forwarded-Proto {http.request.scheme}
		request_header X-Cells-Site SiteID

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
		# TODO - this URI must be resolved from routes, based on context, not hardcoded
		rewrite @list_buckets /io{path}

		# Apply mux
		mux
	}

	{{if .Log}}
	log {
		output file "{{.Log}}"
		level {{.LogLevel}}
	}
	{{end}}

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

var (
	providersLoggerInit sync.Once
)

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	return New(ctx, "")
}

type Server struct {
	routes.RouteRegistrar
	id   string
	name string
	meta map[string]string

	serveDir        string
	rootCtx         context.Context
	restartRequired bool

	caddyConfig []byte
}

func New(ctx context.Context, dir string) (server.Server, error) {

	providersLoggerInit.Do(func() {
		ct := log.CaptureCaddyStdErr("pydio.server.caddy")
		providers.Logger = log.Logger(ct)
	})

	srvMUX := routes.NewRouteRegistrar()
	srvID := "caddy-" + uuid.New()
	mux.RegisterServerMux(ctx, srvID, srvMUX)

	caddyStorePath := filepath.Join(runtime.ApplicationWorkingDir(), "caddy")
	_ = os.MkdirAll(caddyStorePath, 0755)
	if _, e := os.Stat(caddyStorePath); e == nil {
		caddy.DefaultStorage.Path = caddyStorePath
		caddy.ConfigAutosavePath = filepath.Join(caddyStorePath, "autosave.json")
	}

	srv := &Server{
		id:   srvID,
		name: "caddy",
		meta: make(map[string]string),

		rootCtx:        ctx,
		serveDir:       dir,
		RouteRegistrar: srvMUX,
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

	for _, e := range s.RouteRegistrar.Patterns() {
		ii = append(ii, util.CreateEndpoint(e, nil, nil))
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
		Sites         []SiteConf
		WebRoot       string
		Storage       string
		EnableMetrics bool
	}
	tplData := TplData{
		Sites:         caddySites,
		EnableMetrics: runtime.MetricsEnabled(),
	}
	if s.serveDir != "" {
		tplData.WebRoot = s.serveDir
	}

	k, e := storage.OpenStore(context.Background(), runtime.CertsStoreURL())
	if e != nil {
		return nil, e
	}
	// Special treatment for vault : append info to caddy
	if vs, ok := k.(*caddyvault.VaultStorage); ok {
		tplData.Storage = `vault {
  address "` + vs.API + `"
  token ` + vs.Token + `
  prefix ` + vs.Prefix + `
}`
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
	return s.RouteRegistrar.Patterns()
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

func (s *Server) SetMetadata(meta map[string]string) {
	s.meta = meta
}

func (s *Server) Clone() interface{} {
	clone := &Server{}
	clone.id = s.id
	clone.name = s.name
	clone.meta = maps.Clone(s.meta)

	return clone
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*routes.RouteRegistrar); ok {
		*v = s.RouteRegistrar
		return true
	}
	return false
}
