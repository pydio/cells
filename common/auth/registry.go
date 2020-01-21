package auth

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"sync"

	"github.com/jmoiron/sqlx"
	"github.com/ory/hydra/client"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/x/sqlcon"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/sql"
)

var (
	reg  driver.Registry
	conf ConfigurationProvider
	once = &sync.Once{}
)

func InitRegistry(c common.ConfigValues, dao sql.DAO) {
	once.Do(func() {
		//var err error

		externalURL := config.Get("defaults", "url").String("")

		conf = NewProvider(externalURL, c)

		db := sqlx.NewDb(dao.DB(), dao.Driver())

		reg = driver.NewRegistrySQL().WithConfig(conf)
		r := reg.(*driver.RegistrySQL).WithDB(db)
		r.Init()

		sql.LockMigratePackage()
		defer func() {
			sql.UnlockMigratePackage()
		}()
		if _, err := r.ClientManager().(*client.SQLManager).CreateSchemas(dao.Driver()); err != nil {
			fmt.Println(err)
			return
		}

		if _, err := r.KeyManager().(*jwk.SQLManager).CreateSchemas(dao.Driver()); err != nil {
			fmt.Println(err)
			return
		}

		if _, err := r.ConsentManager().(*consent.SQLManager).CreateSchemas(dao.Driver()); err != nil {
			fmt.Println(err)
			return
		}

		store := oauth2.NewFositeSQLStore(db, r, conf)
		store.CreateSchemas(dao.Driver())

		RegisterOryProvider(r.OAuth2Provider())
	})

	if err := syncClients(context.Background(), reg.ClientManager(), c.Array("staticClients")); err != nil {
		return
	}
}

func GetRegistry() driver.Registry {
	return reg
}

func GetConfigurationProvider() ConfigurationProvider {
	return conf
}

func syncClients(ctx context.Context, s client.Storage, c common.Scanner) error {
	var clients []*client.Client

	if c == nil {
		return nil
	}

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

	for _, cli := range clients {
		_, err := s.GetClient(ctx, cli.GetID())

		var redirectURIs []string
		for _, r := range cli.RedirectURIs {
			redirectURIs = append(redirectURIs, rangeFromStr(r)...)
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
