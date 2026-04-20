/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"net/url"
	"strings"
	"sync"
	"text/template"
	"time"

	"github.com/caddyserver/caddy/v2/caddyconfig"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/rs/cors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

const (
	caddytemplate = `
{
  auto_https disable_redirects
{{if .DisableAdmin}}  admin off{{end}}
{{if .Storage}}  storage {{.Storage}}{{end}}
{{if .RedirectLogWriter}}  log{
     output cells
 	 format json
  }{{end}}
}

{{- define "csv" -}}
{{- $first := true -}}
{{- range $i, $v := . -}}{{- if not $first}}, {{end -}}{{- $v -}}{{- $first = false -}}{{- end -}}
{{- end -}}

{{$CorsOptions := .CorsOptions}}
{{$RateLimit := .RateLimit}}
{{$RateLimitWindow := .RateLimitWindow}}

(cors) {
    # --- Preflight (OPTIONS) ---
	# Block bad preflights (Origin present but NOT allowed)
	@deny_preflight expression {http.request.method} == "OPTIONS" && {http.request.header.Origin} != "" && {args[0]} == ""
	respond @deny_preflight "Access denied" 403 {
			close
	}

	
	# Handle good preflights in one place
	@preflight_ok expression {http.request.method} == "OPTIONS" && {args[0]} != ""
	
	handle @preflight_ok {
			header {
					Access-Control-Allow-Origin      "{args[0]}"
					Access-Control-Allow-Methods     "{args[1]}"
					Access-Control-Allow-Headers     "{args[2]}"
					Access-Control-Allow-Credentials "{args[3]}"
					Access-Control-Max-Age           "{args[4]}"
					Vary                             Origin
			}
			respond {args[5]} {
				close
			}
	}

	# --- Actual requests (non-OPTIONS) ---
	# Block if Origin is present but NOT allowed
	@deny_actual expression {http.request.method} != "OPTIONS" && {http.request.header.Origin} != "" && {args[0]} == ""
	respond @deny_actual "Access denied" 403 {
			close
	}
	
	# For allowed origins, set ACAO (reflect) on normal responses
	@has_allowed expression {args[0]} != ""
	header @has_allowed {
			Access-Control-Allow-Origin      "{args[0]}"
			Access-Control-Allow-Credentials "{args[3]}"
			Access-Control-Expose-Headers    "{args[6]}"
			Vary                             "Origin"
	}
}

{{range .Sites}}
{{$MuxMode := .MuxMode}}
{{$SiteHash := .Hash}}
{{$Maintenance := .Maintenance}}
{{$MaintenanceConditions := .MaintenanceConditions}}

{{/* site effective CORS (if set, overrides global) */}}
{{$SiteCors := or .CorsOptions $CorsOptions}}

{{range .Binds}}{{.}} {{end}} {

	{{range .Routes}}
	route {{.Path}} {	

		{{/* route effective CORS (if set, overrides site CORS) */}}
		{{$RouteCors := or .CorsOptions $SiteCors}}

		{{- if $RouteCors }}
		{{- with $RouteCors }}
		# Single source of truth: set {allowed_origin} to the incoming Origin if allowed, else "".
        map {http.request.header.Origin} {allowed_origin} {
                default ""
				{{- range .AllowedOrigins}}
				{{- if eq . "*"}}
				~.*$ ${0}
				{{- else}}
				{{.}} {http.request.header.Origin}
				{{- end}}
				{{- end}}
        }
		{{- $allowedMethods := .AllowedMethods }}
		{{- $allowedHeaders := .AllowedHeaders }}
		{{- $maxAge := .MaxAge }}
		{{- $optionsSuccessStatus := .OptionsSuccessStatus }}
		{{- $exposedHeaders := .ExposedHeaders }}
		{{- $allowCredentials := .AllowCredentials }}
		import cors {allowed_origin} "{{template "csv" $allowedMethods}}" "{{template "csv" $allowedHeaders}}" {{$allowCredentials}} {{$maxAge}} {{$optionsSuccessStatus}} "{{template "csv" $exposedHeaders}}" 
		{{- end }}
		{{- end }}

		{{range .HeaderMods}}
			{{.}}
		{{end}}

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

		{{range .RewriteRules}}
			{{.}}
		{{end}}
		{{if $MuxMode}}
		# Apply mux
		mux
		{{else}}
		reverse_proxy {{joinUpstreams .Upstreams " "}} {{if $RouteCors}}{
			header_down -Access-Control-Allow-Origin
		}{{end}}
		{{end}}
	}
	{{end}}

	{{if .Log}}
	log {
		output file "{{.Log}}"
		level {{.LogLevel}}
	}
	{{end}}

	{{if .TLS}}tls {{.TLS}}{{end}}

	{{- if gt $RateLimit 0}}
	rate_limit {
		zone per_ip {
			key    {remote_host}
			window {{or $RateLimitWindow "1s"}}
			events {{$RateLimit}}
		}
	}
	{{- end }}
}
{{if .SSLRedirect}}
{{range $k,$v := .Redirects}}
{{$k}} {
	redir {{$v}}
}
{{end}}
{{end}}
{{end}}	`
)

type TplData struct {
	Sites             []*ActiveSite
	Storage           string
	MuxMode           bool
	EnableMetrics     bool
	DisableAdmin      bool
	RedirectLogWriter bool
	CorsOptions       *cors.Options
	RateLimitWindow   time.Duration
	RateLimit         int
}

var (
	parsedTpl  *template.Template
	parsedOnce sync.Once
)

func joinUpstreams(uu []any, sep string) string {
	var addr []string
	for _, u := range uu {
		if s, o := u.(string); o {
			addr = append(addr, s)
		} else if ur, o2 := u.(*url.URL); o2 {
			addr = append(addr, ur.String())
		}
	}
	return strings.Join(addr, sep)
}

func FromTemplate(ctx context.Context, tplData TplData) ([]byte, error) {
	var err error
	// TODO - if there is an error here it's not showing properly
	parsedOnce.Do(func() {
		parsedTpl, err = template.New("pydiocaddy").Funcs(template.FuncMap{"joinUpstreams": joinUpstreams}).Parse(caddytemplate)
	})
	if err != nil {
		return nil, err
	}

	buf := bytes.NewBuffer([]byte{})
	if err := parsedTpl.Execute(buf, tplData); err != nil {
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
		log.Logger(ctx).Warn(w.String())
	}
	return confs, nil
}
