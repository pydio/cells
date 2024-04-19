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
	"fmt"
	"net/url"
	"path/filepath"
	"strings"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/crypto/providers"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type CaddyRoute struct {
	Path         string
	RewriteRules []string
}

type SiteConf struct {
	*install.ProxyConfig
	Routes []CaddyRoute

	// Parsed values from proto oneOf
	TLS     string
	TLSCert string
	TLSKey  string
	// Parsed External host if any
	ExternalHost string
	// Custom Root for this site
	WebRoot string
	// LogFile for this site
	Log string
	// LogLevel for this site
	LogLevel string
}

// Redirects compute required redirects if SSLRedirect is set
func (s SiteConf) Redirects() map[string]string {
	rr := make(map[string]string)
	for _, bind := range s.GetBinds() {
		parts := strings.Split(bind, ":")
		var host, port string
		if len(parts) == 2 {
			host = parts[0]
			port = parts[1]
			if host == "" {
				host = "0.0.0.0"
			}
		} else {
			host = bind
		}
		targetHost := host
		if host == "0.0.0.0" {
			targetHost = "{host}"
			host = ":80"
		}
		if port == "" || port == "443" {
			rr["http://"+host] = "https://" + targetHost + "{uri} permanent"
		} else if port == "80" {
			continue
		} else {
			rr["http://"+host] = "https://" + targetHost + ":" + port + "{uri} permanent"
		}
	}

	return rr
}

// SitesToCaddyConfigs computes all SiteConf from all *install.ProxyConfig by analyzing
// TLSConfig, ReverseProxyURL and Maintenance fields values
func SitesToCaddyConfigs(sites []*install.ProxyConfig) (caddySites []SiteConf, er error) {
	for _, proxyConfig := range sites {
		if bc, er := computeSiteConf(proxyConfig); er == nil {
			caddySites = append(caddySites, bc)
		} else {
			return caddySites, er
		}
	}
	return caddySites, nil
}

func computeSiteConf(pc *install.ProxyConfig) (SiteConf, error) {
	bc := SiteConf{
		ProxyConfig: proto.Clone(pc).(*install.ProxyConfig),
	}
	if pc.ReverseProxyURL != "" {
		if u, e := url.Parse(pc.ReverseProxyURL); e == nil {
			bc.ExternalHost = u.Host
		}
	}
	if bc.TLSConfig == nil {
		for i, b := range bc.Binds {
			bc.Binds[i] = "http://" + strings.Replace(b, "0.0.0.0", "", 1)
		}
	} else {
		for i, b := range bc.Binds {
			bc.Binds[i] = strings.Replace(b, "0.0.0.0", "", 1)
		}
		switch v := bc.TLSConfig.(type) {
		case *install.ProxyConfig_Certificate, *install.ProxyConfig_SelfSigned:
			certFile, keyFile, err := providers.LoadCertificates(pc, runtime.CertsStoreURL())
			if err != nil {
				return bc, err
			}
			bc.TLSCert = certFile
			bc.TLSKey = keyFile
		case *install.ProxyConfig_LetsEncrypt:
			caUrl := common.DefaultCaUrl
			if v.LetsEncrypt.StagingCA {
				caUrl = common.DefaultCaStagingUrl
			}
			bc.TLS = v.LetsEncrypt.Email + ` {
				ca ` + caUrl + `
			}`
		}
	}
	bc.WebRoot = uuid.New()

	// Translating log level to caddy
	logLevel := runtime.LogLevel()
	if logLevel != "warn" {
		if logLevel == "debug" {
			bc.Log = filepath.Join(runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs), "caddy_access.log")
			bc.LogLevel = "INFO"
		} else {
			bc.Log = filepath.Join(runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs), "caddy_errors.log")
			bc.LogLevel = "ERROR"
		}
	}

	bc.Routes = []CaddyRoute{{Path: "/*"}}
	if bc.HasRouting() {
		bc.Routes = []CaddyRoute{}
		for _, route := range routing.ListRoutes() {
			rule := bc.FindRouteRule(route.GetID())
			if rule.Accept() {
				cr := CaddyRoute{Path: route.GetURI() + "*"}
				if rule.Action == "Rewrite" {
					inputURI := rule.Value

					realTarget := route.GetURI()
					if realTarget == "/" {
						cr.Path = inputURI + "*"
						cr.RewriteRules = append(cr.RewriteRules, fmt.Sprintf("uri %s* strip_prefix %s", inputURI, inputURI))
					} else {
						cr.Path = inputURI + "/*"
						cr.RewriteRules = append(cr.RewriteRules, fmt.Sprintf("uri %s/* replace %s/ %s/ 1", inputURI, inputURI, realTarget))
					}
					cr.RewriteRules = append(cr.RewriteRules, fmt.Sprintf("request_header X-Pydio-Site-RouteURI %s", inputURI))
				}
				bc.Routes = append(bc.Routes, cr)
			}
		}
	}

	return bc, nil
}
