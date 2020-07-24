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
	v common.ConfigValues

	cors       common.ConfigValues
	urls       common.ConfigValues
	oidc       common.ConfigValues
	clients    common.Scanner
	connectors common.Scanner

	drv string
	dsn string
}

var (
	conf                 ConfigurationProvider
	onConfigurationInits []func()
	confInit             bool
)

func InitConfiguration(values common.ConfigValues) {
	externalURL := config.Get("defaults", "url").String("")

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

func NewProvider(rootURL string, values common.ConfigValues) ConfigurationProvider {
	drv, dsn := values.Database("dsn")
	return &configurationProvider{
		r:          rootURL,
		v:          values,
		cors:       values.Values("cors"),
		urls:       values.Values("urls"),
		oidc:       values.Values("oidc"),
		clients:    values.Array("staticClients"),
		connectors: values.Array("connectors"),
		drv:        drv,
		dsn:        dsn,
	}
}

func (v *configurationProvider) InsecureRedirects() []string {
	return v.v.StringArray("insecureRedirects", []string{})
}

func (v *configurationProvider) WellKnownKeys(include ...string) []string {
	if v.AccessTokenStrategy() == "jwt" {
		include = append(include, x.OAuth2JWTKeyName)
	}

	include = append(include, x.OpenIDConnectKeyName)

	return include
}

func (v *configurationProvider) ServesHTTPS() bool {
	return v.v.Bool("https", false)
}

func (v *configurationProvider) IsUsingJWTAsAccessTokens() bool {
	return v.AccessTokenStrategy() != "opaque"
}

func (v *configurationProvider) SubjectTypesSupported() []string {
	return v.v.StringArray("subjectTypesSupported", []string{"public"})
}

func (v *configurationProvider) DefaultClientScope() []string {
	return v.v.StringArray("defaultClientScope", []string{"offline_access", "offline", "openid", "pydio", "email"})
}

func (v *configurationProvider) CORSEnabled(iface string) bool {
	return v.cors.Values(iface).IsEmpty()
}

func (v *configurationProvider) CORSOptions(iface string) cors.Options {
	return cors.Options{
		AllowedOrigins:     v.cors.Values(iface).StringArray("allowedOrigins"),
		AllowedMethods:     v.cors.Values(iface).StringArray("allowedMethods"),
		AllowedHeaders:     v.cors.Values(iface).StringArray("allowedHeaders"),
		ExposedHeaders:     v.cors.Values(iface).StringArray("exposedHeaders"),
		AllowCredentials:   v.cors.Values(iface).Bool("allowCredentials", true),
		OptionsPassthrough: v.cors.Values(iface).Bool("optionsPassthrough", false),
		MaxAge:             v.cors.Values(iface).Int("maxAge", 0),
		Debug:              v.cors.Values(iface).Bool("debug", false),
	}
}

func (v *configurationProvider) DSN() string {
	return v.drv + "://" + v.dsn
}

func (v *configurationProvider) DataSourcePlugin() string {
	return v.drv + "://" + v.dsn
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
	return v.v.Bool("publicDisabledHealthAccessLog", false)
}

func (v *configurationProvider) ConsentRequestMaxAge() time.Duration {
	return v.v.Duration("consentRequestMaxAge", "30m")
}

func (v *configurationProvider) AccessTokenLifespan() time.Duration {
	return v.v.Duration("accessTokenLifespan", "10m")
}

func (v *configurationProvider) RefreshTokenLifespan() time.Duration {
	return v.v.Duration("refreshTokenLifespan", "1440h")
}

func (v *configurationProvider) IDTokenLifespan() time.Duration {
	return v.v.Duration("idTokenLifespan", "1h")
}

func (v *configurationProvider) AuthCodeLifespan() time.Duration {
	return v.v.Duration("authCodeLifespan", "10m")
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
	return v.v.Bytes("secret", []byte{})
}

func (v *configurationProvider) LogoutRedirectURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutRedirectURL", "/oauth2/logout/callback"))
	return u
}

func (v *configurationProvider) LoginURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", "/oauth2/login"))
	return u
}

func (v *configurationProvider) LogoutURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutURL", "/oauth2/logout"))
	return u
}

func (v *configurationProvider) ConsentURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("consentURL", "/oauth2/consent"))
	return u
}

func (v *configurationProvider) ErrorURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("errorURL", "/oauth2/fallbacks/error"))
	return u
}

func (v *configurationProvider) PublicURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("publicURL", "/oidc/"))
	return u
}

func (v *configurationProvider) IssuerURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("issuerURL", "/oidc/"))
	return u
}

func (v *configurationProvider) OAuth2AuthURL() string {
	return v.urls.String("oauth2AuthURL", "/oauth2/auth") // this should not have the host etc prepended...
}

func (v *configurationProvider) OAuth2ClientRegistrationURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", ""))
	return u
}

func (v *configurationProvider) AllowTLSTerminationFrom() []string {
	return v.v.StringArray("allowTLSTerminationFrom", []string{})
}

func (v *configurationProvider) AccessTokenStrategy() string {
	return v.v.String("accessTokenStrategy", "opaque")
}

func (v *configurationProvider) SubjectIdentifierAlgorithmSalt() string {
	return v.v.String("subjectIdentifierAlgorithmSalt", "")
}

func (v *configurationProvider) OIDCDiscoverySupportedClaims() []string {
	return v.oidc.StringArray("supportedClaims", []string{})
}

func (v *configurationProvider) OIDCDiscoverySupportedScope() []string {
	return v.oidc.StringArray("supportedScope", []string{})
}

func (v *configurationProvider) OIDCDiscoveryUserinfoEndpoint() string {
	return v.oidc.String("userInfoEndpoint", "/oauth2/userinfo")
}

func (v *configurationProvider) ShareOAuth2Debug() bool {
	return v.v.Bool("shareOAuth2Debug", false)
}

func (v *configurationProvider) Clients() common.Scanner {
	return v.clients
}

func (v *configurationProvider) Connectors() common.Scanner {
	return v.connectors
}
