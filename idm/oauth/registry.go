package oauth

import (
	"context"
	"fmt"
	"sync"

	"github.com/jmoiron/sqlx"
	"github.com/ory/hydra/client"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/x/sqlcon"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/sql"
)

var (
	reg  driver.Registry
	conf configuration.Provider
	once = &sync.Once{}
)

func InitRegistry(c common.ConfigValues, dao sql.DAO) {
	once.Do(func() {
		//var err error

		externalURL := config.Get("defaults", "url").String("")

		conf = NewProvider(externalURL, c)

		db := sqlx.NewDb(dao.DB(), dao.Driver())

		// reg = driver.NewRegistrySQL().WithDB(db).WithConfig(conf)
		// err := reg.Init()JSON Web Key Set
		reg = driver.NewRegistrySQL().WithConfig(conf)
		r := reg.(*driver.RegistrySQL).WithDB(db)
		r.Init()
		// reg, err = driver.NewRegistry(conf)
		// if err != nil {
		// 	fmt.Println("Error while initing the registry ", err)
		// 	return
		// }

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

		auth.RegisterOryProvider(r.OAuth2Provider())

		if err := syncClients(context.Background(), r.ClientManager(), c.Array("staticClients")); err != nil {
			return
		}

		// NEED TO DO SOMETHING ABOUT THE WATCH
		// service.Watch(func(ctx context.Context, c common.ConfigValues) {
		// 	// Making sure the staticClients are up to date
		// 	syncClients(ctx, reg.ClientManager(), c.Array("staticClients"))
		// }),
	})

}

func GetRegistry() driver.Registry {
	return reg
}

func GetConfigurationProvider() configuration.Provider {
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
