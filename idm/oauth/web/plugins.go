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

	"github.com/gorilla/mux"
	"github.com/micro/go-micro"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/hydra/x"
	"github.com/rs/cors"

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

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_OAUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("OAuth Provider"),
			service.WithStorage(oauth.NewDAO, "idm_oauth_"),
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
			),
			service.BeforeStart(initialize),
		)
	})
}

func serve(s service.Service) (micro.Option, error) {
	srv := defaults.NewHTTPServer()

	router := mux.NewRouter()

	hh := config.GetSitesAllowedHostnames()
	for h, _ := range hh {
		r := router.Host(h).Subrouter()

		conf := auth.GetConfigurationProvider(h)
		reg := auth.DuplicateRegistryForConf(conf)

		admin := x.NewRouterAdmin()
		public := x.NewRouterPublic()

		oauth2Handler := oauth2.NewHandler(reg, conf)
		oauth2Handler.SetRoutes(admin, public, driver.OAuth2AwareCORSMiddleware("public", reg, conf))

		consentHandler := consent.NewHandler(reg, conf)
		consentHandler.SetRoutes(admin)

		keyHandler := jwk.NewHandler(reg, conf)
		keyHandler.SetRoutes(admin, public, driver.OAuth2AwareCORSMiddleware("public", reg, conf))

		if conf.CORSEnabled("admin") {
			r.PathPrefix("/oidc-admin/").Handler(http.StripPrefix("/oidc-admin", cors.New(conf.CORSOptions("admin")).Handler(servicecontext.HttpMetaExtractorWrapper(admin))))
		} else {
			r.PathPrefix("/oidc-admin/").Handler(http.StripPrefix("/oidc-admin", servicecontext.HttpMetaExtractorWrapper(admin)))
		}

		r.PathPrefix("/oidc/").Handler(http.StripPrefix("/oidc", servicecontext.HttpMetaExtractorWrapper(public)))
	}

	hd := srv.NewHandler(router)

	if err := srv.Handle(hd); err != nil {
		return nil, err
	}

	return micro.Server(srv), nil
}

func initialize(s service.Service) error {

	ctx := s.Options().Context

	// Configuration
	auth.InitConfiguration(config.Values("services", common.SERVICE_WEB_NAMESPACE_+common.SERVICE_OAUTH))

	// Registry
	auth.InitRegistry(servicecontext.GetDAO(ctx).(sql.DAO))

	return nil
}
