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

// Package grpc provides a gRPC service to access the store for scheduler job definitions.
package grpc

import (
	"context"
	"path"

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/broker/log"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	log3 "github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/jobs"
	log2 "github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/scheduler/jobs"
)

var (
	Migration140 = false
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS),
			service.Tag(common.SERVICE_TAG_SCHEDULER),
			service.Description("Store for scheduler jobs description"),
			service.Unique(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.ValidVersion("1.4.0"),
					Up: func(ctx context.Context) error {
						// Set flag for migration script to be run AfterStart (see below, handler cannot be shared)
						Migration140 = true
						return nil
					},
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				serviceDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_JOBS)
				if e != nil {
					return e
				}
				store, err := jobs.NewBoltStore(path.Join(serviceDir, "jobs.db"))
				if err != nil {
					return err
				}
				logStore, err := log.NewSyslogServer(path.Join(serviceDir, "tasklogs.bleve"), "tasksLog")
				if err != nil {
					return err
				}
				handler := &JobsHandler{
					store: store,
				}
				handler.Handler.Repo = logStore
				proto.RegisterJobServiceHandler(m.Options().Server, handler)
				log2.RegisterLogRecorderHandler(m.Options().Server, handler)

				m.Init(
					micro.BeforeStop(func() error {
						store.Close()
						return nil
					}),
					micro.AfterStart(func() error {
						for _, j := range getDefaultJobs() {
							if e := handler.GetJob(m.Options().Context, &proto.GetJobRequest{JobID: j.ID}, &proto.GetJobResponse{}); e != nil {
								handler.PutJob(m.Options().Context, &proto.PutJobRequest{Job: j}, &proto.PutJobResponse{})
							}
						}
						// Clean tasks stuck in "Running" status
						handler.CleanStuckTasks(m.Options().Context)
						if Migration140 {
							response := &proto.DeleteTasksResponse{}
							if e = handler.DeleteTasks(m.Options().Context, &proto.DeleteTasksRequest{
								JobId:      "users-activity-digest",
								Status:     []proto.TaskStatus{proto.TaskStatus_Any},
								PruneLimit: 1,
							}, response); e == nil {
								log3.Logger(m.Options().Context).Info("Migration 1.4.0: removed tasks on job users-activity-digest that could fill up the scheduler", zap.Any("number", len(response.Deleted)))
							} else {
								log3.Logger(m.Options().Context).Error("Error while trying to prune tasks for job users-activity-digest", zap.Error(e))
							}
							if e = handler.DeleteTasks(m.Options().Context, &proto.DeleteTasksRequest{
								JobId:      "resync-changes-job",
								Status:     []proto.TaskStatus{proto.TaskStatus_Any},
								PruneLimit: 1,
							}, response); e == nil {
								log3.Logger(m.Options().Context).Info("Migration 1.4.0: removed tasks on job resync-changes-job that could fill up the scheduler", zap.Any("number", len(response.Deleted)))
							} else {
								log3.Logger(m.Options().Context).Error("Error while trying to prune tasks for job resync-changes-job", zap.Error(e))
							}
						}
						return nil
					}),
				)

				return nil
			}),
		)

	})
}
