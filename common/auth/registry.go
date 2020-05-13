package auth

import (
	"context"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/sirupsen/logrus"

	"github.com/ory/fosite"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"

	"github.com/jmoiron/sqlx"
	"github.com/ory/hydra/client"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/hydra/x"
	"github.com/ory/x/sqlcon"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sql"
)

var (
	reg  driver.Registry
	once = &sync.Once{}

	syncLock = &sync.Mutex{}

	onRegistryInits []func()
)

func InitRegistry(dao sql.DAO) {
	once.Do(func() {

		db := sqlx.NewDb(dao.DB(), dao.Driver())
		l := logrus.New()
		l.SetLevel(logrus.PanicLevel)

		reg = driver.NewRegistrySQL().WithConfig(defaultConf).WithLogger(l)
		r := reg.(*driver.RegistrySQL).WithDB(db)
		r.Init()

		sql.LockMigratePackage()
		defer func() {
			sql.UnlockMigratePackage()
		}()
		if _, err := r.ClientManager().(*client.SQLManager).CreateSchemas(dao.Driver()); err != nil {
			log.Warn("Failed to create client schemas", zap.Error(err))
			return
		}

		km := r.KeyManager().(*jwk.SQLManager)
		if _, err := km.CreateSchemas(dao.Driver()); err != nil {
			log.Warn("Failed to create key schemas", zap.Error(err))
			return
		} else {
			if err := jwk.EnsureAsymmetricKeypairExists(context.Background(), r, new(jwk.RS256Generator), x.OpenIDConnectKeyName); err != nil {
				log.Info("Could not ensure key exists, deleting...", zap.String("key", x.OpenIDConnectKeyName))
				km.DeleteKeySet(context.Background(), x.OpenIDConnectKeyName)
			}

			if err := jwk.EnsureAsymmetricKeypairExists(context.Background(), r, new(jwk.RS256Generator), x.OAuth2JWTKeyName); err != nil {
				log.Info("Could not ensure key exists, deleting...", zap.String("key", x.OAuth2JWTKeyName))
				km.DeleteKeySet(context.Background(), x.OAuth2JWTKeyName)
			}
		}

		if _, err := r.ConsentManager().(*consent.SQLManager).CreateSchemas(dao.Driver()); err != nil {
			log.Warn("Failed to create consent schemas", zap.Error(err))
			return
		}

		store := oauth2.NewFositeSQLStore(db, r, defaultConf)
		if _, err := store.CreateSchemas(dao.Driver()); err != nil {
			log.Warn("Failed to create fosite sql store schemas", zap.Error(err))
		}

		RegisterOryProvider(r.OAuth2Provider())
	})

	if err := syncClients(context.Background(), reg.ClientManager(), defaultConf.Clients()); err != nil {
		log.Warn("Failed to sync clients", zap.Error(err))
		return
	}

	for _, onRegistryInit := range onRegistryInits {
		onRegistryInit()
	}
}

func OnRegistryInit(f func()) {
	onRegistryInits = append(onRegistryInits, f)
}

func GetRegistry() driver.Registry {
	return reg
}

func DuplicateRegistryForConf(c ConfigurationProvider) driver.Registry {
	l := logrus.New()
	l.SetLevel(logrus.PanicLevel)
	return driver.NewRegistrySQL().WithConfig(c).WithLogger(l)
}

func GetRegistrySQL() *driver.RegistrySQL {
	return reg.(*driver.RegistrySQL)
}

func syncClients(ctx context.Context, s client.Storage, c common.Scanner) error {
	var clients []*client.Client

	if c == nil {
		return nil
	}

	syncLock.Lock()
	defer syncLock.Unlock()

	if err := c.Scan(&clients); err != nil {
		return err
	}

	n, err := s.CountClients(ctx)
	if err != nil {
		return err
	}

	old, err := s.GetClients(ctx, n, 0)
	if err != nil {
		return err
	}
	sites, _ := config.LoadSites()

	for _, cli := range clients {
		_, err := s.GetClient(ctx, cli.GetID())

		var redirectURIs []string
		for _, r := range cli.RedirectURIs {
			tt := rangeFromStr(r)
			for _, t := range tt {
				vv := varsFromStr(t, sites)
				redirectURIs = append(redirectURIs, vv...)
			}
		}

		cli.RedirectURIs = redirectURIs

		if errors.Cause(err) == sqlcon.ErrNoRows {
			// Let's create it
			if err := s.CreateClient(ctx, cli); err != nil {
				return err
			}
		} else {
			if err := s.UpdateClient(ctx, cli); err != nil {
				return err
			}
		}

		delete(old, cli.GetID())
	}

	for _, cli := range old {
		if err := s.DeleteClient(ctx, cli.GetID()); err != nil {
			return err
		}
	}

	return nil
}

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
		defaultBind = sites[0].GetDefaultBindURL()
	}
	if strings.Contains(s, "#default_bind#") {
		res = append(res, strings.ReplaceAll(s, "#default_bind#", defaultBind))
	} else if strings.Contains(s, "#binds...#") {
		for _, si := range sites {
			for _, b := range si.GetBindURLs() {
				res = append(res, strings.ReplaceAll(s, "#binds...#", b))
			}
		}
	} else if strings.Contains(s, "#insecure_binds...") {
		for _, si := range sites {
			for _, a := range si.GetBindURLs() {
				u, e := url.Parse(a)
				if e == nil && !fosite.IsRedirectURISecure(u) {
					res = append(res, strings.ReplaceAll(s, "#insecure_binds...#", a))
				}
			}
		}
	} else {
		res = append(res, s)
	}
	return res
}
