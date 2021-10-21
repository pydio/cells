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
	"time"

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
)

var (
	// Name is the identifier of this service
	Name = common.ServiceGrpcNamespace_ + common.ServiceMailer
)

func init() {
	plugins.Register("main", func(ctx context.Context) {

		config.RegisterExposedConfigs(Name, ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("MailSender Service"),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceJobs, []string{}),
			service.Unique(true),
			service.AutoRestart(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            RegisterQueueJob,
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				ctx := m.Options().Context
				conf := servicecontext.GetConfig(ctx)
				handler, err := NewHandler(ctx, conf)
				if err != nil {
					log.Logger(ctx).Error("Init handler", zap.Error(err))
					return err
				}
				log.Logger(ctx).Debug("Init handler OK", zap.Any("h", handler))

				mailer.RegisterMailerServiceHandler(m.Options().Server, handler)

				m.Init(
					micro.BeforeStop(func() error {
						if handler.queue != nil {
							return handler.queue.Close()
						}
						return nil
					}),
				)
				return nil
			}),
		)
	})
}

// RegisterQueueJob adds a job to the scheduler to regularly flush the queue
func RegisterQueueJob(ctx context.Context) error {

	log.Logger(ctx).Info("Registering default job for consuming mailer queue")
	job := &jobs.Job{
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
	return service.Retry(ctx, func() error {
		cliJob := jobs.NewJobServiceClient(common.ServiceGrpcNamespace_+common.ServiceJobs, defaults.NewClient())
		_, e := cliJob.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return e
	}, 5*time.Second, 20*time.Second)

}
