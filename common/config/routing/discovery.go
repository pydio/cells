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
	"context"
	"fmt"
	"net/url"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/middleware/keys"
	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// SiteFromContext lookups for siteHash in the context
func SiteFromContext(ctx context.Context, ss []*install.ProxyConfig) (*install.ProxyConfig, *url.URL, bool) {
	meta, ok := propagator.FromContextRead(ctx)
	if !ok {
		return nil, nil, false
	}

	var pcs []*install.ProxyConfig

	// Try to retrieve the proxy config directly from the hash
	if siteHash, ok := meta[common.XPydioSiteHash]; ok && len(siteHash) == 1 {
		for _, site := range ss {
			if site.Hash() == siteHash {
				pcs = append(pcs, site)
				break
			}
		}

		if len(pcs) == 0 {
			return nil, nil, false
		}
	} else {
		pcs = ss
	}

	if host, ok := propagator.CanonicalMeta(ctx, keys.HttpMetaHost); ok {
		for _, pc := range pcs {
			for _, eu := range pc.GetExternalUrls() {
				if eu.Host == host {
					return pc, eu, true
				}
			}
		}

		u, err := url.Parse(host)
		if err != nil {
			return nil, nil, false
		}

		return &install.ProxyConfig{
			ReverseProxyURL: host,
		}, u, true
	}

	return nil, nil, false
}

// SiteToContext artificially push a site and its Host to context for further resolution
func SiteToContext(ctx context.Context, site *install.ProxyConfig) (context.Context, error) {
	ee := site.GetExternalUrls()
	var first *url.URL
	for _, u := range ee {
		first = u
		break
	}
	if first == nil {
		return ctx, fmt.Errorf("could not find at least one URL for site, this is unexpected")
	}
	return propagator.WithAdditionalMetadata(ctx, map[string]string{
		common.XPydioSiteHash: site.Hash(),
		keys.HttpMetaHost:     first.Host,
	}), nil
}

// SiteContextDiscoveryRoutes lists all external urls for each registered routes, in the current site context
func SiteContextDiscoveryRoutes(ctx context.Context, uriForSameSite ...bool) (map[string][]*url.URL, error) {
	ss, er := LoadSites(ctx)
	if er != nil {
		return nil, er
	}
	output := map[string][]*url.URL{}
	routes := ListRoutes()
	useUri := len(uriForSameSite) > 0 && uriForSameSite[0]

	crtSite, _, ok := SiteFromContext(ctx, ss)
	if !ok {
		// No site in context, return un-resolved routes list
		for _, r := range routes {
			output[r.GetID()] = append(output[r.GetID()], &url.URL{Path: r.GetURI()})
		}
		return output, nil
	}

	for _, r := range routes {
		rId := r.GetID()
		rUri := r.GetURI()
		rule := crtSite.FindRouteRule(rId)
		if rule.Accept() {
			if useUri {
				output[rId] = append(output[rId], &url.URL{Path: rule.IngressURI(rUri)})
			} else {
				output[rId] = append(output[rId], sitesRuleUrl(r, crtSite, rule)...)
			}
		} else {
			// find first accepting site
			for _, s := range ss {
				if s.Hash() == crtSite.Hash() {
					continue
				}
				if ru := s.FindRouteRule(r.GetID()); ru.Accept() {
					output[rId] = append(output[rId], sitesRuleUrl(r, s, ru)...)
				}
			}
		}
	}
	return output, nil
}

func sitesRuleUrl(route Route, site *install.ProxyConfig, rule *install.Rule) (out []*url.URL) {
	uu := site.GetExternalUrls()
	for _, v := range uu {
		v.Path = rule.IngressURI(route.GetURI())
		out = append(out, v)
	}
	return
}

// RouteIngressURIContext traces back the current external URI for context, returning a default and logging error
func RouteIngressURIContext(ctx context.Context, routeID, defaultURI string) string {
	r, er := RouteIngressURIContextErr(ctx, routeID)
	if er != nil {
		log.Logger(ctx).Warn(er.Error())
		return defaultURI
	}
	return r
}

// RouteIngressURIContextErr traces back the current external URI for context, returning an error
func RouteIngressURIContextErr(ctx context.Context, routeID string) (string, error) {
	route, ok := RouteById(routeID)
	if !ok {
		return "", fmt.Errorf("cannot find route by id %s", routeID)
	}
	ss, er := LoadSites(ctx)
	if er != nil {
		return "", er
	}
	crtSite, _, ok := SiteFromContext(ctx, ss)
	if !ok {
		return "", fmt.Errorf("cannot find site from context")
	}
	if rule := crtSite.FindRouteRule(routeID); rule.Accept() {
		return rule.IngressURI(route.GetURI()), nil
	}
	return "", fmt.Errorf("cannot find any accepting route id %s in this context", routeID)
}
