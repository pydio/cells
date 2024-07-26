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

package oauth

import (
	"context"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/ory/fosite"
	hconf "github.com/ory/hydra/v2/driver/config"
	"github.com/ory/hydra/v2/spec"
	hconfx "github.com/ory/x/configx"
	"github.com/ory/x/contextx"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/telemetry/tracing"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	ConfigCorePath = []string{"services", common.ServiceWebNamespace_ + common.ServiceOAuth}
	cacheProvider  *ProviderContextualizer
	rootCtxConfig  *hconfx.Provider
)

func init() {
	cacheProvider = &ProviderContextualizer{
		configPath: ConfigCorePath,
		cachePool: cache.MustOpenNonExpirableMemory(cache.WithAutoResetWatcher(func(ctx context.Context, url string) (cache.Watcher, error) {
			// watch "sites" and "oauth" configs
			return config.WatchCombined(ctx, [][]string{ConfigCorePath, routing.ConfigPath})
		})),
	}
	rootCtxConfig, _ = hconfx.New(contextx.RootContext, spec.ConfigValidationSchema)
}

func GetProviderContextualizer() *ProviderContextualizer {
	return cacheProvider
}

type ProviderContextualizer struct {
	configPath []string
	cachePool  *openurl.Pool[cache.Cache]
}

// Network returns the network id for the given context.
func (pc *ProviderContextualizer) Network(ctx context.Context, network uuid.UUID) uuid.UUID {
	return network
}

// Config returns the config for the given context.
func (pc *ProviderContextualizer) Config(ctx context.Context, provider *hconfx.Provider) *hconfx.Provider {
	// For RootContext, create an empty fallback provider
	if ctx == contextx.RootContext {
		return rootCtxConfig
	}
	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oauth.ContextualizedConfig")
	defer span.End()

	ka, _ := pc.cachePool.Get(ctx)

	var sites []*install.ProxyConfig
	if !ka.Get("sites", &sites) {
		if ss, er := routing.LoadSites(ctx); er != nil {
			panic(er)
		} else {
			sites = ss
			_ = ka.Set("sites", sites)
		}
	}
	site, rootURL, ok := routing.SiteFromContext(ctx, sites)
	if !ok || rootURL == nil {
		panic("cannot find site from context")
	}

	prov := &hconfx.Provider{}
	if ka.Get(rootURL.String(), &prov) {
		span.AddEvent("Provider From Cache")
		return prov
	}

	values := config.Get(ctx, pc.configPath...)
	span.AddEvent("Sites Loaded")

	p, err := configToProvider(ctx, values, rootURL.String(), sites, site)
	if err != nil {
		panic(err)
	}
	_ = ka.Set(rootURL.String(), p)
	return p
}

func configToProvider(ctx context.Context, values configx.Values, rootURL string, sites []*install.ProxyConfig, site *install.ProxyConfig) (*hconfx.Provider, error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oauth.configToProvider")
	defer span.End()

	val := mapConfigValues(rootURL, values)

	// TODO - should be checked for all clients - Site-specific mapping
	if site != nil {
		rr := values.Val("insecureRedirects").StringArray()
		var out []string
		for _, r := range rr {
			out = append(out, varsFromStr(r, sites, site)...)
		}
		if len(out) > 0 {
			_ = val.Val("dangerous-allow-insecure-redirect-urls").Set(out)
		}
	}
	return hconfx.New(ctx, spec.ConfigValidationSchema, hconfx.WithValues(val.Map()))

}

func mapConfigValues(rootURL string, values configx.Values) configx.Values {

	val := configx.New()
	if secret := values.Val("secret").String(); secret != "" {
		_ = val.Val(hconf.KeyGetSystemSecret).Set([]string{values.Val("secret").String()})
	}
	_ = val.Val(hconf.KeyPublicURL).Set(rootURL + "/oidc")
	_ = val.Val(hconf.KeyIssuerURL).Set(rootURL + "/oidc")
	_ = val.Val(hconf.KeyLoginURL).Set(rootURL + "/oauth2/login")
	_ = val.Val(hconf.KeyLogoutURL).Set(rootURL + "/oauth2/logout")
	_ = val.Val(hconf.KeyConsentURL).Set(rootURL + "/oauth2/consent")
	_ = val.Val(hconf.KeyErrorURL).Set(rootURL + "/oauth2/fallbacks/error")
	_ = val.Val(hconf.KeyLogoutRedirectURL).Set(rootURL + "/oauth2/logout/callback")

	_ = val.Val(hconf.KeyAccessTokenStrategy).Set(values.Val("accessTokenStrategy").Default("opaque").String())
	_ = val.Val(hconf.KeyConsentRequestMaxAge).Set(values.Val("consentRequestMaxAge").Default("30m").String())
	_ = val.Val(hconf.KeyAccessTokenLifespan).Set(values.Val("accessTokenLifespan").Default("10m").String())
	_ = val.Val(hconf.KeyRefreshTokenLifespan).Set(values.Val("refreshTokenLifespan").Default("1440h").String())
	_ = val.Val(hconf.KeyIDTokenLifespan).Set(values.Val("idTokenLifespan").Default("1h").String())
	_ = val.Val(hconf.KeyAuthCodeLifespan).Set(values.Val("authCodeLifespan").Default("10m").String())

	_ = val.Val(hconf.HSMEnabled).Set("false")

	_ = val.Val(hconf.KeyLogLevel).Set("trace")
	_ = val.Val("log.leak_sensitive_values").Set(true)

	_ = val.Val(hconf.KeyCookieSameSiteMode).Set("Strict")
	return val
}

func varsFromStr(s string, sites []*install.ProxyConfig, site *install.ProxyConfig) []string {
	var res []string
	defaultBind := routing.GetDefaultSiteURL(nil, sites...)
	if strings.Contains(s, "#default_bind#") {

		res = append(res, strings.ReplaceAll(s, "#default_bind#", defaultBind))

	} else if strings.Contains(s, "#binds...#") {

		for _, u := range site.GetExternalUrls() {
			res = append(res, strings.ReplaceAll(s, "#binds...#", u.String()))
		}

	} else if strings.Contains(s, "#insecure_binds...") {

		for _, u := range site.GetExternalUrls() {
			if !fosite.IsRedirectURISecure(context.TODO(), u) {
				res = append(res, strings.ReplaceAll(s, "#insecure_binds...#", u.String()))
			}
		}

	} else {

		res = append(res, s)

	}
	return res
}
