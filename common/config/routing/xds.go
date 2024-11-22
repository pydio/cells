package routing

import (
	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	matcherv3 "github.com/envoyproxy/go-control-plane/envoy/type/matcher/v3"

	"github.com/pydio/cells/v5/common/proto/install"
)

var (
	localToCoreHeaderAction = map[install.HeaderModAction]core.HeaderValueOption_HeaderAppendAction{
		install.HeaderModAction_APPEND_IF_EXISTS_OR_ADD:    core.HeaderValueOption_APPEND_IF_EXISTS_OR_ADD,
		install.HeaderModAction_ADD_IF_ABSENT:              core.HeaderValueOption_ADD_IF_ABSENT,
		install.HeaderModAction_OVERWRITE_IF_EXISTS_OR_ADD: core.HeaderValueOption_OVERWRITE_IF_EXISTS_OR_ADD,
		install.HeaderModAction_OVERWRITE_IF_EXISTS:        core.HeaderValueOption_OVERWRITE_IF_EXISTS,
	}
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
		var reqAdd, respAdd []*core.HeaderValueOption
		var reqRem, respRem []string
		for _, m := range r.HeaderMods {
			mod := m.(*install.HeaderMod)
			if mod.Action == install.HeaderModAction_REMOVE {
				if mod.ApplyTo == install.HeaderModApplyTo_REQUEST {
					reqRem = append(reqRem, mod.Key)
				} else {
					respRem = append(respRem, mod.Key)
				}
			} else {
				hvo := &core.HeaderValueOption{
					Header:       &core.HeaderValue{Key: mod.Key, Value: mod.Value},
					AppendAction: localToCoreHeaderAction[mod.Action],
				}
				if mod.ApplyTo == install.HeaderModApplyTo_REQUEST {
					reqAdd = append(reqAdd, hvo)
				} else {
					respAdd = append(respAdd, hvo)
				}
			}
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
			RequestHeadersToAdd:     reqAdd,
			RequestHeadersToRemove:  reqRem,
			ResponseHeadersToAdd:    respAdd,
			ResponseHeadersToRemove: respRem,
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
