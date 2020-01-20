package auth

import (
	"net/url"
	"time"

	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/x"
	"github.com/ory/x/tracing"
	"github.com/rs/cors"

	"github.com/pydio/cells/common"
)

type ConfigurationProvider struct {
	// rootURL
	r string

	// values
	v common.ConfigValues

	cors common.ConfigValues
	urls common.ConfigValues
	oidc common.ConfigValues

	drv string
	dsn string
}

func NewProvider(rootURL string, values common.ConfigValues) configuration.Provider {
	drv, dsn := values.Database("dsn")
	return &ConfigurationProvider{
		r:    rootURL,
		v:    values,
		cors: values.Values("cors"),
		urls: values.Values("urls"),
		oidc: values.Values("oidc"),
		drv:  drv,
		dsn:  dsn,
	}
}

func (v *ConfigurationProvider) InsecureRedirects() []string {
	return v.v.StringArray("insecureRedirects", []string{})
}

func (v *ConfigurationProvider) WellKnownKeys(include ...string) []string {
	if v.AccessTokenStrategy() == "jwt" {
		include = append(include, x.OAuth2JWTKeyName)
	}

	include = append(include, x.OpenIDConnectKeyName)

	return include
}

func (v *ConfigurationProvider) ServesHTTPS() bool {
	return v.v.Bool("https", false)
}

func (v *ConfigurationProvider) IsUsingJWTAsAccessTokens() bool {
	return v.AccessTokenStrategy() != "opaque"
}

func (v *ConfigurationProvider) SubjectTypesSupported() []string {
	return v.v.StringArray("subjectTypesSupported", []string{"public"})
}

func (v *ConfigurationProvider) DefaultClientScope() []string {
	return v.v.StringArray("defaultClientScope", []string{"offline_access", "offline", "openid", "pydio", "email"})
}

func (v *ConfigurationProvider) CORSEnabled(iface string) bool {
	return v.cors.Values(iface).IsEmpty()
}

func (v *ConfigurationProvider) CORSOptions(iface string) cors.Options {
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

func (v *ConfigurationProvider) DSN() string {
	return v.drv + "://" + v.dsn
}

func (v *ConfigurationProvider) DataSourcePlugin() string {
	return v.drv + "://" + v.dsn
}

func (v *ConfigurationProvider) BCryptCost() int {
	return 10
}

func (v *ConfigurationProvider) AdminListenOn() string {
	return ":0"
}

func (v *ConfigurationProvider) AdminDisableHealthAccessLog() bool {
	return false
}

func (v *ConfigurationProvider) PublicListenOn() string {
	return ":0"
}

func (v *ConfigurationProvider) PublicDisableHealthAccessLog() bool {
	return v.v.Bool("publicDisabledHealthAccessLog", false)
}

func (v *ConfigurationProvider) ConsentRequestMaxAge() time.Duration {
	return v.v.Duration("consentRequestMaxAge", "30m")
}

func (v *ConfigurationProvider) AccessTokenLifespan() time.Duration {
	return v.v.Duration("accessTokenLifespan", "10m")
}

func (v *ConfigurationProvider) RefreshTokenLifespan() time.Duration {
	return v.v.Duration("refreshTokenLifespan", "1h")
}

func (v *ConfigurationProvider) IDTokenLifespan() time.Duration {
	return v.v.Duration("idTokenLifespan", "1h")
}

func (v *ConfigurationProvider) AuthCodeLifespan() time.Duration {
	return v.v.Duration("authCodeLifespan", "10m")
}

func (v *ConfigurationProvider) ScopeStrategy() string {
	return ""
}

func (v *ConfigurationProvider) TracingServiceName() string {
	return "ORY Hydra"
}

func (v *ConfigurationProvider) TracingProvider() string {
	return ""
}

func (v *ConfigurationProvider) TracingJaegerConfig() *tracing.JaegerConfig {
	return &tracing.JaegerConfig{}
}

func (v *ConfigurationProvider) GetCookieSecrets() [][]byte {
	return [][]byte{
		v.GetSystemSecret(),
	}
}

func (v *ConfigurationProvider) GetRotatedSystemSecrets() [][]byte {
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

func (v *ConfigurationProvider) GetSystemSecret() []byte {
	return v.v.Bytes("secret", []byte{})
}

func (v *ConfigurationProvider) LogoutRedirectURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutRedirectURL", "/oauth2/logout/callback"))
	return u
}

func (v *ConfigurationProvider) LoginURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", "/oauth2/login"))
	return u
}

func (v *ConfigurationProvider) LogoutURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutURL", "/oauth2/logout"))
	return u
}

func (v *ConfigurationProvider) ConsentURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("consentURL", "/oauth2/consent"))
	return u
}

func (v *ConfigurationProvider) ErrorURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("errorURL", "/oauth2/fallbacks/error"))
	return u
}

func (v *ConfigurationProvider) PublicURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("publicURL", "/oidc/"))
	return u
}

func (v *ConfigurationProvider) IssuerURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("issuerURL", "/oidc/"))
	return u
}

func (v *ConfigurationProvider) OAuth2AuthURL() string {
	return v.urls.String("oauth2AuthURL", "/oauth2/auth") // this should not have the host etc prepended...
}

func (v *ConfigurationProvider) OAuth2ClientRegistrationURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", ""))
	return u
}

func (v *ConfigurationProvider) AllowTLSTerminationFrom() []string {
	return v.v.StringArray("allowTLSTerminationFrom", []string{})
}

func (v *ConfigurationProvider) AccessTokenStrategy() string {
	return v.v.String("accessTokenStrategy", "opaque")
}

func (v *ConfigurationProvider) SubjectIdentifierAlgorithmSalt() string {
	return v.v.String("subjectIdentifierAlgorithmSalt", "")
}

func (v *ConfigurationProvider) OIDCDiscoverySupportedClaims() []string {
	return v.oidc.StringArray("supportedClaims", []string{})
}

func (v *ConfigurationProvider) OIDCDiscoverySupportedScope() []string {
	return v.oidc.StringArray("supportedScope", []string{})
}

func (v *ConfigurationProvider) OIDCDiscoveryUserinfoEndpoint() string {
	return v.oidc.String("userInfoEndpoint", "/oauth2/userinfo")
}

func (v *ConfigurationProvider) ShareOAuth2Debug() bool {
	return v.v.Bool("shareOAuth2Debug", false)
}
