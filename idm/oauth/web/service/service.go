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

// Package service spins an OpenID Connect Server
package service

import (
	"context"
	"encoding/base64"
	"net"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/ory/fosite"
	"github.com/ory/hydra/v2/consent"
	"github.com/ory/hydra/v2/jwk"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/ory/hydra/v2/x"
	"github.com/rs/cors"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/oauth"
)

const (
	RouteOIDC = "oidc"
)

func init() {

	routing.RegisterRoute(RouteOIDC, "OpenID Connect service", "/oidc")

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+common.ServiceOAuth),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("OAuth Provider"),
			service.WithHTTP(func(ctx context.Context, serveMux routing.RouteRegistrar) error {
				router := mux.NewRouter()
				hh := routing.GetSitesAllowedURLs()
				for _, u := range hh {
					// fmt.Println("Registering router for host", u.String())
					// Two-level check : Host() is regexp based, fast, but only on Hostname
					host := u.Host
					hostname := u.Hostname()
					subRouter := router.Host(hostname)
					if _, p, e := net.SplitHostPort(u.Host); e == nil && p != "" {
						// Additional check to take port into account
						subRouter = subRouter.MatcherFunc(func(request *http.Request, _ *mux.RouteMatch) bool {
							return host == request.Host
						})
					}

					conf := auth.GetConfigurationProvider(host)
					reg, e := oauth.DuplicateRegistryForConf(common.ServiceGrpcNamespace_+common.ServiceOAuth, conf)
					if e != nil {
						return e
					}

					admin := x.NewRouterAdmin((*conf.GetProvider()).Config().AdminURL)
					public := x.NewRouterPublic()

					oauth2Handler := oauth2.NewHandler(reg, (*conf.GetProvider()).Config())
					oauth2Handler.SetRoutes(admin, public, func(handler http.Handler) http.Handler {
						return handler
					})

					consentHandler := consent.NewHandler(reg, (*conf.GetProvider()).Config())
					consentHandler.SetRoutes(admin)

					keyHandler := jwk.NewHandler(reg)
					keyHandler.SetRoutes(admin, public, func(handler http.Handler) http.Handler {
						return handler
					})

					subRouter.Handler(middleware.HttpWrapperMeta(ctx, TokenMethodWrapper(ctx, public)))
				}

				serveMux.Route(RouteOIDC).Handle("/", cors.New(cors.Options{
					AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					AllowedHeaders:   []string{"Authorization", "Content-Type"},
					ExposedHeaders:   []string{"Content-Type"},
					AllowCredentials: true,
				}).Handler(router), routing.WithStripPrefix())
				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute(RouteOIDC)
				return nil
			}),
		)
	})
}

func TokenMethodWrapper(ctx context.Context, handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.RequestURI == "/oidc"+oauth2.TokenPath {

			// Pre-check compat between client_id and client authentication method
			_ = r.ParseForm()
			clientId := r.Form.Get("client_id")
			if clientId == "" {
				// This is not normal - Hopefully we'll have a basic Auth Header
				if ba := r.Header.Get("Authorization"); ba != "" {
					ba = strings.TrimPrefix(ba, "Basic ")
					if c, e := base64.StdEncoding.DecodeString(ba); e == nil && strings.Contains(string(c), ":") {
						clientId = strings.Split(string(c), ":")[0]
						r.PostForm.Set("client_id", clientId)
						_ = r.ParseForm()
						log.Logger(ctx).Debug("[/oidc/oauth2/token] Inferred client_id from Authorization Header, replaced in PostForm")
					}
				}
			}

			if clientId != "" {
				if cli, er := oauth.GetRegistry().OAuth2Storage().GetClient(ctx, clientId); er == nil {
					if oidcClient, ok := cli.(fosite.OpenIDConnectClient); ok {
						if oidcClient.GetTokenEndpointAuthMethod() == "none" && r.Header != nil {
							log.Logger(ctx).Debug("[/oidc/oauth2/token] Removing Basic Auth for public client")
							r.Header.Del("Authorization")
						}
					}
				}
			}
		}
		handler.ServeHTTP(w, r)
	})
}
