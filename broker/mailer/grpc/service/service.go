/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

// Package service provides the actual logic for posting emails to queue or to mail servers
package service

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	mailer2 "github.com/pydio/cells/v5/broker/mailer"
	grpc2 "github.com/pydio/cells/v5/broker/mailer/grpc"
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/mailer"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
)

var (
	// Name is the identifier of this service
	Name = common.ServiceGrpcNamespace_ + common.ServiceMailer
)

func init() {
	config.RegisterVaultKey("services/" + Name + "/sender/password")
	jobs.RegisterDefault(mailer2.QueueJob(Name), common.ServiceGrpcNamespace_+common.ServiceMailer)

	runtime.Register("main", func(ctx context.Context) {

		config.RegisterExposedConfigs(Name, grpc2.ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("MailSender Service"),
			service.AutoRestart(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up: func(ctx context.Context) error {
						return mailer2.RegisterQueueJob(ctx, Name)
					},
				},
			}),
			service.WithStorageDrivers(mailer2.Drivers...),
			service.WithStorageMigrator(mailer2.MigrateQueue),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {

				handler := grpc2.NewHandler(Name)
				_ = runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, s string) error {
					config.GetAndWatch(ctx, nil, []string{"services", Name}, func(values configx.Values) {
						if er := handler.CheckSender(ctx, values); er == nil {
							log.Logger(ctx).Info("Enabling mailer status for " + s)
						} else {
							log.Logger(ctx).Warn("No mailer enabled for "+s, zap.Error(er))
						}
					})
					return nil
				})

				mailer.RegisterMailerServiceServer(server, handler)

				return nil
			}),
		)
	})
}
