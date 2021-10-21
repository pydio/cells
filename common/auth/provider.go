/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package auth

import (
	"net/url"
	"sync"
	"time"

	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/x"
	"github.com/ory/x/tracing"
	"github.com/rs/cors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/x/configx"
)

type ConfigurationProvider interface {
	configuration.Provider
	Clients() common.Scanner
	Connectors() common.Scanner
}

type configurationProvider struct {
	// rootURL
	r string

	// values
	v configx.Values
}

var (
	confMap     map[string]ConfigurationProvider
	confMutex   *sync.Mutex
	defaultConf ConfigurationProvider

	onConfigurationInits []func(scanner common.Scanner)
	confInit             bool
)

func init() {
	confMap = make(map[string]ConfigurationProvider)
	confMutex = &sync.Mutex{}
}

func InitConfiguration(values configx.Values) {

	confMutex.Lock()
	defer confMutex.Unlock()
	initConnector := false
	for _, rootUrl := range config.GetSitesAllowedURLs() {
		p := NewProvider(rootUrl.String(), values)
		if !initConnector {
			// Use first conf as default
			defaultConf = p
			for _, onConfigurationInit := range onConfigurationInits {
				onConfigurationInit(p.Connectors())
			}
			initConnector = true
		}
		confMap[rootUrl.Host] = p
	}
	confInit = true
}

func OnConfigurationInit(f func(scanner common.Scanner)) {
	onConfigurationInits = append(onConfigurationInits, f)

	if confInit {
		confMutex.Lock()
		defer confMutex.Unlock()
		for _, provider := range confMap {
			f(provider.Connectors())
			break
		}
	}
}

func GetConfigurationProvider(hostname ...string) ConfigurationProvider {
	confMutex.Lock()
	defer confMutex.Unlock()

	if len(hostname) > 0 {
		if c, ok := confMap[hostname[0]]; ok {
			return c
		}
	}

	return defaultConf
}

func NewProvider(rootURL string, values configx.Values) ConfigurationProvider {
	return &configurationProvider{
		r: rootURL,
		v: values,
	}
}

func (v *configurationProvider) InsecureRedirects() []string {
	rr := v.v.Val("insecureRedirects").StringArray()
	sites, _ := config.LoadSites()
	var out []string
	for _, r := range rr {
		out = append(out, varsFromStr(r, sites)...)
	}
	return out
}

func (v *configurationProvider) WellKnownKeys(include ...string) []string {
	if v.AccessTokenStrategy() == "jwt" {
		include = append(include, x.OAuth2JWTKeyName)
	}

	include = append(include, x.OpenIDConnectKeyName)

	return include
}

func (v *configurationProvider) ServesHTTPS() bool {
	return v.v.Val("https").Bool()
}

func (v *configurationProvider) IsUsingJWTAsAccessTokens() bool {
	return v.AccessTokenStrategy() != "opaque"
}

func (v *configurationProvider) SubjectTypesSupported() []string {
	return v.v.Val("subjectTypesSupported").Default([]string{"public"}).StringArray()
}

func (v *configurationProvider) DefaultClientScope() []string {
	return v.v.Val("defaultClientScope").Default([]string{"offline_access", "offline", "openid", "pydio", "email"}).StringArray()
}

func (v *configurationProvider) CORSEnabled(iface string) bool {
	return v.v.Val("cors", iface) != nil
}

func (v *configurationProvider) CORSOptions(iface string) cors.Options {
	vals := v.v.Val("cors", iface)
	opts := cors.Options{
		AllowedOrigins:     vals.Val("allowedOrigins").StringArray(),
		AllowedMethods:     vals.Val("allowedMethods").StringArray(),
		AllowedHeaders:     vals.Val("allowedHeaders").StringArray(),
		ExposedHeaders:     vals.Val("exposedHeaders").StringArray(),
		AllowCredentials:   vals.Val("allowCredentials").Default(true).Bool(),
		OptionsPassthrough: vals.Val("optionsPassthrough").Bool(),
		MaxAge:             vals.Val("maxAge").Int(),
		Debug:              vals.Val("debug").Bool(),
	}

	return opts
}

func (v *configurationProvider) DSN() string {
	db := v.v.Val("dsn").Default(configx.Reference("#/defaults/database")).StringMap()

	return db["driver"] + "://" + db["dsn"]
}

func (v *configurationProvider) DataSourcePlugin() string {
	db := v.v.Val("dsn").Default(configx.Reference("#/defaults/database")).StringMap()

	return db["driver"] + "://" + db["dsn"]
}

func (v *configurationProvider) BCryptCost() int {
	return 10
}

func (v *configurationProvider) AdminListenOn() string {
	return ":0"
}

func (v *configurationProvider) AdminDisableHealthAccessLog() bool {
	return false
}

func (v *configurationProvider) PublicListenOn() string {
	return ":0"
}

func (v *configurationProvider) PublicDisableHealthAccessLog() bool {
	return v.v.Val("publicDisabledHealthAccessLog").Bool()
}

func (v *configurationProvider) ConsentRequestMaxAge() time.Duration {
	return v.v.Val("consentRequestMaxAge").Default("30m").Duration()
}

func (v *configurationProvider) AccessTokenLifespan() time.Duration {
	return v.v.Val("accessTokenLifespan").Default("10m").Duration()
}

func (v *configurationProvider) RefreshTokenLifespan() time.Duration {
	return v.v.Val("refreshTokenLifespan").Default("1440h").Duration()
}

func (v *configurationProvider) IDTokenLifespan() time.Duration {
	return v.v.Val("idTokenLifespan").Default("1h").Duration()
}

func (v *configurationProvider) AuthCodeLifespan() time.Duration {
	return v.v.Val("authCodeLifespan").Default("10m").Duration()
}

func (v *configurationProvider) ScopeStrategy() string {
	return ""
}

func (v *configurationProvider) TracingServiceName() string {
	return "ORY Hydra"
}

func (v *configurationProvider) TracingProvider() string {
	return ""
}

func (v *configurationProvider) TracingJaegerConfig() *tracing.JaegerConfig {
	return &tracing.JaegerConfig{}
}

func (v *configurationProvider) GetCookieSecrets() [][]byte {
	return [][]byte{
		v.GetSystemSecret(),
	}
}

func (v *configurationProvider) GetRotatedSystemSecrets() [][]byte {
	secrets := [][]byte{v.GetSystemSecret()}

	if len(secrets) < 2 {
		return nil
	}

	var rotated [][]byte
	for _, secret := range secrets[1:] {
		rotated = append(rotated, x.HashByteSecret(secret))
	}

	return rotated
}

func (v *configurationProvider) GetSystemSecret() []byte {
	return v.v.Val("secret").Bytes()
}

func (v *configurationProvider) LogoutRedirectURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "logoutRedirectURL").Default("/oauth2/logout/callback").String())
	return u
}

func (v *configurationProvider) LoginURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "loginURL").Default("/oauth2/login").String())
	return u
}

func (v *configurationProvider) LogoutURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "logoutURL").Default("/oauth2/logout").String())
	return u
}

func (v *configurationProvider) ConsentURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "consentURL").Default("/oauth2/consent").String())
	return u
}

func (v *configurationProvider) ErrorURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "errorURL").Default("/oauth2/fallbacks/error").String())
	return u
}

func (v *configurationProvider) PublicURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "publicURL").Default("/oidc/").String())
	return u
}

func (v *configurationProvider) IssuerURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "issuerURL").Default("/oidc/").String())
	return u
}

func (v *configurationProvider) OAuth2AuthURL() string {
	return v.v.Val("urls", "oauth2AuthURL").Default("/oauth2/auth").String() // this should not have the host etc prepended...
}

func (v *configurationProvider) OAuth2ClientRegistrationURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Val("urls", "loginURL").String())
	return u
}

func (v *configurationProvider) AllowTLSTerminationFrom() []string {
	return v.v.Val("allowTLSTerminationFrom").StringArray()
}

func (v *configurationProvider) AccessTokenStrategy() string {
	return v.v.Val("accessTokenStrategy").Default("opaque").String()
}

func (v *configurationProvider) SubjectIdentifierAlgorithmSalt() string {
	return v.v.Val("subjectIdentifierAlgorithmSalt").String()
}

func (v *configurationProvider) OIDCDiscoverySupportedClaims() []string {
	return v.v.Val("oidc", "supportedClaims").StringArray()
}

func (v *configurationProvider) OIDCDiscoverySupportedScope() []string {
	return v.v.Val("oidc", "supportedScope").StringArray()
}

func (v *configurationProvider) OIDCDiscoveryUserinfoEndpoint() string {
	return v.v.Val("oidc", "userInfoEndpoint").Default("/oauth2/userinfo").String()
}

func (v *configurationProvider) ShareOAuth2Debug() bool {
	return v.v.Val("shareOAuth2Debug").Bool()
}

func (v *configurationProvider) Clients() common.Scanner {
	return v.v.Val("staticClients")
}

func (v *configurationProvider) Connectors() common.Scanner {
	return v.v.Val("connectors")
}
