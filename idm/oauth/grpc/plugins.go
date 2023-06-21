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

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	log2 "github.com/pydio/cells/v4/common/log"
	auth2 "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/idm/oauth"
	"github.com/pydio/cells/v4/idm/oauth/lang"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceOAuth
)

func init() {
	jobs.RegisterDefault(pruningJob("en-us"), Name)
	runtime.Register("main", func(ctx context.Context) {

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("OAuth Provider"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            insertPruningJob,
				},
			}),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
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

				watcher, _ := config.Watch(configx.WithPath("services", common.ServiceWebNamespace_+common.ServiceOAuth))
				go func() {
					for {
						values, er := watcher.Next()
						if er != nil {
							break
						}
						log2.Logger(ctx).Info("Reloading configurations for OAuth services")
						auth.InitConfiguration(values.(configx.Values))
					}
				}()

				// Registry initialization
				// Blocking on purpose, as it should block login
				er := auth.InitRegistry(ctx, Name)
				if er == nil {
					log2.Logger(ctx).Info("Finished auth.InitRegistry")
				} else {
					log2.Logger(ctx).Info("Error while applying auth.InitRegistry", zap.Error(er))
				}
				return er
			}),
		)

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceToken),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Personal Access Token Provider"),
			service.WithStorage(oauth.NewDAO, service.WithStoragePrefix("idm_oauth_")),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
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

		auth.OnConfigurationInit(func(scanner configx.Scanner) {
			var m []struct {
				ID   string
				Name string
				Type string
			}

			if err := scanner.Scan(&m); err != nil {
				log.Fatal("Cannot correctly scan Connectors from config. JSON format maybe wrong, please check configuration. Error was ", err)
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

func pruningJob(l string) *jobs.Job {
	T := lang.Bundle().GetTranslationFunc(l)
	aName := "actions.auth.prune.tokens"

	return &jobs.Job{
		ID:    aName,
		Owner: common.PydioSystemUsername,
		Label: T("Auth.PruneJob.Title"),
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT60M", // Every hour
		},
		AutoStart:      false,
		MaxConcurrency: 1,
		Actions: []*jobs.Action{{
			ID: aName,
		}},
	}
}

// insertPruningJob adds a job to scheduler
func insertPruningJob(ctx context.Context) error {

	log2.Logger(ctx).Info("Inserting pruning job for revoked token and reset password tokens")

	pJob := pruningJob(i18n.GetDefaultLanguage(config.Get()))
	cli := jobs.NewJobServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceJobs))
	if resp, e := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: pJob.ID}); e == nil && resp.Job != nil {
		return nil // Already exists
	} else if e != nil && errors.FromError(e).Code != 404 {
		log2.Logger(ctx).Info("Insert pruning job: jobs service not ready yet :"+e.Error(), zap.Error(errors.FromError(e)))
		return e // not ready yet, retry
	}
	_, e := cli.PutJob(ctx, &jobs.PutJobRequest{Job: pJob})

	return e
}
