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
	"net/url"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/middleware/keys"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

// SiteFromContext lookups for siteHash in the context
func SiteFromContext(ctx context.Context, ss []*install.ProxyConfig) (*install.ProxyConfig, *url.URL, bool) {
	meta, ok := propagator.FromContextRead(ctx)
	if !ok {
		return nil, nil, false
	}
	siteHash, ok2 := meta[common.XPydioSiteHash]
	if !ok2 || len(siteHash) == 0 {
		return nil, nil, false
	}
	var found *install.ProxyConfig
	for _, site := range ss {
		if site.Hash() == siteHash {
			found = site
			break
		}
	}
	var u *url.URL
	if found != nil {
		if host, o := propagator.CanonicalMeta(ctx, keys.HttpMetaHost); o {
			for _, eu := range found.GetExternalUrls() {
				if eu.Host == host {
					u = eu
					break
				}
			}
		}
	}
	return found, u, found != nil
}

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
