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
	"fmt"

	oidc "github.com/coreos/go-oidc"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/broker"
	"github.com/pydio/cells/common/plugins"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service"
)

func init() {

	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_OAUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("OAuth Provider"),
			service.Dependency(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_AUTH, []string{}),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
				return service.RunnerFunc(func() error {
						return nil
					}), service.CheckerFunc(func() error {
						return nil
					}), service.StopperFunc(func() error {
						return nil
					}), nil
			}, func(s service.Service) (micro.Option, error) {

				broker.Subscribe(common.TOPIC_PROXY_RESTART, func(p broker.Publication) error {
					//<-time.After(10 * time.Second)
					var err error
					provider, err = oidc.NewProvider(context.Background(), "http://mypydio.com:8080/auth/dex")
					if err != nil {
						fmt.Println("We have an error here ", err)
						return err
					}

					oauth2Config = oauth2.Config{
						ClientID:     "cells-front",
						ClientSecret: "jK3arAfePHk6csIbKj4ilfD5",
						RedirectURL:  "http://mypydio.com:8080/oauth2/callback",

						// Discovery returns the OAuth2 endpoints.
						Endpoint: provider.Endpoint(),

						// "openid" is a required scope for OpenID Connect flows.
						Scopes: []string{oidc.ScopeOpenID, "profile", "email"},
					}

					verifier = provider.Verifier(&oidc.Config{ClientID: "cells-front"})

					return nil
				})

				srv := defaults.NewHTTPServer()

				router := NewRouter()

				hd := srv.NewHandler(router)

				if err := srv.Handle(hd); err != nil {
					return nil, err
				}

				return micro.Server(srv), nil
			}),
		)
	})
}
