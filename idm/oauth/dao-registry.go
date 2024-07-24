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

package oauth

import (
	"bufio"
	"context"
	"crypto/sha256"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"

	"github.com/gorilla/sessions"
	retryablehttp "github.com/hashicorp/go-retryablehttp"
	"github.com/ory/fosite"
	"github.com/ory/fosite/compose"
	foauth2 "github.com/ory/fosite/handler/oauth2"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/herodot"
	"github.com/ory/hydra/v2/aead"
	"github.com/ory/hydra/v2/client"
	"github.com/ory/hydra/v2/consent"
	hconfig "github.com/ory/hydra/v2/driver/config"
	"github.com/ory/hydra/v2/fositex"
	"github.com/ory/hydra/v2/jwk"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/ory/hydra/v2/oauth2/trust"
	"github.com/ory/hydra/v2/persistence"
	"github.com/ory/hydra/v2/persistence/sql"
	"github.com/ory/hydra/v2/spec"
	"github.com/ory/hydra/v2/x"
	"github.com/ory/x/configx"
	"github.com/ory/x/contextx"
	"github.com/ory/x/httprouterx"
	"github.com/ory/x/httpx"
	"github.com/ory/x/logrusx"
	"github.com/ory/x/otelx"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	runtime2 "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// Check interface conformance
var _ Registry = (*AbstractRegistry)(nil)

var (
	RegistryDrivers service.StorageDrivers

	logger     *logrusx.Logger
	audit      *logrusx.Logger
	loggerOnce = &sync.Once{}
	auditOnce  = &sync.Once{}
)

type Registry interface {
	Init(ctx context.Context, skipNetworkInit bool, migrate bool, ctxer contextx.Contextualizer) error
	hconfig.Provider
	persistence.Provider
	client.Registry
	consent.Registry
	consent.InternalRegistry
	oauth2.Registry
	oauth2.InternalRegistry
	jwk.Registry
	jwk.InternalRegistry
	x.RegistryLogger
	x.RegistryCookieStore

	OAuth2HMACStrategy() *foauth2.HMACSHAStrategy
	PublicRouter() *httprouterx.RouterPublic
	Connectors(ctx context.Context) []auth.ConnectorConfig
}

type AbstractRegistry struct {
	Storage persistence.Persister
	sql.Dependencies
	cfg          *hconfig.DefaultProvider
	routerPublic *httprouterx.RouterPublic
	routerAdmin  *httprouterx.RouterAdmin
	connectors   []auth.ConnectorConfig
}

func (m *AbstractRegistry) Migrate(ctx context.Context) error {
	return m.Persister().MigrateUp(ctx)
}

// Init implements Registry interface
func (m *AbstractRegistry) Init(ctx context.Context, skipNetworkInit bool, migrate bool, ctxer contextx.Contextualizer) error {
	contextx.RootContext = context.WithValue(ctx, contextx.ValidContextKey, true)
	return nil
}

func (m *AbstractRegistry) Persister() persistence.Persister {
	return m.Storage
}

func (m *AbstractRegistry) PublicRouter() *httprouterx.RouterPublic {
	if m.routerPublic == nil {
		regConfig := m.Config()

		m.routerAdmin = x.NewRouterAdmin(regConfig.AdminURL)
		m.routerPublic = x.NewRouterPublic()

		oauth2Handler := oauth2.NewHandler(m, regConfig)
		oauth2Handler.SetRoutes(m.routerAdmin, m.routerPublic, func(handler http.Handler) http.Handler {
			return handler
		})

		consentHandler := consent.NewHandler(m, regConfig)
		consentHandler.SetRoutes(m.routerAdmin)

		keyHandler := jwk.NewHandler(m)
		keyHandler.SetRoutes(m.routerAdmin, m.routerPublic, func(handler http.Handler) http.Handler {
			return handler
		})
	}
	return m.routerPublic
}

func (m *AbstractRegistry) Ping() error {
	// TODO
	return nil
}

func (m *AbstractRegistry) ClientManager() client.Manager {
	return m.Persister()
}

func (m *AbstractRegistry) ConsentManager() consent.Manager {
	return m.Persister()
}

func (m *AbstractRegistry) OAuth2Storage() x.FositeStorer {
	return m.Persister()
}

func (m *AbstractRegistry) KeyManager() jwk.Manager {
	/*if m.Config().HSMEnabled() {
		return hsm.NewKeyManager(hsm.NewContext(m.Config(), m.Logger()), m.Config())
	}*/

	return m.Persister()
}

func (m *AbstractRegistry) SoftwareKeyManager() jwk.Manager {
	return m.Persister()
}

func (m *AbstractRegistry) GrantManager() trust.GrantManager {
	return m.Persister()
}

func (m *AbstractRegistry) Tracer(ctx context.Context) *otelx.Tracer {
	return otelx.NewNoop(m.Logger(), &otelx.Config{})
}

func (m *AbstractRegistry) GetJWKSFetcherStrategy() fosite.JWKSFetcherStrategy {
	return fosite.NewDefaultJWKSFetcherStrategy()
}

func (m *AbstractRegistry) Config() *hconfig.DefaultProvider {
	if m.cfg != nil {
		return m.cfg
	}

	emptyProvider, _ := configx.New(context.TODO(), spec.ConfigValidationSchema)
	m.cfg = hconfig.NewCustom(m.Logger(), emptyProvider, GetProviderContextualizer())

	return m.cfg
}

func (m *AbstractRegistry) ClientValidator() *client.Validator {
	return client.NewValidator(m)
}

func (m *AbstractRegistry) ClientHasher() fosite.Hasher {
	return x.NewHasher(m.Config())
}

func (m *AbstractRegistry) ExtraFositeFactories() []fositex.Factory {
	return []fositex.Factory{}
}

func (m *AbstractRegistry) OpenIDJWTStrategy() jwk.JWTSigner {
	return jwk.NewDefaultJWTSigner(m.Config(), m, x.OpenIDConnectKeyName)
}

func (m *AbstractRegistry) OAuth2HMACStrategy() *foauth2.HMACSHAStrategy {
	return compose.NewOAuth2HMACStrategy(m.OAuth2Config())
}

func (m *AbstractRegistry) OAuth2Config() *fositex.Config {
	return fositex.NewConfig(m)
}

func (m *AbstractRegistry) ConsentStrategy() consent.Strategy {
	return consent.NewStrategy(m, m.Config())
}

func (m *AbstractRegistry) SubjectIdentifierAlgorithm(ctx context.Context) map[string]consent.SubjectIdentifierAlgorithm {
	sia := map[string]consent.SubjectIdentifierAlgorithm{}
	for _, t := range m.Config().SubjectTypesSupported(ctx) {
		switch t {
		case "public":
			sia["public"] = consent.NewSubjectIdentifierAlgorithmPublic()
		case "pairwise":
			sia["pairwise"] = consent.NewSubjectIdentifierAlgorithmPairwise([]byte(m.Config().SubjectIdentifierAlgorithmSalt(ctx)))
		}
	}

	return sia
}

func (m *AbstractRegistry) Writer() herodot.Writer {
	return herodot.NewJSONWriter(m.Logger())
}

func (m *AbstractRegistry) CookieStore(ctx context.Context) (sessions.Store, error) {
	var kk [][]byte
	secrets, err := m.Config().GetCookieSecrets(ctx)
	if err != nil {
		return nil, err
	}

	for _, k := range secrets {
		encrypt := sha256.Sum256(k)
		kk = append(kk, k, encrypt[:])
	}

	cs := sessions.NewCookieStore(kk...)
	cs.Options.Secure = m.Config().CookieSecure(ctx)
	cs.Options.HttpOnly = true

	// CookieStore MaxAge is set to 86400 * 30 by default. This prevents secure cookies retrieval with expiration > 30 days.
	// MaxAge(0) disables internal MaxAge check by SecureCookie, see:
	//
	// https://github.com/ory/hydra/pull/2488#discussion_r618992698
	cs.MaxAge(0)

	if domain := m.Config().CookieDomain(ctx); domain != "" {
		cs.Options.Domain = domain
	}

	cs.Options.Path = "/"
	if sameSite := m.Config().CookieSameSiteMode(ctx); sameSite != 0 {
		cs.Options.SameSite = sameSite
	}

	return cs, nil
}

func (m *AbstractRegistry) Logger() *logrusx.Logger {
	serviceName := common.ServiceGrpcNamespace_ + common.ServiceOAuth
	loggerOnce.Do(func() {
		logCtx := runtime2.WithServiceName(context.Background(), serviceName)
		r, w, _ := os.Pipe()
		go func() {
			scanner := bufio.NewScanner(r)
			for scanner.Scan() {
				line := scanner.Text()
				var logged map[string]interface{}
				level := "info"
				message := line
				var fields []zap.Field
				if e := json.Unmarshal([]byte(line), &logged); e == nil {
					if l, o := logged["level"]; o {
						level = l.(string)
					}
					if m, o := logged["msg"]; o {
						message = m.(string)
						if strings.HasPrefix(message, "JSON Web Key Set") {
							message += " This can take some time"
						}
					}
					if e, o := logged["error"]; o {
						if oMap, ok := e.(map[string]interface{}); ok && oMap["debug"] != "" {
							level = "debug"
						}
					}
				}
				for k, v := range logged {
					if k == "msg" || k == "level" || k == "time" || k == "service_name" || k == "audience" || k == "service_version" {
						continue
					}
					fields = append(fields, zap.Any(k, v))
					if level == "debug" && strings.Contains(message, "migration") {
						level = "info"
					}
				}
				// Special case
				//if strings.Contains(message, "No tracer configured") {
				//	level = "debug"
				//}
				switch level {
				case "debug":
					log.Logger(logCtx).Debug(message, fields...)
				case "warn":
					log.Logger(logCtx).Warn(message, fields...)
				case "info":
					log.Logger(logCtx).Info(message, fields...)
				default:
					log.Logger(logCtx).Info(message, fields...)
				}
			}
		}()
		logger = logrusx.New(serviceName, runtime.Version())
		logger.Logger.SetOutput(w)
	})
	return logger
}

func (m *AbstractRegistry) AuditLogger() *logrusx.Logger {
	serviceName := common.ServiceGrpcNamespace_ + common.ServiceOAuth
	auditOnce.Do(func() {
		logCtx := runtime2.WithServiceName(context.Background(), common.ServiceGrpcNamespace_+common.ServiceOAuth)
		r, w, _ := os.Pipe()
		go func() {
			scanner := bufio.NewScanner(r)
			for scanner.Scan() {
				line := scanner.Text()
				var logged map[string]interface{}
				level := "info"
				message := line
				var fields []zap.Field
				if e := json.Unmarshal([]byte(line), &logged); e == nil {
					if l, o := logged["level"]; o {
						level = l.(string)
					}
					if m, o := logged["msg"]; o {
						message = m.(string)
					}
					if e, o := logged["error"]; o {
						if oMap, ok := e.(map[string]interface{}); ok && oMap["debug"] != "" {
							level = "debug"
						}
					}
				}
				for k, v := range logged {
					if k == "msg" || k == "level" || k == "time" || k == "service_name" || k == "audience" || k == "service_version" {
						continue
					}
					fields = append(fields, zap.Any(k, v))
				}
				switch level {
				case "debug":
					log.Auditer(logCtx).Debug(message, fields...)
				case "warn":
					log.Auditer(logCtx).Warn(message, fields...)
				case "info":
					log.Auditer(logCtx).Info(message, fields...)
				default:
					log.Auditer(logCtx).Info(message, fields...)
				}
			}
		}()
		audit = logrusx.New(serviceName, runtime.Version())
		audit.Logger.SetOutput(w)
	})
	return audit

}

func (m *AbstractRegistry) HTTPClient(ctx context.Context, opts ...httpx.ResilientOptions) *retryablehttp.Client {
	return retryablehttp.NewClient()
}

func (m *AbstractRegistry) OpenIDConnectRequestValidator() *openid.OpenIDConnectRequestValidator {
	return openid.NewOpenIDConnectRequestValidator(&openid.DefaultStrategy{
		Config: m.OAuth2ProviderConfig(),
		Signer: m.OpenIDJWTStrategy(),
	}, m.OAuth2ProviderConfig())
}

func (m *AbstractRegistry) OAuth2Provider() fosite.OAuth2Provider {
	return fosite.NewOAuth2Provider(m.OAuth2Storage(), m.OAuth2ProviderConfig())
}

func (m *AbstractRegistry) AudienceStrategy() fosite.AudienceMatchingStrategy {
	return fosite.DefaultAudienceMatchingStrategy
}

func (m *AbstractRegistry) AccessTokenJWTStrategy() jwk.JWTSigner {
	return jwk.NewDefaultJWTSigner(m.Config(), m, x.OAuth2JWTKeyName)
}

func (m *AbstractRegistry) AccessRequestHooks() []oauth2.AccessRequestHook {
	return []oauth2.AccessRequestHook{
		oauth2.RefreshTokenHook(m),
		oauth2.TokenHook(m),
	}
}

func (m *AbstractRegistry) OAuth2ProviderConfig() fosite.Configurator {
	conf := m.OAuth2Config()
	hmacAtStrategy := m.OAuth2HMACStrategy()
	oidcSigner := m.OpenIDJWTStrategy()
	atSigner := m.AccessTokenJWTStrategy()
	jwtAtStrategy := &foauth2.DefaultJWTStrategy{
		Signer:          atSigner,
		HMACSHAStrategy: hmacAtStrategy,
		Config:          conf,
	}

	conf.LoadDefaultHandlers(&compose.CommonStrategy{
		CoreStrategy: fositex.NewTokenStrategy(m.Config(), hmacAtStrategy, &foauth2.DefaultJWTStrategy{
			Signer:          jwtAtStrategy,
			HMACSHAStrategy: hmacAtStrategy,
			Config:          conf,
		}),
		OpenIDConnectTokenStrategy: &openid.DefaultStrategy{
			Config: conf,
			Signer: oidcSigner,
		},
		Signer: oidcSigner,
	})

	return conf
}

func (m *AbstractRegistry) KeyCipher() *aead.AESGCM {
	return aead.NewAESGCM(m.Config())
}

func (m *AbstractRegistry) GrantValidator() *trust.GrantValidator {
	return trust.NewGrantValidator()
}

func (*AbstractRegistry) CanHandle(dsn string) bool {
	return true
}

func (*AbstractRegistry) Contextualizer() contextx.Contextualizer {
	return GetProviderContextualizer()
}

func (m *AbstractRegistry) FlowCipher() *aead.XChaCha20Poly1305 {
	return aead.NewXChaCha20Poly1305(m.Config())
}

// Connectors lists all defined connectors
func (m *AbstractRegistry) Connectors(ctx context.Context) []auth.ConnectorConfig {
	if m.connectors != nil {
		return m.connectors
	}

	var er error
	m.connectors, er = auth.ScanConnectors(ctx, config.Get(ctx, ConfigCorePath...).Val("connectors"))
	if er != nil {
		log.Logger(ctx).Error("Cannot scan connectors, will return an empty []auth.ConnectorConfig", zap.Error(er))
	}

	return m.connectors
}

// Todo - not used ?
func rangeFromStr(s string) []string {

	var res []string
	re := regexp.MustCompile(`\[([0-9]+)-([0-9]+)\]`)

	r := re.FindStringSubmatch(s)

	if len(r) < 3 {
		return []string{s}
	}

	min, err := strconv.Atoi(r[1])
	if err != nil {
		return []string{s}
	}

	max, err := strconv.Atoi(r[2])
	if err != nil {
		return []string{s}
	}

	if min > max {
		return []string{s}
	}

	for {
		if min > max {
			break
		}

		res = append(res, re.ReplaceAllString(s, strconv.Itoa(min)))

		min = min + 1
	}
	return res
}

/*
// TODO ?
func CheckCollation(conn *pop.Connection, dbName string) (bool, error) {
	type CollationRow struct {
		TableName      string `db:"table_name"`
		TableCollation string `db:"table_collation"`
	}

	c, err := conn.RawQuery("SELECT TABLE_NAME, TABLE_COLLATION" +
		" FROM INFORMATION_SCHEMA.TABLES tbl" +
		" WHERE TABLE_SCHEMA='" + dbName + "' AND TABLE_TYPE='BASE TABLE'" +
		" AND TABLE_NAME NOT LIKE '%_migrations'" +
		" AND TABLE_NAME NOT LIKE '%_migration'" +
		" AND TABLE_COLLATION NOT LIKE 'ascii%'" +
		" AND TABLE_COLLATION NOT LIKE CONCAT(@@CHARACTER_SET_DATABASE, '%')").Count(&CollationRow{})

	return c > 0, err
}
*/

// GetRedirectURIFromRequestValues extracts the redirect_uri from values but does not do any sort of validation.
//
// Considered specifications
//   - https://tools.ietf.org/html/rfc6749#section-3.1
//     The endpoint URI MAY include an
//     "application/x-www-form-urlencoded" formatted (per Appendix B) query
//     component ([RFC3986] Section 3.4), which MUST be retained when adding
//     additional query parameters.
func GetRedirectURIFromRequestValues(values url.Values) (string, error) {
	// rfc6749 3.1.   Authorization Endpoint
	// The endpoint URI MAY include an "application/x-www-form-urlencoded" formatted (per Appendix B) query component
	redirectURI, err := url.QueryUnescape(values.Get("redirect_uri"))
	if err != nil {
		return "", errors.WithStack(fosite.ErrInvalidRequest.WithHint(`The "redirect_uri" parameter is malformed or missing.`).WithDebug(err.Error()))
	}
	return redirectURI, nil
}
