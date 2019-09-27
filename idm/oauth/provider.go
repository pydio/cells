package oauth

import (
	"net/url"
	"time"

	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/x"
	"github.com/ory/x/tracing"
	"github.com/rs/cors"

	"github.com/pydio/cells/common"
)

type Provider struct {
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
	return &Provider{
		r:    rootURL,
		v:    values,
		cors: values.Values("cors"),
		urls: values.Values("urls"),
		oidc: values.Values("oidc"),
		drv:  drv,
		dsn:  dsn,
	}
}

func (v *Provider) InsecureRedirects() []string {
	return v.v.StringArray("insecureRedirects", []string{})
}

func (v *Provider) WellKnownKeys(include ...string) []string {
	if v.AccessTokenStrategy() == "jwt" {
		include = append(include, x.OAuth2JWTKeyName)
	}

	include = append(include, x.OpenIDConnectKeyName)

	return include
}

func (v *Provider) ServesHTTPS() bool {
	return v.v.Bool("https", false)
}

func (v *Provider) IsUsingJWTAsAccessTokens() bool {
	return v.AccessTokenStrategy() != "opaque"
}

func (v *Provider) SubjectTypesSupported() []string {
	return v.v.StringArray("subjectTypesSupported", []string{"public"})
}

func (v *Provider) DefaultClientScope() []string {
	return v.v.StringArray("defaultClientScope", []string{"offline_access", "offline", "openid", "pydio", "email"})
}

func (v *Provider) CORSEnabled(iface string) bool {
	return v.cors != nil
}

func (v *Provider) CORSOptions(iface string) cors.Options {
	return cors.Options{
		AllowedOrigins:     v.cors.StringArray("allowedOrigins"),
		AllowedMethods:     v.cors.StringArray("allowedMethods"),
		AllowedHeaders:     v.cors.StringArray("allowedHeaders"),
		ExposedHeaders:     v.cors.StringArray("exposedHeaders"),
		AllowCredentials:   v.cors.Bool("allowCredentials", true),
		OptionsPassthrough: v.cors.Bool("optionsPassthrough", false),
		MaxAge:             v.cors.Int("maxAge", 0),
		Debug:              v.cors.Bool("debug", false),
	}
}

func (v *Provider) DSN() string {
	return v.drv + "://" + v.dsn
}

func (v *Provider) DataSourcePlugin() string {
	return v.drv + "://" + v.dsn
}

func (v *Provider) BCryptCost() int {
	return 10
}

func (v *Provider) AdminListenOn() string {
	return ":0"
}

func (v *Provider) AdminDisableHealthAccessLog() bool {
	return false
}

func (v *Provider) PublicListenOn() string {
	return ":0"
}

func (v *Provider) PublicDisableHealthAccessLog() bool {
	return v.v.Bool("publicDisabledHealthAccessLog", false)
}

func (v *Provider) ConsentRequestMaxAge() time.Duration {
	return v.v.Duration("consentRequestMaxAge", "30m")
}

func (v *Provider) AccessTokenLifespan() time.Duration {
	return v.v.Duration("accessTokenLifespan", "1h")
}

func (v *Provider) RefreshTokenLifespan() time.Duration {
	return v.v.Duration("refreshTokenLifespan", "720h")
}

func (v *Provider) IDTokenLifespan() time.Duration {
	return v.v.Duration("idTokenLifespan", "1h")
}

func (v *Provider) AuthCodeLifespan() time.Duration {
	return v.v.Duration("authCodeLifespan", "10m")
}

func (v *Provider) ScopeStrategy() string {
	return ""
}

func (v *Provider) TracingServiceName() string {
	return "ORY Hydra"
}

func (v *Provider) TracingProvider() string {
	return ""
}

func (v *Provider) TracingJaegerConfig() *tracing.JaegerConfig {
	return &tracing.JaegerConfig{}
}

func (v *Provider) GetCookieSecrets() [][]byte {
	return [][]byte{
		v.GetSystemSecret(),
	}
}

func (v *Provider) GetRotatedSystemSecrets() [][]byte {
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

func (v *Provider) GetSystemSecret() []byte {
	return v.v.Bytes("secret", []byte{})
}

func (v *Provider) LogoutRedirectURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutRedirectURL", "/oauth2/fallbacks/logout/callback"))
	return u
}

func (v *Provider) LoginURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", "/oauth2/login"))
	return u
}

func (v *Provider) LogoutURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("logoutURL", "/oauth2/fallbacks/logout"))
	return u
}

func (v *Provider) ConsentURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("consentURL", "/oauth2/consent"))
	return u
}

func (v *Provider) ErrorURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("errorURL", "/oauth2/fallbacks/error"))
	return u
}

func (v *Provider) PublicURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("publicURL", "/oidc"))
	return u
}

func (v *Provider) IssuerURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("issuerURL", "/oidc"))
	return u
}

func (v *Provider) OAuth2AuthURL() string {
	return v.urls.String("oauth2AuthURL", "/oauth2/auth") // this should not have the host etc prepended...
}

func (v *Provider) OAuth2ClientRegistrationURL() *url.URL {
	u, _ := url.Parse(v.r + v.urls.String("loginURL", ""))
	return u
}

func (v *Provider) AllowTLSTerminationFrom() []string {
	return v.v.StringArray("allowTLSTerminationFrom", []string{})
}

func (v *Provider) AccessTokenStrategy() string {
	return v.v.String("accessTokenStrategy", "opaque")
}

func (v *Provider) SubjectIdentifierAlgorithmSalt() string {
	return v.v.String("subjectIdentifierAlgorithmSalt", "")
}

func (v *Provider) OIDCDiscoverySupportedClaims() []string {
	return v.oidc.StringArray("supportedClaims", []string{})
}

func (v *Provider) OIDCDiscoverySupportedScope() []string {
	return v.oidc.StringArray("supportedScope", []string{})
}

func (v *Provider) OIDCDiscoveryUserinfoEndpoint() string {
	return v.oidc.String("userInfoEndpoint", "/oauth2/userinfo")
}

func (v *Provider) ShareOAuth2Debug() bool {
	return v.v.Bool("shareOAuth2Debug", false)
}
