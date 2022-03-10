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
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/hydra/client"
	"github.com/ory/hydra/driver"
	"github.com/ory/x/logrusx"
	"github.com/ory/x/sqlcon"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/install"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	reg  driver.Registry
	once = &sync.Once{}

	syncLock = &sync.Mutex{}

	logrusLogger *logrus.Logger
	logrusOnce   = &sync.Once{}

	onRegistryInits []func()
)

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

func InitRegistry(ctx context.Context, dbServiceName string) (e error) {

	logger := log.Logger(ctx)

	fmt.Println("And we are here ? ")

	once.Do(func() {
		reg, e = createSqlRegistryForConf(dbServiceName, defaultConf)
		if e != nil {
			logger.Error("Cannot init registryFromDSN", zap.Error(e))
		}
		p := reg.Persister()
		conn := p.Connection(context.Background())

		if e = conn.Open(); e != nil {
			logger.Error("Could not open the database connection", zap.Error(e))
			return
		}

		// Part of v3 => v4 migration: we must clear existing JWK entries, as system.secret formatting changed.
		if _, e := conn.Q().Count(&HydraJwkMigration{}); e == nil {
			logger.Info("Detected HydraJwkMigration - We are migrating from a v3 version - You may be disconnected after that!")
			var raws []*HydraJwk
			if er := conn.Where("sid = 'hydra.openid.id-token'").All(&raws); er == nil {
				for _, raw := range raws {
					logger.Warn("Found a Legacy JWK - Will be removed (" + raw.Kid + ")")
				}
				if e := conn.RawQuery("DELETE FROM hydra_jwk WHERE sid='hydra.openid.id-token'").Exec(); e != nil {
					logger.Error("Error while truncating hydra_jwk", zap.Error(e))
				} else {
					logger.Info("Removed legacy JWKs from hydra_jwk")
				}
			} else {
				fmt.Println(er)
			}
		}

		// convert migration tables
		if e = p.PrepareMigration(context.Background()); e != nil {
			logger.Error("Could not convert the migration table", zap.Error(e))
			return
		}

		status, err := p.MigrationStatus(context.Background())
		if err != nil {
			e = err
			logger.Error("Could not get the migration status", zap.Error(err))
			return
		}
		if status.HasPending() {
			// apply migrations
			start := time.Now()
			logger.Info("Applying migrations for oauth if required")
			if err := p.MigrateUp(context.Background()); err != nil {
				e = err
				logger.Error("Could not apply migrations", zap.Error(err))
				return
			}
			logger.Info("Finished in ", zap.Duration("elapsed ", time.Now().Sub(start)))
		}
		RegisterOryProvider(reg.WithConfig(defaultConf.GetProvider()).OAuth2Provider())
	})

	if e != nil {
		return
	}

	if e = syncClients(context.Background(), reg.ClientManager(), defaultConf.Clients()); e != nil {
		logger.Warn("Failed to sync clients", zap.Error(e))
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
				if e := json.Unmarshal([]byte(line), &logged); e == nil {
					if l, o := logged["level"]; o {
						level = l.(string)
					}
					if m, o := logged["msg"]; o {
						message = m.(string)
					}
				}
				// Special case
				if strings.Contains(message, "No tracer configured") {
					level = "debug"
				}
				switch level {
				case "debug":
					log.Logger(logCtx).Debug(message)
				case "warn":
					log.Logger(logCtx).Warn(message)
				case "info":
					log.Logger(logCtx).Info(message)
				default:
					log.Logger(logCtx).Info(message)
				}
			}
		}()
		logrusLogger = logrus.New()
		logrusLogger.SetOutput(w)
	})
	return logrusLogger
}

func createSqlRegistryForConf(serviceName string, conf ConfigurationProvider) (driver.Registry, error) {

	lx := logrusx.New(
		serviceName,
		"1",
		logrusx.UseLogger(getLogrusLogger(serviceName)),
		logrusx.ForceLevel(logrus.DebugLevel),
		logrusx.ForceFormat("json"),
	)
	cfg := conf.GetProvider()
	dbDriver, dbDSN := config.GetDatabase(serviceName)
	_ = cfg.Set("dsn", fmt.Sprintf("%s://%s", dbDriver, dbDSN))
	reg, e := driver.NewRegistryFromDSN(context.Background(), cfg, lx)
	if e != nil {
		return nil, e
	}
	return reg.WithConfig(conf.GetProvider()), nil
}

func GetRegistry() driver.Registry {
	return reg
}

func DuplicateRegistryForConf(refService string, c ConfigurationProvider) (driver.Registry, error) {
	return createSqlRegistryForConf(refService, c)
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

	var old []client.Client
	if n > 0 {
		if o, err := s.GetClients(ctx, client.Filter{Offset: 0, Limit: n}); err != nil {
			return err
		} else {
			old = o
		}
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
		if cli.Secret == "" {
			cli.TokenEndpointAuthMethod = "none"
		}

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

		var cleanOld []client.Client
		for _, o := range old {
			if o.GetID() == cli.GetID() {
				continue
			}
			cleanOld = append(cleanOld, o)
		}
		old = cleanOld
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
				if !fosite.IsRedirectURISecure(u) {
					res = append(res, strings.ReplaceAll(s, "#insecure_binds...#", u.String()))
				}
			}
		}

	} else {

		res = append(res, s)

	}
	return res
}
