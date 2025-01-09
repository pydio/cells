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

package routing

import (
	"net/url"
	"strings"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/install"
)

type ActiveRoute struct {
	Path         string
	HeaderMods   []any
	RewriteRules []any
	Upstreams    []any
}

type ActiveProxy struct {
	*install.ProxyConfig
	Routes []*ActiveRoute

	// Resolved values
	TLS string
}

// TLSResolver converts TLS config into runtime-usable tls directives
type TLSResolver func(site *ActiveProxy) error

// UpstreamsResolver finds cluster upstreams for a given route URI
type UpstreamsResolver func(string) ([]*url.URL, error)

// RewritesResolver converts generic rewrite instructions into runtime-usable directives
type RewritesResolver func(active *ActiveRoute, route Route, rule *install.Rule)

// Redirects compute required redirects if SSLRedirect is set
func (s *ActiveProxy) Redirects() map[string]string {
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

// ResolveProxy is used with custom resolvers to resolve a proxyConfig to a runtime-usable configuration.
// Resolvers are implemented by proxies to write correct configuration files
func ResolveProxy(proxyConfig *install.ProxyConfig, tlsResolver TLSResolver, rewriteResolver RewritesResolver, upstreamResolver UpstreamsResolver) (*ActiveProxy, error) {
	site := &ActiveProxy{
		ProxyConfig: proto.Clone(proxyConfig).(*install.ProxyConfig),
	}
	var setExternalHost string
	if proxyConfig.ReverseProxyURL != "" {
		if u, e := url.Parse(proxyConfig.ReverseProxyURL); e == nil {
			setExternalHost = u.Host
		}
	}

	if tlsResolver != nil {
		if er := tlsResolver(site); er != nil {
			return nil, er
		}
	}

	site.Routes = []*ActiveRoute{}
	var lastRoute *ActiveRoute
	for _, route := range ListRoutes() {
		rule := site.FindRouteRule(route.GetID())
		if !site.HasRouting() || rule.Accept() {
			cr := &ActiveRoute{
				Path: route.GetURI() + "*",
			}
			for _, hm := range proxyConfig.GetHeaderMods() {
				cr.HeaderMods = append(cr.HeaderMods, hm)
			}
			cr.HeaderMods = append(cr.HeaderMods, &install.HeaderMod{
				ApplyTo: install.HeaderModApplyTo_REQUEST,
				Action:  install.HeaderModAction_OVERWRITE_IF_EXISTS_OR_ADD,
				Key:     common.XPydioSiteHash,
				Value:   proxyConfig.Hash(),
			})
			if setExternalHost != "" {
				cr.HeaderMods = append(cr.HeaderMods, &install.HeaderMod{
					ApplyTo: install.HeaderModApplyTo_REQUEST,
					Action:  install.HeaderModAction_OVERWRITE_IF_EXISTS_OR_ADD,
					Key:     "Host",
					Value:   setExternalHost,
				})
			}
			if rule.Action == "Rewrite" {
				cr.HeaderMods = append(cr.HeaderMods, &install.HeaderMod{
					ApplyTo: install.HeaderModApplyTo_REQUEST,
					Action:  install.HeaderModAction_OVERWRITE_IF_EXISTS_OR_ADD,
					Key:     "X-Pydio-Site-RouteURI",
					Value:   rule.Value,
				})
				// Append another route for denying original route
				if route.GetURI() != "/" {
					dcr := &ActiveRoute{
						Path: route.GetURI(),
					}
					rewriteResolver(dcr, route, &install.Rule{Action: "Forbidden"})
					site.Routes = append(site.Routes, dcr)
				}
			}
			rewriteResolver(cr, route, rule)
			if upstreamResolver != nil {
				endpoint := route.GetURI() + "/"
				if route.GetURI() == "/" {
					endpoint = "/"
				}
				if tt, er := upstreamResolver(endpoint); er == nil {
					for _, t := range tt {
						cr.Upstreams = append(cr.Upstreams, t)
					}
				} else {
					//fmt.Println("Skip registering route " + route.GetURI() + " as no target is found")
					continue
				}
			}
			if route.GetURI() == "/" {
				lastRoute = cr
			} else {
				site.Routes = append(site.Routes, cr)
			}
		}
	}

	// Push "/*" to last position
	if lastRoute != nil {
		site.Routes = append(site.Routes, lastRoute)
	}

	return site, nil
}
