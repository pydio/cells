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
	// Collabora definition from plugins
	Collabora *url.URL

	// FPM connection, either an URL or a socket file path
	Fpm string

	// Root of the PHP Frontend
	Root string

	// Dedicated log file for caddy errors to ease debugging
	Logs string
	// Caddy compliant TLS string, either "self_signed" or paths to "cert key"
	TLS string
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
	proxy /ws   {{.WebSocket.Host}} {
		websocket
		without /ws
	}
	proxy /plug/   {{.FrontPlugins.Host}} {
		transparent
		without /plug/
	}

	{{if .Collabora}}
	proxy /loleaflet/ https://{{.Collabora.Host}}/loleaflet {
		transparent
		insecure_skip_verify
		without /loleaflet/
	}

	proxy /hosting/discovery https://{{.Collabora.Host}}/hosting/discovery {
		transparent
		insecure_skip_verify
		without /hosting/discovery
	}

	proxy /lool/ https://{{.Collabora.Host}}/lool/ {
		transparent
		insecure_skip_verify
		websocket
		without /lool/
	}
	{{end}}

	fastcgi / {{.Fpm}} php {
		root  "{{.Root}}"
		index index.php
	}
	status 403 {
		/data
		/core
		/conf
	}
	rewrite {
		if {path} not_starts_with "/a/"
		if {path} not_starts_with "/auth/"
		if {path} not_starts_with "/io"
		if {path} not_starts_with "/ws/"
		if {path} not_starts_with "/plug/"
		if {path} not_starts_with "/loleaflet/"
		if {path} not_starts_with "/hosting/discovery"
		if {path} not_starts_with "/lool/"
		to {path} {path}/ /index.php
	}

	{{if .TLS}}tls {{.TLS}}{{end}}
	root "{{.Root}}"
	errors "{{.Logs}}/caddy_errors.log"
}
`

	DefaultCaddyfile = filepath.Join(ApplicationDataDir(), "Caddyfile")
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
		} else {
			cert := Get("cert", "proxy", "certFile").String("")
			key := Get("cert", "proxy", "keyFile").String("")
			if cert != "" && key != "" {
				c.TLS = fmt.Sprintf("%s %s", cert, key)
			} else {
				fmt.Println("Missing one of certFile/keyFile in SSL declaration. Will not enable SSL on proxy")
			}
		}
	}

	if p, e := internalUrlFromConfig("micro.api", []string{"services", "micro.api", "port"}, servicesHost, tls); e == nil {
		c.Micro = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("dex", []string{"services", "pydio.grpc.auth", "dex", "web", "http"}, servicesHost, tls, true); e == nil {
		c.Dex = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("gateway.data", []string{"services", "pydio.grpc.gateway.data", "port"}, servicesHost, tls); e == nil {
		c.Gateway = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("websocket", []string{"services", "pydio.api.websocket", "port"}, servicesHost, tls); e == nil {
		c.WebSocket = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("front plugins", []string{"services", "pydio.api.front-plugins", "port"}, servicesHost, tls); e == nil {
		c.FrontPlugins = p
	} else {
		return c, e
	}

	if p, e := internalUrlFromConfig("collabora", []string{"frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_WEBSOCKET_PORT"}, servicesHost, tls); e == nil {
		c.Collabora = p
	} else {
		c.Collabora = nil
	}

	if fpm := Get("defaults", "fpm").String(""); fpm == "" {
		return c, fmt.Errorf("missing fpm configuration")
	} else {
		c.Fpm = fpm
	}

	if root := Get("defaults", "frontRoot").String(""); root == "" {
		return c, fmt.Errorf("missing frontRoot configuration")
	} else {
		c.Root = root
	}

	return c, nil
}

func internalUrlFromConfig(name string, path []string, host string, tls bool, split ...bool) (*url.URL, error) {
	port := Get(path...).String("")
	if port == "" {
		return nil, fmt.Errorf("cannot find port in config for %s", name)
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
