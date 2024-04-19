package routing

import (
	"context"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"net/url"
)

// SiteFromContext lookups for siteHash in the context
func SiteFromContext(ctx context.Context, ss []*install.ProxyConfig) (*install.ProxyConfig, bool) {
	meta, ok := metadata.FromContextRead(ctx)
	if !ok {
		return nil, false
	}
	siteHash, ok2 := meta[common.XPydioSiteHash]
	if !ok2 || len(siteHash) == 0 {
		return nil, false
	}
	var found *install.ProxyConfig
	for _, site := range ss {
		if site.Hash() == siteHash {
			found = site
			break
		}
	}
	return found, found != nil
}

func SiteContextDiscoveryRoutes(ctx context.Context, uriForSameSite ...bool) (map[string][]*url.URL, error) {
	ss, er := LoadSites()
	if er != nil {
		return nil, er
	}
	output := map[string][]*url.URL{}
	routes := ListRoutes()
	useUri := len(uriForSameSite) > 0 && uriForSameSite[0]

	crtSite, ok := SiteFromContext(ctx, ss)
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
