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
package grpc

import (
	"context"
	"log"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/oauth"
	"github.com/pydio/cells/x/configx"
)

func init() {

	plugins.Register(func(ctx context.Context) {

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceOAuth),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("OAuth Provider"),
			service.WithStorage(oauth.NewDAO, "idm_oauth_"),
			service.WithMicro(func(m micro.Service) error {
				h := &Handler{}
				proto.RegisterLoginProviderHandler(m.Options().Server, h)
				proto.RegisterConsentProviderHandler(m.Options().Server, h)
				proto.RegisterLogoutProviderHandler(m.Options().Server, h)
				proto.RegisterAuthCodeProviderHandler(m.Options().Server, h)
				proto.RegisterAuthCodeExchangerHandler(m.Options().Server, h)
				proto.RegisterAuthTokenVerifierHandler(m.Options().Server, h)
				proto.RegisterAuthTokenRefresherHandler(m.Options().Server, h)
				proto.RegisterAuthTokenRevokerHandler(m.Options().Server, h)

				return nil
			}),
			service.WatchPath("services/"+common.ServiceWebNamespace_+common.ServiceOAuth, func(_ service.Service, c configx.Values) {
				auth.InitConfiguration(config.Get("services", common.ServiceWebNamespace_+common.ServiceOAuth))
			}),
			service.BeforeStart(initialize),
		)

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceToken),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Personal Access Token Provider"),
			service.WithStorage(oauth.NewDAO, "idm_oauth_"),
			service.WithMicro(func(m micro.Service) error {
				pat := &PatHandler{}
				proto.RegisterPersonalAccessTokenServiceHandler(m.Options().Server, pat)
				proto.RegisterAuthTokenVerifierHandler(m.Options().Server, pat)
				return nil
			}),
		)

		auth.OnConfigurationInit(func(scanner common.Scanner) {
			var m []struct {
				ID   string
				Name string
				Type string
			}

			if err := scanner.Scan(&m); err != nil {
				log.Fatal("Wrong configuration ", err)
			}

			for _, mm := range m {
				if mm.Type == "pydio" {
					// Registering the first connector
					auth.RegisterConnector(mm.ID, mm.Name, mm.Type, nil)
				}
			}
		})

		// load configuration
		auth.InitConfiguration(config.Get("services", common.ServiceWebNamespace_+common.ServiceOAuth))

		// Register the services as GRPC Auth Providers
		auth.RegisterGRPCProvider(auth.ProviderTypeGrpc, common.ServiceGrpcNamespace_+common.ServiceOAuth)
		auth.RegisterGRPCProvider(auth.ProviderTypePAT, common.ServiceGrpcNamespace_+common.ServiceToken)
	})
}

func initialize(s service.Service) error {

	ctx := s.Options().Context

	dao := servicecontext.GetDAO(ctx).(sql.DAO)

	// Registry
	auth.InitRegistry(dao)

	return nil
}
