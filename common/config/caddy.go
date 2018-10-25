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

package config

import (
	"bytes"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/mholt/caddy"
	"github.com/pydio/cells/common"
	"go.uber.org/zap/zapcore"
)

// CaddyTemplateConf feeds Caddy template file with data
type CaddyTemplateConf struct {
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
	HttpRedirectSource *url.URL
	HttpRedirectTarget *url.URL
}

var (
	CaddyTemplate = `
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

	{{if .Collabora}}
	proxy /wopi/ {{.WOPI.Host}} {
		transparent
	}

	proxy /loleaflet/ {{if .TLS}}https://{{else}}http://{{end}}{{.Collabora.Host}}/loleaflet {
		transparent
		insecure_skip_verify
		without /loleaflet/
	}

	proxy /hosting/discovery {{if .TLS}}https://{{else}}http://{{end}}{{.Collabora.Host}}/hosting/discovery {
		transparent
		insecure_skip_verify
		without /hosting/discovery
	}

	proxy /lool/ {{if .TLS}}https://{{else}}http://{{end}}{{.Collabora.Host}}/lool/ {
		transparent
		insecure_skip_verify
		websocket
		without /lool/
	}
	{{end}}

	rewrite {
		if {path} not_starts_with "/a/"
		if {path} not_starts_with "/auth/"
		if {path} not_starts_with "/io"
		if {path} not_starts_with "/data"
		if {path} not_starts_with "/ws/"
		if {path} not_starts_with "/plug/"
		if {path} not_starts_with "/dav/"
		if {path} not_starts_with "/wopi/"
		if {path} not_starts_with "/loleaflet/"
		if {path} not_starts_with "/hosting/discovery"
		if {path} not_starts_with "/lool/"
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
	DefaultCaddyfile = filepath.Join(ApplicationDataDir(), "Caddyfile")
	DefaultCaUrl     = "https://acme-v01.api.letsencrypt.org/directory"
)

func init() {
	caddy.AppName = common.PackageLabel
	caddy.AppVersion = common.Version().String()
}

// LoadCaddyConf reads the pydio config and fill a CaddyTemplateConf object ready
// to be executed by template
func LoadCaddyConf() (*CaddyTemplateConf, error) {
	c := &CaddyTemplateConf{
		Logs: filepath.Join(ApplicationDataDir(), "logs"),
	}

	if bindUrl := Get("defaults", "urlInternal").String(""); bindUrl == "" {
		return c, fmt.Errorf("cannot find urlInternal configuration")
	} else {
		c.Bind, _ = url.Parse(bindUrl)
	}
	servicesHost := "localhost" // This should be detected on a per-service basis

	tls := Get("cert", "proxy", "ssl").Bool(false)
	if tls {
		if self := Get("cert", "proxy", "self").Bool(false); self {
			c.TLS = "self_signed"
		} else if certEmail := Get("cert", "proxy", "email").String(""); certEmail != "" {
			c.TLS = certEmail
		} else {
			cert := Get("cert", "proxy", "certFile").String("")
			key := Get("cert", "proxy", "keyFile").String("")
			if cert != "" && key != "" {
				c.TLS = fmt.Sprintf("%s %s", cert, key)
			} else {
				fmt.Println("Missing one of certFile/keyFile in SSL declaration. Will not enable SSL on proxy")
			}
		}
		if redir := Get("cert", "proxy", "httpRedir").Bool(false); redir && c.TLS != "" {
			if extUrl := Get("defaults", "url").String(""); extUrl != "" {
				var e error
				if c.HttpRedirectTarget, e = url.Parse(extUrl); e == nil {
					c.HttpRedirectSource, _ = url.Parse("http://" + c.HttpRedirectTarget.Hostname())
				}
			} else {
				return c, fmt.Errorf("cannot find url configuration")
			}
		}
	}

	if p, e := internalUrlFromConfig("micro.api", []string{"services", common.SERVICE_MICRO_API, "port"}, servicesHost, tls); e == nil {
		c.Micro = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("dex", []string{"services", common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH, "dex", "web", "http"}, servicesHost, tls, true); e == nil {
		c.Dex = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("gateway.data", []string{"services", common.SERVICE_GATEWAY_DATA, "port"}, servicesHost, tls); e == nil {
		c.Gateway = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("websocket", []string{"services", common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET, "port"}, servicesHost, tls); e == nil {
		c.WebSocket = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("web statics", []string{"services", common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS, "port"}, servicesHost, tls); e == nil {
		c.FrontPlugins = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("dav", []string{"services", common.SERVICE_GATEWAY_DAV, "port"}, servicesHost, tls); e == nil {
		c.DAV = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("wopi", []string{"services", common.SERVICE_GATEWAY_WOPI, "port"}, servicesHost, tls); e == nil {
		c.WOPI = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("collabora", []string{"frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_WEBSOCKET_PORT"}, servicesHost, tls); e == nil {
		c.Collabora = p
	} else {
		c.Collabora = nil
	}

	return c, nil
}

func internalUrlFromConfig(name string, path []string, host string, tls bool, split ...bool) (*url.URL, error) {
	port := Get(path...).String("")
	if port == "" {
		return nil, fmt.Errorf("[caddy] cannot find port in config for %s", name)
	}
	if len(split) > 0 && split[0] {
		parts := strings.Split(port, ":")
		port = parts[len(parts)-1]
	}
	u := "http://"
	if tls {
		u = "https://"
	}
	u += host + ":" + port
	parsed, e := url.Parse(u)
	if e != nil {
		return nil, fmt.Errorf("cannot parse url %s for %s", u, name)
	}
	return parsed, nil
}

// InitCaddyFile creates a caddy LoaderFunc with the correct contents
func InitCaddyFile(tpl string, tplData interface{}) error {

	buf := bytes.NewBuffer([]byte{})
	if tmpl, err := template.New("caddyfile").Parse(tpl); err != nil {
		return err
	} else {
		if err = tmpl.Execute(buf, tplData); err != nil {
			return err
		}
	}

	fmt.Printf("%s", buf)
	loader := func(serverType string) (caddy.Input, error) {
		return caddy.CaddyfileInput{
			Contents:       buf.Bytes(),
			ServerTypeName: serverType,
		}, nil
	}
	caddy.SetDefaultCaddyfileLoader("default", caddy.LoaderFunc(loader))
	if common.LogLevel == zapcore.DebugLevel {
		fmt.Println("Loading Caddy File", string(buf.Bytes()))
	}
	return nil

}

func ConfigureCaddyfile(t string, v interface{}) error {
	filename := filepath.Join(ApplicationDataDir(), "Caddyfile")

	if f, err := os.OpenFile(filename, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0644); err != nil {
		return err
	} else {
		defer f.Close()

		if tmpl, err := template.New("caddyfile").Parse(t); err != nil {
			return err
		} else {
			if err = tmpl.Execute(f, v); err != nil {
				return err
			}
		}
	}

	return nil
}

// provide loader function
func defaultLoader(serverType string) (caddy.Input, error) {
	contents, err := ioutil.ReadFile(DefaultCaddyfile)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	return caddy.CaddyfileInput{
		Contents: contents,
		//Filepath:       caddy.DefaultConfigFile,
		ServerTypeName: serverType,
	}, nil
}
