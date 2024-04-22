package caddy

import (
	"bytes"
	"context"
	"fmt"
	"text/template"

	"github.com/caddyserver/caddy/v2/caddyconfig"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/pydio/caddyvault"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	caddytemplate = `
{
  auto_https disable_redirects
{{if .DisableAdmin}}  admin off{{end}}
{{if .Storage}}  storage {{.Storage}}{{end}}
{{if .EnableMetrics}}  servers {
    metrics
  }{{end}}
}



{{range .Sites}}
{{$SiteHash := .Hash}}
{{$SiteWebRoot := .WebRoot}}
{{$ExternalHost := .ExternalHost}}
{{$Maintenance := .Maintenance}}
{{$MaintenanceConditions := .MaintenanceConditions}}
{{range .Binds}}{{.}} {{end}} {

	root * "{{if $SiteWebRoot}}{{$SiteWebRoot}}{{else}}{{$.WebRoot}}{{end}}"

#    tracing {
#		span example
#	}
	{{range .Routes}}
	route {{.Path}} {
		{{if $ExternalHost}}request_header Host {{$ExternalHost}}{{end}}
		request_header X-Real-IP {http.request.remote}
		request_header X-Forwarded-Proto {http.request.scheme}
		request_header X-Pydio-Site-Hash {{ $SiteHash }}

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

		{{range .RewriteRules}}{{.}}
		{{end}}
		# Apply mux
		{{.FinalDirective}}
	}
	{{end}}

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

type TplData struct {
	Sites         []SiteConf
	WebRoot       string
	Storage       string
	EnableMetrics bool
	DisableAdmin  bool
}

func FromTemplate(ctx context.Context, caddySites []SiteConf, external bool) ([]byte, error) {
	tmpl, err := template.New("pydiocaddy").Parse(caddytemplate)
	if err != nil {
		return nil, err
	}

	tplData := TplData{
		Sites:         caddySites,
		WebRoot:       uuid.New(), // non-existing path to make sure we don't statically serve local folder
		EnableMetrics: runtime.MetricsEnabled(),
		DisableAdmin:  !external,
	}

	k, e := storage.OpenStore(ctx, runtime.CertsStoreURL())
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

	if common.LogLevel == zap.InfoLevel {
		fmt.Println(string(b))
	}

	// Load config directly from memory
	adapter := caddyconfig.GetAdapter("caddyfile")
	confs, ww, err := adapter.Adapt(b, map[string]interface{}{})
	if err != nil {
		return nil, err
	}
	for _, w := range ww {
		log.Logger(ctx).Warn(w.String())
	}
	return confs, nil

}
