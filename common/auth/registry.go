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
	"bufio"
	"context"
	"crypto/sha256"
	"github.com/gofrs/uuid"
	"github.com/gorilla/sessions"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/ory/fosite/compose"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/herodot"
	"github.com/ory/hydra/v2/fositex"
	"github.com/ory/hydra/v2/hsm"
	"github.com/ory/hydra/v2/persistence"
	"github.com/ory/hydra/v2/spec"
	"github.com/ory/x/httpx"
	"github.com/ory/x/logrusx"
	"github.com/ory/x/otelx"
	"github.com/ory/x/popx"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"net/url"
	"os"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	tools "github.com/go-sql-driver/mysql"
	"github.com/gobuffalo/pop/v6"
	"github.com/ory/fosite"
	foauth2 "github.com/ory/fosite/handler/oauth2"
	"github.com/ory/hydra/v2/client"

	"github.com/ory/hydra/v2/consent"
	hconfig "github.com/ory/hydra/v2/driver/config"
	"github.com/ory/hydra/v2/jwk"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/ory/hydra/v2/oauth2/trust"
	"github.com/ory/hydra/v2/x"
	"github.com/ory/x/configx"
	"github.com/ory/x/contextx"
	"github.com/ory/x/dbal"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/install"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var _ Registry = new(cellsdriver)

var (
	reg  Registry
	once = &sync.Once{}

	syncLock = &sync.Mutex{}

	logrusLogger *logrus.Logger
	logrusOnce   = &sync.Once{}

	onRegistryInits []func()
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
}

func init() {
	dbal.RegisterDriver(func() dbal.Driver {
		return NewRegistrySQL()
	})
}

var _ foauth2.TokenRevocationStorage = (*sqlPersister)(nil)

type sqlPersister struct {
	*consentDriver
	*clientDriver
	*oauth2Driver
	*jwkDriver
	*trustDriver
}

func (c *sqlPersister) MigrationStatus(ctx context.Context) (popx.MigrationStatuses, error) {
	return popx.MigrationStatuses{}, nil
}

func (c *sqlPersister) MigrateDown(ctx context.Context, i int) error {
	c.consentDriver.AutoMigrate()
	c.jwkDriver.AutoMigrate()
	c.oauth2Driver.AutoMigrate()

	return nil
}

func (c *sqlPersister) MigrateUp(ctx context.Context) error {
	c.consentDriver.AutoMigrate()
	c.jwkDriver.AutoMigrate()
	c.oauth2Driver.AutoMigrate()

	return nil
}

func (c *sqlPersister) PrepareMigration(ctx context.Context) error {
	c.consentDriver.AutoMigrate()
	c.jwkDriver.AutoMigrate()
	c.oauth2Driver.AutoMigrate()

	return nil
}

func (c *sqlPersister) Connection(ctx context.Context) *pop.Connection {
	// Not used
	return &pop.Connection{}
}

func (c *sqlPersister) Ping() error {
	// Not used
	return nil
}

type cellsdriver struct {
	persister persistence.Persister
	db        *gorm.DB
	cfg       *hconfig.DefaultProvider
}

func NewRegistrySQL() *cellsdriver {
	return &cellsdriver{}
}

func (m *cellsdriver) Init(
	ctx context.Context, skipNetworkInit bool, migrate bool, ctxer contextx.Contextualizer,
) error {
	contextx.RootContext = context.WithValue(ctx, contextx.ValidContextKey, true)

	// Starting off with default config
	dsn := m.Config().DSN()

	dialector := mysql.Open(dsn)

	// Should use tenants and dbresolver to include tenants switching
	db, err := gorm.Open(dialector, &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
		FullSaveAssociations:                     true,
	})
	if err != nil {
		return err
	}

	m.db = db

	m.Persister().MigrateUp(ctx)

	return nil
}

func (m *cellsdriver) alwaysCanHandle(dsn string) bool {
	scheme := strings.Split(dsn, "://")[0]
	s := dbal.Canonicalize(scheme)
	return s == dbal.DriverMySQL || s == dbal.DriverPostgreSQL || s == dbal.DriverCockroachDB
}

func (m *cellsdriver) Persister() persistence.Persister {

	if m.persister != nil {
		return m.persister
	}

	m.persister = &sqlPersister{
		consentDriver: &consentDriver{m.db, m},
		clientDriver:  &clientDriver{config.Get("services/pydio.web.oauth/staticClients")},
		oauth2Driver:  &oauth2Driver{m.db, m},
		jwkDriver:     &jwkDriver{m.db, m},
		trustDriver:   &trustDriver{},
	}

	return m.persister
}

func (m *cellsdriver) Ping() error {
	// TODO
	return nil
}

func (m *cellsdriver) ClientManager() client.Manager {
	return m.Persister()
}

func (m *cellsdriver) ConsentManager() consent.Manager {
	return m.Persister()
}

func (m *cellsdriver) OAuth2Storage() x.FositeStorer {
	return m.Persister()
}

func (m *cellsdriver) KeyManager() jwk.Manager {
	if m.Config().HSMEnabled() {
		return hsm.NewKeyManager(hsm.NewContext(m.Config(), m.Logger()), m.Config())
	}

	return m.Persister()
}

func (m *cellsdriver) SoftwareKeyManager() jwk.Manager {
	return m.Persister()
}

func (m *cellsdriver) GrantManager() trust.GrantManager {
	return m.Persister()
}

func (m *cellsdriver) Tracer(ctx context.Context) *otelx.Tracer {
	return otelx.NewNoop(m.Logger(), &otelx.Config{})
}

func (m *cellsdriver) GetJWKSFetcherStrategy() fosite.JWKSFetcherStrategy {
	return fosite.NewDefaultJWKSFetcherStrategy()
}

func (m *cellsdriver) Config() *hconfig.DefaultProvider {
	if m.cfg != nil {
		return m.cfg
	}

	p, err := configx.New(context.TODO(), spec.ConfigValidationSchema)
	if err != nil {
		return nil
	}

	m.cfg = hconfig.NewCustom(
		logrusx.New("test", "test"),
		p,
		&cellsdriverContextualizer{},
	)

	return m.cfg
}

func (m *cellsdriver) ClientValidator() *client.Validator {
	return client.NewValidator(m)
}

func (m *cellsdriver) ClientHasher() fosite.Hasher {
	return x.NewHasher(m.Config())
}

func (m *cellsdriver) OpenIDJWTStrategy() jwk.JWTSigner {
	return jwk.NewDefaultJWTSigner(m.Config(), m, x.OpenIDConnectKeyName)
}

func (m *cellsdriver) OAuth2HMACStrategy() *foauth2.HMACSHAStrategy {
	return compose.NewOAuth2HMACStrategy(m.OAuth2Config())
}

func (m *cellsdriver) OAuth2Config() *fositex.Config {
	return fositex.NewConfig(m)
}

func (m *cellsdriver) ConsentStrategy() consent.Strategy {
	return consent.NewStrategy(m, m.Config())
}

func (m *cellsdriver) SubjectIdentifierAlgorithm(ctx context.Context) map[string]consent.SubjectIdentifierAlgorithm {
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

func (m *cellsdriver) Writer() herodot.Writer {
	return herodot.NewJSONWriter(m.Logger())
}

func (m *cellsdriver) CookieStore(ctx context.Context) (sessions.Store, error) {
	var keys [][]byte
	secrets, err := m.Config().GetCookieSecrets(ctx)
	if err != nil {
		return nil, err
	}

	for _, k := range secrets {
		encrypt := sha256.Sum256(k)
		keys = append(keys, k, encrypt[:])
	}

	cs := sessions.NewCookieStore(keys...)
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

func (m *cellsdriver) Logger() *logrusx.Logger {
	return logrusx.New("cells", runtime.Version())
}

func (m *cellsdriver) AuditLogger() *logrusx.Logger {
	return logrusx.New("cells", runtime.Version())
}

func (m *cellsdriver) HTTPClient(ctx context.Context, opts ...httpx.ResilientOptions) *retryablehttp.Client {
	return retryablehttp.NewClient()
}

func (m *cellsdriver) OpenIDConnectRequestValidator() *openid.OpenIDConnectRequestValidator {
	return openid.NewOpenIDConnectRequestValidator(&openid.DefaultStrategy{
		Config: m.OAuth2ProviderConfig(),
		Signer: m.OpenIDJWTStrategy(),
	}, m.OAuth2ProviderConfig())
}

func (m *cellsdriver) OAuth2Provider() fosite.OAuth2Provider {
	return fosite.NewOAuth2Provider(m.OAuth2Storage(), m.OAuth2ProviderConfig())
}

func (m *cellsdriver) AudienceStrategy() fosite.AudienceMatchingStrategy {
	return fosite.DefaultAudienceMatchingStrategy
}

func (m *cellsdriver) AccessTokenJWTStrategy() jwk.JWTSigner {
	return jwk.NewDefaultJWTSigner(m.Config(), m, x.OAuth2JWTKeyName)
}

func (m *cellsdriver) AccessRequestHooks() []oauth2.AccessRequestHook {
	return []oauth2.AccessRequestHook{
		oauth2.RefreshTokenHook(m),
		oauth2.TokenHook(m),
	}
}

func (m *cellsdriver) OAuth2ProviderConfig() fosite.Configurator {
	conf := m.OAuth2Config()
	hmacAtStrategy := m.OAuth2HMACStrategy()
	oidcSigner := m.OpenIDJWTStrategy()
	atSigner := m.AccessTokenJWTStrategy()
	jwtAtStrategy := &foauth2.DefaultJWTStrategy{
		Signer:          atSigner,
		HMACSHAStrategy: hmacAtStrategy,
		Config:          conf,
	}

	conf.LoadDefaultHanlders(&compose.CommonStrategy{
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

func (m *cellsdriver) KeyCipher() *jwk.AEAD {
	return jwk.NewAEAD(m.Config())
}

func (m *cellsdriver) GrantValidator() *trust.GrantValidator {
	return trust.NewGrantValidator()
}

func (*cellsdriver) CanHandle(dsn string) bool {
	return true
}

func (*cellsdriver) Contextualizer() contextx.Contextualizer {
	return &cellsdriverContextualizer{}
}

type cellsdriverContextualizer struct{}

func (*cellsdriverContextualizer) Network(ctx context.Context, network uuid.UUID) uuid.UUID {
	return network
}

func (*cellsdriverContextualizer) Config(ctx context.Context, cfg *configx.Provider) *configx.Provider {

	host, _ := servicecontext.HttpMetaFromGrpcContext(ctx, servicecontext.HttpMetaHost)
	rootURL := "https://" + host
	values := servercontext.GetConfig(ctx).Val("services", "pydio.web.oauth")

	m := values.Map()

	c, _ := config.OpenStore(ctx, "mem://")
	c.Set(m)

	c2, _ := config.OpenStore(ctx, "mem://")

	if secret := c.Val("secret").String(); secret != "" {
		_ = c2.Val(hconfig.KeyGetSystemSecret).Set([]string{c.Val("secret").String()})
	}
	_, dbDSN := config.GetDatabase("pydio.web.oauth")
	_ = c2.Val(hconfig.KeyDSN).Set(dbDSN)
	_ = c2.Val(hconfig.KeyPublicURL).Set(rootURL + "/oidc")
	_ = c2.Val(hconfig.KeyIssuerURL).Set(rootURL + "/oidc")
	_ = c2.Val(hconfig.KeyLoginURL).Set(rootURL + "/oauth2/login")
	_ = c2.Val(hconfig.KeyLogoutURL).Set(rootURL + "/oauth2/logout")
	_ = c2.Val(hconfig.KeyConsentURL).Set(rootURL + "/oauth2/consent")
	_ = c2.Val(hconfig.KeyErrorURL).Set(rootURL + "/oauth2/fallbacks/error")
	_ = c2.Val(hconfig.KeyLogoutRedirectURL).Set(rootURL + "/oauth2/logout/callback")

	_ = c2.Val(hconfig.KeyAccessTokenStrategy).Set(c.Val("accessTokenStrategy").Default("opaque").String())
	_ = c2.Val(hconfig.KeyConsentRequestMaxAge).Set(c.Val("consentRequestMaxAge").Default("30m").String())
	_ = c2.Val(hconfig.KeyAccessTokenLifespan).Set(c.Val("accessTokenLifespan").Default("10m").String())
	_ = c2.Val(hconfig.KeyRefreshTokenLifespan).Set(c.Val("refreshTokenLifespan").Default("1440h").String())
	_ = c2.Val(hconfig.KeyIDTokenLifespan).Set(c.Val("idTokenLifespan").Default("1h").String())
	_ = c2.Val(hconfig.KeyAuthCodeLifespan).Set(c.Val("authCodeLifespan").Default("10m").String())

	_ = c2.Val(hconfig.HSMEnabled).Set("false")

	_ = c2.Val(hconfig.KeyLogLevel).Set("trace")
	_ = c2.Val("log.leak_sensitive_values").Set(true)

	_ = c2.Val(hconfig.KeyCookieSameSiteMode).Set("Strict")

	p, err := configx.New(context.TODO(), spec.ConfigValidationSchema, configx.WithValues(c2.Val().Map()))
	if err != nil {
		return nil
	}

	//rr := values.Val("insecureRedirects").StringArray()
	//sites, _ := config.LoadSites()
	//var out []string
	//for _, r := range rr {
	//	out = append(out, varsFromStr(r, sites)...)
	//}
	//if len(out) > 0 {
	//	_ = val.Val("dangerous-allow-insecure-redirect-urls").Set(out)
	//}

	return p
}

type HydraJwkMigration struct {
	Id        string    `db:"id"`
	AppliedAt time.Time `db:"applied_at"`
}

func (hjm *HydraJwkMigration) TableName() string {
	return "hydra_jwk_migration"
}

type HydraJwk struct {
	Pk        uint      `db:"pk"`
	Sid       string    `db:"sid"`
	Kid       string    `db:"kid"`
	Version   uint      `db:"version"`
	KeyData   string    `db:"keydata"`
	CreatedAt time.Time `db:"created_at"`
}

func (hj HydraJwk) TableName() string {
	return "hydra_jwk"
}

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

func InitRegistry(ctx context.Context, dbServiceName string) (e error) {

	logger := log.Logger(ctx)

	if locker := servicecontext.GetRegistry(ctx).NewLocker("oauthinit"); locker != nil {
		locker.Lock()
		defer locker.Unlock()
	}

	//clients := defaultConf.Clients()

	once.Do(func() {
		//var dbName string
		reg, _, e = createSqlRegistryForConf(dbServiceName, defaultConf)
		if e != nil {
			logger.Error("Cannot init registryFromDSN", zap.Error(e))
		}

		reg.Init(ctx, true, true, nil)

		RegisterOryProvider(reg.OAuth2Provider())
	})

	if e != nil {
		return
	}

	for _, onRegistryInit := range onRegistryInits {
		onRegistryInit()
	}

	return nil
}

func OnRegistryInit(f func()) {
	onRegistryInits = append(onRegistryInits, f)
}

func getLogrusLogger(serviceName string) *logrus.Logger {
	logrusOnce.Do(func() {
		logCtx := servicecontext.WithServiceName(context.Background(), serviceName)
		r, w, _ := os.Pipe()
		go func() {
			scanner := bufio.NewScanner(r)
			for scanner.Scan() {
				line := scanner.Text()
				var logged map[string]interface{}
				level := "info"
				message := line
				if strings.Contains(line, "An error occurred while checking for the legacy migration table, maybe it does not exist yet? Trying to create.") {
					continue
				}
				if strings.Contains(line, "Migration has not been applied but it might be a legacy migration, investigating.") {
					continue
				}
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
				if strings.Contains(message, "No tracer configured") {
					level = "debug"
				}
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
		logrusLogger = logrus.New()
		logrusLogger.SetOutput(w)
	})
	return logrusLogger
}

func createSqlRegistryForConf(serviceName string, conf ConfigurationProvider) (Registry, string, error) {

	//lx := logrusx.New(
	//	serviceName,
	//	"1",
	//	logrusx.UseLogger(getLogrusLogger(serviceName)),
	//	logrusx.ForceLevel(logrus.DebugLevel),
	//	logrusx.ForceFormat("json"),
	//)
	// cfg := (*conf.GetProvider()).Config()
	dbDriver, dbDSN := config.GetDatabase(serviceName)

	dbName := ""
	if dbDriver == "mysql" {
		mysqlConfig, err := tools.ParseDSN(dbDSN)
		if err != nil {
			return nil, "", err
		}
		if ssl, ok := mysqlConfig.Params["ssl"]; ok && ssl == "true" {
			u := &url.URL{}
			q := u.Query()
			q.Add(crypto.KeyCertStoreName, mysqlConfig.Params[crypto.KeyCertStoreName])
			q.Add(crypto.KeyCertInsecureHost, mysqlConfig.Params[crypto.KeyCertInsecureHost])
			q.Add(crypto.KeyCertUUID, mysqlConfig.Params[crypto.KeyCertUUID])
			q.Add(crypto.KeyCertKeyUUID, mysqlConfig.Params[crypto.KeyCertKeyUUID])
			q.Add(crypto.KeyCertCAUUID, mysqlConfig.Params[crypto.KeyCertCAUUID])
			u.RawQuery = q.Encode()

			tlsConfig, err := crypto.TLSConfigFromURL(u)
			if err != nil {
				return nil, "", err
			}
			if tlsConfig != nil {
				delete(mysqlConfig.Params, "ssl")
				delete(mysqlConfig.Params, crypto.KeyCertStoreName)
				delete(mysqlConfig.Params, crypto.KeyCertInsecureHost)
				delete(mysqlConfig.Params, crypto.KeyCertUUID)
				delete(mysqlConfig.Params, crypto.KeyCertKeyUUID)
				delete(mysqlConfig.Params, crypto.KeyCertCAUUID)

				tools.RegisterTLSConfig("cells", tlsConfig)
				mysqlConfig.TLSConfig = "cells"
				dbDSN = mysqlConfig.FormatDSN()
			}
		}

		dbName = mysqlConfig.DBName
	}

	driver, err := dbal.GetDriverFor(dbDSN)
	if err != nil {
		return nil, "", err
	}

	return driver.(Registry), dbName, nil
}

func GetRegistry() Registry {
	return reg
}

func DuplicateRegistryForConf(refService string, c ConfigurationProvider) (Registry, error) {
	r, _, e := createSqlRegistryForConf(refService, c)
	return r, e
}

//func syncClients(ctx context.Context, s client.Storage, c configx.Scanner) error {
//	var clients []*client.Client
//
//	if c == nil {
//		return nil
//	}
//	fmt.Println("Syncing clients here ")
//
//	syncLock.Lock()
//	defer syncLock.Unlock()
//
//	if err := c.Scan(&clients); err != nil {
//		fmt.Println("AND THE ERROR IS ? ", err)
//		return err
//	}
//
//	fmt.Println("Clients to sync are ", clients)
//
//	n, err := s.CountClients(ctx)
//	if err != nil {
//		return err
//	}
//
//	var old []client.Client
//	if n > 0 {
//		if o, err := s.GetClients(ctx, client.Filter{Offset: 0, Limit: n}); err != nil {
//			return err
//		} else {
//			old = o
//		}
//	}
//	sites, _ := config.LoadSites()
//
//	for _, cli := range clients {
//		_, err := s.GetClient(ctx, cli.GetID())
//
//		var redirectURIs []string
//		for _, r := range cli.RedirectURIs {
//			tt := rangeFromStr(r)
//			for _, t := range tt {
//				vv := varsFromStr(t, sites)
//				redirectURIs = append(redirectURIs, vv...)
//			}
//		}
//
//		cli.RedirectURIs = redirectURIs
//		if cli.Secret == "" {
//			cli.TokenEndpointAuthMethod = "none"
//		}
//
//		if errors.Cause(err) == sqlcon.ErrNoRows {
//			// Let's create it
//			if err := s.CreateClient(ctx, cli); err != nil {
//				return err
//			}
//		} else {
//			if err := s.UpdateClient(ctx, cli); err != nil {
//				return err
//			}
//		}
//
//		var cleanOld []client.Client
//		for _, o := range old {
//			if o.GetID() == cli.GetID() {
//				continue
//			}
//			cleanOld = append(cleanOld, o)
//		}
//		old = cleanOld
//	}
//
//	for _, cli := range old {
//		if err := s.DeleteClient(ctx, cli.GetID()); err != nil {
//			return err
//		}
//	}
//
//	return nil
//}

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

func varsFromStr(s string, sites []*install.ProxyConfig) []string {
	var res []string
	defaultBind := ""
	if len(sites) > 0 {
		defaultBind = config.GetDefaultSiteURL(sites...)
	}
	if strings.Contains(s, "#default_bind#") {

		res = append(res, strings.ReplaceAll(s, "#default_bind#", defaultBind))

	} else if strings.Contains(s, "#binds...#") {

		for _, si := range sites {
			for _, u := range si.GetExternalUrls() {
				res = append(res, strings.ReplaceAll(s, "#binds...#", u.String()))
			}
		}

	} else if strings.Contains(s, "#insecure_binds...") {

		for _, si := range sites {
			for _, u := range si.GetExternalUrls() {
				if !fosite.IsRedirectURISecure(context.TODO(), u) {
					res = append(res, strings.ReplaceAll(s, "#insecure_binds...#", u.String()))
				}
			}
		}

	} else {

		res = append(res, s)

	}
	return res
}
