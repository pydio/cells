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

// Package web spins an OpenID Connect Server using the coreos/dex implementation
package web

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/jwk"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/hydra/x"
	"github.com/rs/cors"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+common.ServiceOAuth),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("OAuth Provider"),
			service.WithHTTP(func(ctx context.Context, serveMux server.HttpMux) error {
				router := mux.NewRouter()
				hh := config.GetSitesAllowedURLs()
				for _, u := range hh {
					// fmt.Println("Registering router for host", u.Host)
					// Two-level check : Host() is regexp based, fast, but only on Hostname, then custom check to take port into account
					host := u.Host
					hostname := u.Hostname()
					subRouter := router.Host(hostname).MatcherFunc(func(request *http.Request, _ *mux.RouteMatch) bool {
						// TODO V4 - Host should contain port, it's not ...
						//return host == request.Host
						return true
					})

					conf := auth.GetConfigurationProvider(host)
					reg, e := auth.DuplicateRegistryForConf(common.ServiceGrpcNamespace_+common.ServiceOAuth, conf)
					if e != nil {
						return e
					}

					admin := x.NewRouterAdmin()
					public := x.NewRouterPublic()

					oauth2Handler := oauth2.NewHandler(reg, conf.GetProvider())
					oauth2Handler.SetRoutes(admin, public, func(handler http.Handler) http.Handler {
						return handler
					})

					consentHandler := consent.NewHandler(reg, conf.GetProvider())
					consentHandler.SetRoutes(admin)

					keyHandler := jwk.NewHandler(reg, conf.GetProvider())
					keyHandler.SetRoutes(admin, public, func(handler http.Handler) http.Handler {
						return handler
					})

					/*
						// seems not necessary
							if conf.GetProvider().CORSEnabled("admin") {
								subRouter.PathPrefix("/oidc-admin/").Handler(http.StripPrefix("/oidc-admin", cors.New(conf.CORSOptions("admin")).Handler(servicecontext.HttpWrapperMeta(admin))))
							} else {
								subRouter.PathPrefix("/oidc-admin/").Handler(http.StripPrefix("/oidc-admin", servicecontext.HttpWrapperMeta(admin)))
							}
					*/

					subRouter.Handler(servicecontext.HttpWrapperMeta(ctx, public))
					//subRouter.PathPrefix("/oidc/").Handler(http.StripPrefix("/oidc", servicecontext.HttpWrapperMeta(public)))
				}

				serveMux.Handle("/oidc/", http.StripPrefix("/oidc", cors.New(cors.Options{
					AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					AllowedHeaders:   []string{"Authorization", "Content-Type"},
					ExposedHeaders:   []string{"Content-Type"},
					AllowCredentials: true,
				}).Handler(router)))
				return nil
			}),
			/*
				service.WatchPath("services/"+common.ServiceWebNamespace_+common.ServiceOAuth, func(_ service.Service, c configx.Values) {
					auth.InitConfiguration(config.Get("services", common.ServiceWebNamespace_+common.ServiceOAuth))
				}),
				service.BeforeStart(initialize),
			*/
		)
	})
}

func initialize(s service.Service) error {

	/*
		ctx := s.Options().Context

		// Configuration
		auth.InitConfiguration(config.Get("services", common.ServiceWebNamespace_+common.ServiceOAuth))

		// Registry
		auth.InitRegistry(servicecontext.GetDAO(ctx).(sql.DAO))

	*/

	return nil
}
