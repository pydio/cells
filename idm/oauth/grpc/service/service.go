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
package service

import (
	"context"
	"log"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	auth2 "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	log2 "github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/i18n/languages"
	"github.com/pydio/cells/v4/idm/oauth"
	grpc2 "github.com/pydio/cells/v4/idm/oauth/grpc"
	"github.com/pydio/cells/v4/idm/oauth/lang"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceOAuth
)

//func NewAuthRegistry(db *gorm.DB) (auth.Registry, error) {
//	//if strings.HasPrefix(path, "mysql") {
//	//	mysqlConfig, err := tools.ParseDSN(path)
//	//	if err != nil {
//	//		return nil, err
//	//	}
//	//	if ssl, ok := mysqlConfig.Params["ssl"]; ok && ssl == "true" {
//	//		u := &url.URL{}
//	//		q := u.Query()
//	//		q.Add(crypto.KeyCertStoreName, mysqlConfig.Params[crypto.KeyCertStoreName])
//	//		q.Add(crypto.KeyCertInsecureHost, mysqlConfig.Params[crypto.KeyCertInsecureHost])
//	//		q.Add(crypto.KeyCertUUID, mysqlConfig.Params[crypto.KeyCertUUID])
//	//		q.Add(crypto.KeyCertKeyUUID, mysqlConfig.Params[crypto.KeyCertKeyUUID])
//	//		q.Add(crypto.KeyCertCAUUID, mysqlConfig.Params[crypto.KeyCertCAUUID])
//	//		u.RawQuery = q.Encode()
//	//
//	//		tlsConfig, err := crypto.TLSConfigFromURL(u)
//	//		if err != nil {
//	//			return nil, err
//	//		}
//	//		if tlsConfig != nil {
//	//			delete(mysqlConfig.Params, "ssl")
//	//			delete(mysqlConfig.Params, crypto.KeyCertStoreName)
//	//			delete(mysqlConfig.Params, crypto.KeyCertInsecureHost)
//	//			delete(mysqlConfig.Params, crypto.KeyCertUUID)
//	//			delete(mysqlConfig.Params, crypto.KeyCertKeyUUID)
//	//			delete(mysqlConfig.Params, crypto.KeyCertCAUUID)
//	//
//	//			tools.RegisterTLSConfig("cells", tlsConfig)
//	//			mysqlConfig.TLSConfig = "cells"
//	//			path = mysqlConfig.FormatDSN()
//	//		}
//	//	}
//	//
//	//	// dbName = mysqlConfig.DBName
//	//}
//
//	sqlDB, err := db.DB()
//	if err != nil {
//		return nil, err
//	}
//
//	driver, err := dbal.GetDriverFor(sqlDB.Conn())
//	if err != nil {
//		return nil, err
//	}
//
//	reg := driver.(auth.Registry)
//	reg.Init(ctx, true, true, nil)
//
//	auth.RegisterOryProvider(reg.OAuth2Provider())
//
//	return reg, err
//}

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
			service.WithStorageDrivers(oauth.NewRegistryDAO),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				h := grpc2.NewOAuthGRPCHandler()

				auth2.RegisterAuthTokenVerifierServer(server, h)
				auth2.RegisterLoginProviderServer(server, h)
				auth2.RegisterConsentProviderServer(server, h)
				auth2.RegisterLogoutProviderServer(server, h)
				auth2.RegisterAuthCodeProviderServer(server, h)
				auth2.RegisterAuthCodeExchangerServer(server, h)
				auth2.RegisterAuthTokenRefresherServer(server, h)
				auth2.RegisterAuthTokenRevokerServer(server, h)
				auth2.RegisterAuthTokenPrunerServer(server, h)
				auth2.RegisterPasswordCredentialsTokenServer(server, h)

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

				return nil
				// Registry initialization
				// Blocking on purpose, as it should block login
				//er := auth.InitRegistry(ctx, Name)
				//if er == nil {
				//	log2.Logger(ctx).Info("Finished auth.InitRegistry")
				//} else {
				//	log2.Logger(ctx).Info("Error while applying auth.InitRegistry", zap.Error(er))
				//}
				//return er
			}),
		)

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceToken),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Personal Access Token Provider"),
			service.WithStorageDrivers(oauth.PatDrivers...),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				pat := &grpc2.PATHandler{}
				auth2.RegisterPersonalAccessTokenServiceServer(server, pat)
				auth2.RegisterAuthTokenVerifierServer(server, pat)
				auth2.RegisterAuthTokenPrunerServer(server, pat)
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
	T := lang.Bundle().T(l)
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

	pJob := pruningJob(languages.GetDefaultLanguage(config.Get()))
	cli := jobsc.JobServiceClient(ctx)
	if resp, e := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: pJob.ID}); e == nil && resp.Job != nil {
		return nil // Already exists
	} else if e != nil && !errors.Is(e, errors.StatusNotFound) {
		//log2.Logger(ctx).Info("Insert pruning job: jobs service not ready yet :"+e.Error(), zap.Error(serviceerrors.FromError(e)))
		return e // not ready yet, retry
	}
	_, e := cli.PutJob(ctx, &jobs.PutJobRequest{Job: pJob})

	return e
}
