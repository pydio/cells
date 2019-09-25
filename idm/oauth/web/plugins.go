/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package grpc spins an OpenID Connect Server using the coreos/dex implementation
package web

import (
	"context"
	"net/http"

	"github.com/jmoiron/sqlx"

	"github.com/micro/go-micro"
	"github.com/ory/hydra/client"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/hydra/x"
	"github.com/ory/x/sqlcon"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/oauth"
)

var (
	store *oauth2.FositeSQLStore
	reg   driver.Registry
	conf  configuration.Provider
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_OAUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("OAuth Provider"),
			service.WithStorage(oauth.NewDAO),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
				return service.RunnerFunc(func() error {
						return nil
					}), service.CheckerFunc(func() error {
						return nil
					}), service.StopperFunc(func() error {
						return nil
					}), nil
			},
				serve,
				wrapAfterStart(initialize),
			),
			service.Watch(func(ctx context.Context, c common.ConfigValues) {
				// Making sure the staticClients are up to date
				syncClients(ctx, reg.ClientManager(), c.Array("staticClients"))
			}),
		)
	})
}

func serve(s service.Service) (micro.Option, error) {
	srv := defaults.NewHTTPServer()

	externalURL := config.Get("defaults", "url").String("")

	conf = oauth.NewProvider(externalURL, servicecontext.GetConfig(s.Options().Context))

	admin := x.NewRouterAdmin()
	public := x.NewRouterPublic()

	reg = driver.NewRegistrySQL().WithConfig(conf)

	oauth2Handler := oauth2.NewHandler(reg, conf)
	oauth2Handler.SetRoutes(admin, public, driver.OAuth2AwareCORSMiddleware("public", reg, conf))

	consentHandler := consent.NewHandler(reg, conf)
	consentHandler.SetRoutes(admin)

	keyHandler := jwk.NewHandler(reg, conf)
	keyHandler.SetRoutes(admin, public, driver.OAuth2AwareCORSMiddleware("public", reg, conf))

	mux := http.NewServeMux()
	mux.Handle("/oidc/admin/", http.StripPrefix("/oidc/admin", admin))
	mux.Handle("/oidc/", http.StripPrefix("/oidc", public))

	hd := srv.NewHandler(mux)

	if err := srv.Handle(hd); err != nil {
		return nil, err
	}

	return micro.Server(srv), nil
}

func wrapAfterStart(f func(service.Service) error) func(service.Service) (micro.Option, error) {
	return func(s service.Service) (micro.Option, error) {
		return micro.AfterStart(func() error {
			return f(s)
		}), nil
	}
}

func initialize(s service.Service) error {
	ctx := s.Options().Context

	dao := servicecontext.GetDAO(ctx).(sql.DAO)
	db := sqlx.NewDb(dao.DB(), dao.Driver())

	r := reg.(*driver.RegistrySQL).WithDB(db)
	r.Init()
	sql.LockMigratePackage()
	defer func() {
		sql.UnlockMigratePackage()
	}()
	if _, err := r.ClientManager().(*client.SQLManager).CreateSchemas(dao.Driver()); err != nil {
		return err
	}

	if _, err := r.KeyManager().(*jwk.SQLManager).CreateSchemas(dao.Driver()); err != nil {
		return err
	}

	if _, err := r.ConsentManager().(*consent.SQLManager).CreateSchemas(dao.Driver()); err != nil {
		return err
	}

	store = oauth2.NewFositeSQLStore(db, r, conf)
	store.CreateSchemas(dao.Driver())

	auth.RegisterOryProvider(r.OAuth2Provider())

	c := servicecontext.GetConfig(ctx)

	if err := syncClients(ctx, r.ClientManager(), c.Array("staticClients")); err != nil {
		return err
	}

	return nil
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
