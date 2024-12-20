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
	"fmt"
	"net/http"
	"strings"

	"github.com/ory/fosite"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/rs/cors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/oauth"
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
			service.Migrations([]*service.Migration{{
				TargetVersion: service.FirstRun(),
				Up: func(ctx context.Context) error {
					if err := config.Get(ctx, "services", common.ServiceWebNamespace_+common.ServiceOAuth).Set(map[string]any{
						"secret": "a-very-insecure-secret-for-checking-out-the-demo",
						"connectors": []any{
							map[string]any{
								"type": "pydio",
								"id":   "pydio",
								"name": "Pydio Cells",
							},
						},
						"cors": map[string]any{
							"public": map[string]any{
								"allowedOrigins": "*",
							},
						},
						"staticClients": []any{
							map[string]any{
								"client_id":                         config.DefaultOAuthClientID,
								"client_name":                       "CellsFrontend Application",
								"revokeRefreshTokenAfterInactivity": "2h",
								"grant_types":                       []any{"authorization_code", "refresh_token"},
								"redirect_uris":                     []any{"#default_bind#/auth/callback"},
								"post_logout_redirect_uris":         []any{"#default_bind#/auth/logout"},
								"response_types":                    []any{"code", "token", "id_token"},
								"scope":                             "openid email profile pydio offline",
							},
							map[string]any{
								"client_id":      "cells-sync",
								"client_name":    "CellsSync Application",
								"grant_types":    []any{"authorization_code", "refresh_token"},
								"redirect_uris":  []any{"http://localhost:3000/servers/callback", "http://localhost:[3636-3666]/servers/callback"},
								"response_types": []any{"code", "token", "id_token"},
								"scope":          "openid email profile pydio offline",
							},
							map[string]any{
								"client_id":      "cells-client",
								"client_name":    "Cells Client CLI Tool",
								"grant_types":    []any{"authorization_code", "refresh_token"},
								"redirect_uris":  []any{"http://localhost:3000/servers/callback", "#binds...#/oauth2/oob"},
								"response_types": []any{"code", "token", "id_token"},
								"scope":          "openid email profile pydio offline",
							},
							map[string]any{
								"client_id":      "cells-mobile",
								"client_name":    "Mobile Applications",
								"grant_types":    []any{"authorization_code", "refresh_token"},
								"redirect_uris":  []any{"cellsauth://callback"},
								"response_types": []any{"code", "token", "id_token"},
								"scope":          "openid email profile pydio offline",
							},
						},
					}); err != nil {
						return err
					}

					if err := config.Save(ctx, common.PydioSystemUsername, "Oauth initialised"); err != nil {
						return fmt.Errorf("could not save config migrations %v", err)
					}

					return nil
				},
			}}),
			service.WithStorageDrivers(oauth.RegistryDrivers...),
			service.WithHTTPOptions(func(ctx context.Context, serveMux routing.RouteRegistrar, o *service.ServiceOptions) error {

				handlerFunc := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					reg, er := manager.Resolve[oauth.Registry](r.Context())
					if er != nil {
						panic(errors.WithMessage(errors.StatusInternalServerError, "cannot resolve oauthReg"))
					}
					reg.PublicRouter().ServeHTTP(w, r)
				})

				handler := TokenMethodWrapper(ctx, handlerFunc)
				handler = middleware.WebIncomingContextMiddleware(ctx, "/oidc", service.ContextKey, o.Server, handler)

				serveMux.Route(RouteOIDC).Handle("/", cors.New(cors.Options{
					AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					AllowedHeaders:   []string{"Authorization", "Content-Type"},
					ExposedHeaders:   []string{"Content-Type"},
					AllowCredentials: true,
				}).Handler(handler), routing.WithStripPrefix())
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
				registry, err := manager.Resolve[oauth.Registry](ctx)
				if err == nil {
					if cli, er := registry.OAuth2Storage().GetClient(ctx, clientId); er == nil {
						if oidcClient, ok := cli.(fosite.OpenIDConnectClient); ok {
							if oidcClient.GetTokenEndpointAuthMethod() == "none" && r.Header != nil {
								log.Logger(ctx).Debug("[/oidc/oauth2/token] Removing Basic Auth for public client")
								r.Header.Del("Authorization")
							}
						}
					}
				} else {
					log.Logger(ctx).Warn("TokenMethodWrapper cannot resolve registry", zap.Error(err))
				}
			}
		}
		handler.ServeHTTP(w, r)
	})
}
