package routing

import (
	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	matcherv3 "github.com/envoyproxy/go-control-plane/envoy/type/matcher/v3"

	"github.com/pydio/cells/v4/common/proto/install"
)

// ToXDS is a WIP implementation for generating XDS configuration from active proxy
func ToXDS(site *install.ProxyConfig, upstreamsResolver UpstreamsResolver) (*route.VirtualHost, error) {

	tlsRequire := route.VirtualHost_NONE
	emptyTlsResolver := func(site *ActiveProxy) error {
		if site.TLSConfig != nil {
			tlsRequire = route.VirtualHost_EXTERNAL_ONLY
		}
		return nil
	}

	var rewriteResolver RewritesResolver
	type prefixReplacer struct {
		PrefixRewrite string
	}
	rewriteResolver = func(active *ActiveRoute, route Route, rule *install.Rule) {
		if rule.Action == "Rewrite" {
			active.RewriteRules = append(active.RewriteRules, &prefixReplacer{PrefixRewrite: route.GetURI()})
		}
	}

	activeProxy, er := ResolveProxy(site, emptyTlsResolver, rewriteResolver, upstreamsResolver)
	if er != nil {
		return nil, er
	}

	vh := &route.VirtualHost{
		Name:                   activeProxy.Hash(),
		Domains:                nil,
		Routes:                 nil,
		RequireTls:             tlsRequire,
		VirtualClusters:        nil,
		RateLimits:             nil,
		RetryPolicy:            nil,
		RetryPolicyTypedConfig: nil,
	}

	for _, r := range activeProxy.Routes {
		var hh []*core.HeaderValueOption
		for k, v := range r.RequestHeaderSet {
			hh = append(hh, &core.HeaderValueOption{Header: &core.HeaderValue{Key: k, Value: v}})
		}
		// Prefix rewrite may have been resolved by rewriteResolver
		var prefixRewrite string
		var regexRewrite *matcherv3.RegexMatchAndSubstitute
		for _, rw := range r.RewriteRules {
			if pref, ok := rw.(*prefixReplacer); ok {
				prefixRewrite = pref.PrefixRewrite
			} else if regex, ok2 := rw.(*matcherv3.RegexMatchAndSubstitute); ok2 {
				regexRewrite = regex
			}
		}

		vh.Routes = append(vh.Routes, &route.Route{
			Match: &route.RouteMatch{
				PathSpecifier: &route.RouteMatch_Prefix{Prefix: r.Path},
			},
			RequestHeadersToAdd: hh,
			Action: &route.Route_Route{
				Route: &route.RouteAction{
					RegexRewrite:  regexRewrite,
					PrefixRewrite: prefixRewrite,
					ClusterSpecifier: &route.RouteAction_Cluster{
						Cluster: "upstream-name?",
					},
				},
			},
		})
	}

	return vh, nil
}
