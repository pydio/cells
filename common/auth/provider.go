package auth

import (
	"net/url"
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
	conf                 ConfigurationProvider
	onConfigurationInits []func()
	confInit             bool
)

func InitConfiguration(values configx.Values) {
	// TODO - should be in parameter call
	externalURL := config.ApplicationConfig.Values("defaults", "url").String()

	conf = NewProvider(externalURL, values)

	for _, onConfigurationInit := range onConfigurationInits {
		onConfigurationInit()
	}

	confInit = true
}

func OnConfigurationInit(f func()) {
	onConfigurationInits = append(onConfigurationInits, f)

	if confInit == true {
		f()
	}
}

func GetConfigurationProvider() ConfigurationProvider {
	return conf
}

func NewProvider(rootURL string, values configx.Values) ConfigurationProvider {
	return &configurationProvider{
		r: rootURL,
		v: values,
	}
}

func (v *configurationProvider) InsecureRedirects() []string {
	return v.v.Values("insecureRedirects").StringArray()
}

func (v *configurationProvider) WellKnownKeys(include ...string) []string {
	if v.AccessTokenStrategy() == "jwt" {
		include = append(include, x.OAuth2JWTKeyName)
	}

	include = append(include, x.OpenIDConnectKeyName)

	return include
}

func (v *configurationProvider) ServesHTTPS() bool {
	return v.v.Values("https").Bool()
}

func (v *configurationProvider) IsUsingJWTAsAccessTokens() bool {
	return v.AccessTokenStrategy() != "opaque"
}

func (v *configurationProvider) SubjectTypesSupported() []string {
	return v.v.Values("subjectTypesSupported").Default([]string{"public"}).StringArray()
}

func (v *configurationProvider) DefaultClientScope() []string {
	return v.v.Values("defaultClientScope").Default([]string{"offline_access", "offline", "openid", "pydio", "email"}).StringArray()
}

func (v *configurationProvider) CORSEnabled(iface string) bool {
	return v.v.Values("cors", iface).Bool()
}

func (v *configurationProvider) CORSOptions(iface string) cors.Options {
	vals := v.v.Values("cors", iface)
	return cors.Options{
		AllowedOrigins:     vals.Values("allowedOrigins").StringArray(),
		AllowedMethods:     vals.Values("allowedMethods").StringArray(),
		AllowedHeaders:     vals.Values("allowedHeaders").StringArray(),
		ExposedHeaders:     vals.Values("exposedHeaders").StringArray(),
		AllowCredentials:   vals.Values("allowCredentials").Default(true).Bool(),
		OptionsPassthrough: vals.Values("optionsPassthrough").Bool(),
		MaxAge:             vals.Values("maxAge").Int(),
		Debug:              vals.Values("debug").Bool(),
	}
}

func (v *configurationProvider) DSN() string {
	drv := v.v.Values("dsn", "drv").Default(configx.Reference("#/defaults/database/drv")).String()
	dsn := v.v.Values("dsn", "dsn").Default(configx.Reference("#/defaults/database/dsn")).String()

	return drv + "://" + dsn
}

func (v *configurationProvider) DataSourcePlugin() string {
	drv := v.v.Values("dsn", "drv").Default(configx.Reference("#/defaults/database/drv")).String()
	dsn := v.v.Values("dsn", "dsn").Default(configx.Reference("#/defaults/database/dsn")).String()

	return drv + "://" + dsn
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
	return v.v.Values("publicDisabledHealthAccessLog").Bool()
}

func (v *configurationProvider) ConsentRequestMaxAge() time.Duration {
	return v.v.Values("consentRequestMaxAge").Default("30m").Duration()
}

func (v *configurationProvider) AccessTokenLifespan() time.Duration {
	return v.v.Values("accessTokenLifespan").Default("10m").Duration()
}

func (v *configurationProvider) RefreshTokenLifespan() time.Duration {
	return v.v.Values("refreshTokenLifespan").Default("1440h").Duration()
}

func (v *configurationProvider) IDTokenLifespan() time.Duration {
	return v.v.Values("idTokenLifespan").Default("1h").Duration()
}

func (v *configurationProvider) AuthCodeLifespan() time.Duration {
	return v.v.Values("authCodeLifespan").Default("10m").Duration()
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
	return v.v.Values("secret").Bytes()
}

func (v *configurationProvider) LogoutRedirectURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "logoutRedirectURL").Default("/oauth2/logout/callback").String())
	return u
}

func (v *configurationProvider) LoginURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "loginURL").Default("/oauth2/login").String())
	return u
}

func (v *configurationProvider) LogoutURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "logoutURL").Default("/oauth2/logout").String())
	return u
}

func (v *configurationProvider) ConsentURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "consentURL").Default("/oauth2/consent").String())
	return u
}

func (v *configurationProvider) ErrorURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "errorURL").Default("/oauth2/fallbacks/error").String())
	return u
}

func (v *configurationProvider) PublicURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "publicURL").Default("/oidc/").String())
	return u
}

func (v *configurationProvider) IssuerURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "issuerURL").Default("/oidc/").String())
	return u
}

func (v *configurationProvider) OAuth2AuthURL() string {
	return v.v.Values("urls", "oauth2AuthURL").Default("/oauth2/auth").String() // this should not have the host etc prepended...
}

func (v *configurationProvider) OAuth2ClientRegistrationURL() *url.URL {
	u, _ := url.Parse(v.r + v.v.Values("urls", "loginURL").String())
	return u
}

func (v *configurationProvider) AllowTLSTerminationFrom() []string {
	return v.v.Values("allowTLSTerminationFrom").StringArray()
}

func (v *configurationProvider) AccessTokenStrategy() string {
	return v.v.Values("accessTokenStrategy").Default("opaque").String()
}

func (v *configurationProvider) SubjectIdentifierAlgorithmSalt() string {
	return v.v.Values("subjectIdentifierAlgorithmSalt").String()
}

func (v *configurationProvider) OIDCDiscoverySupportedClaims() []string {
	return v.v.Values("oidc", "supportedClaims").StringArray()
}

func (v *configurationProvider) OIDCDiscoverySupportedScope() []string {
	return v.v.Values("oidc", "supportedScope").StringArray()
}

func (v *configurationProvider) OIDCDiscoveryUserinfoEndpoint() string {
	return v.v.Values("oidc", "userInfoEndpoint").Default("/oauth2/userinfo").String()
}

func (v *configurationProvider) ShareOAuth2Debug() bool {
	return v.v.Values("shareOAuth2Debug").Bool()
}

func (v *configurationProvider) Clients() common.Scanner {
	return v.v.Values("staticClients")
}

func (v *configurationProvider) Connectors() common.Scanner {
	return v.v.Values("connectors")
}
