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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	auth2 "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/idm/oauth"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceOAuth
)

func init() {
	runtime.Register("main", func(ctx context.Context) {

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("OAuth Provider"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            oauth.InsertPruningJob,
				},
			}),
			service.WithGRPC(func(ctx context.Context, server *grpc.Server) error {
				h := &Handler{name: Name}

				auth2.RegisterAuthTokenVerifierEnhancedServer(server, h)
				auth2.RegisterLoginProviderEnhancedServer(server, h)
				auth2.RegisterConsentProviderEnhancedServer(server, h)
				auth2.RegisterLogoutProviderEnhancedServer(server, h)
				auth2.RegisterAuthCodeProviderEnhancedServer(server, h)
				auth2.RegisterAuthCodeExchangerEnhancedServer(server, h)
				auth2.RegisterAuthTokenRefresherEnhancedServer(server, h)
				auth2.RegisterAuthTokenRevokerEnhancedServer(server, h)
				auth2.RegisterAuthTokenPrunerEnhancedServer(server, h)
				auth2.RegisterPasswordCredentialsTokenEnhancedServer(server, h)

				// Registry initialization
				// Blocking on purpose, as it should block login
				return auth.InitRegistry(ctx, Name)
			}),
			/*
				// TODO V4
				service.WatchPath("services/"+common.ServiceWebNamespace_+common.ServiceOAuth, func(_ service.Service, c configx.Values) {
					auth.InitConfiguration(config.Get("services", common.ServiceWebNamespace_+common.ServiceOAuth))
				}),
				service.BeforeStart(initialize),
			*/
		)

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceToken),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Personal Access Token Provider"),
			service.WithStorage(oauth.NewDAO, service.WithStoragePrefix("idm_oauth_")),
			service.WithGRPC(func(ctx context.Context, server *grpc.Server) error {
				pat := &PatHandler{
					name: common.ServiceGrpcNamespace_ + common.ServiceToken,
					dao:  servicecontext.GetDAO(ctx).(oauth.DAO),
				}
				auth2.RegisterPersonalAccessTokenServiceEnhancedServer(server, pat)
				auth2.RegisterAuthTokenVerifierEnhancedServer(server, pat)
				auth2.RegisterAuthTokenPrunerEnhancedServer(server, pat)
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
	/*
		ctx := s.Options().Context

		dao := servicecontext.GetDAO(ctx).(sql.DAO)

		// Registry
		auth.InitRegistry(dao)
	*/

	return nil

}
