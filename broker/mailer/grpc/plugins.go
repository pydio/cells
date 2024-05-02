/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package grpc provides the actual logic for posting emails to queue or to mail servers
package grpc

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	mailer2 "github.com/pydio/cells/v4/broker/mailer"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var (
	// Name is the identifier of this service
	Name = common.ServiceGrpcNamespace_ + common.ServiceMailer
)

func init() {
	jobs.RegisterDefault(queueJob(), Name)
	runtime.Register("main", func(ctx context.Context) {

		config.RegisterExposedConfigs(Name, ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("MailSender Service"),
			service.AutoRestart(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            registerQueueJob,
				},
			}),
			service.WithStorageDrivers(mailer2.NewBoltDAO, mailer2.NewMongoDAO),
			service.WithStorageMigrator(mailer2.MigrateQueue),
			/*
				service.WithStorage(mailer2.NewQueueDAO,
					service.WithStoragePrefix("mailer"),
					service.WithStorageSupport(boltdb.Driver, mongodb.Driver),
					service.WithStorageMigrator(mailer2.MigrateQueue),
					service.WithStorageDefaultDriver(func() (string, string) {
						return "boltdb", filepath.Join(runtime.MustServiceDataDir(Name), "queue.db")
					}),
				),*/
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {

				conf := config.Get("services", Name)
				handler, err := NewHandler(c, conf)
				if err != nil {
					log.Logger(ctx).Error("Init handler", zap.Error(err))
					return err
				}
				log.Logger(ctx).Debug("Init handler OK", zap.Any("h", handler))

				mailer.RegisterMailerServiceServer(server, handler)

				return nil
			}),
		)
	})
}

func queueJob() *jobs.Job {
	return &jobs.Job{
		ID:             "flush-mailer-queue",
		Label:          "Flush Mails Queue",
		Owner:          common.PydioSystemUsername,
		MaxConcurrency: 1,
		AutoStart:      false,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT5M", // every 5 mn
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.cmd.rpc",
				Parameters: map[string]string{
					"service": Name,
					"method":  "MailerService.ConsumeQueue",
					"request": `{}`,
				},
			},
		},
	}
}

// registerQueueJob adds a job to the scheduler to regularly flush the queue
func registerQueueJob(ctx context.Context) error {

	log.Logger(ctx).Info("Registering default job for consuming mailer queue")

	if _, err := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: queueJob()}); err != nil {
		return err
	}

	return nil
}
