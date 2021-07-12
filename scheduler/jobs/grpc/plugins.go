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

	"github.com/pydio/cells/common/proto/sync"

	micro "github.com/micro/go-micro"
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
	Migration150 = false
	Migration230 = false
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceJobs),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Store for scheduler jobs description"),
			service.Unique(true),
			service.Fork(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.ValidVersion("1.4.0"),
					Up: func(ctx context.Context) error {
						// Set flag for migration script to be run AfterStart (see below, handler cannot be shared)
						Migration140 = true
						return nil
					},
				},
				{
					TargetVersion: service.ValidVersion("1.5.0"),
					Up: func(ctx context.Context) error {
						// Set flag for migration script to be run AfterStart (see below, handler cannot be shared)
						Migration150 = true
						return nil
					},
				},
				{
					TargetVersion: service.ValidVersion("2.2.99"),
					Up: func(ctx context.Context) error {
						// Set flag for migration script to be run AfterStart (see below, handler cannot be shared)
						Migration230 = true
						return nil
					},
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				serviceDir, e := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceJobs)
				if e != nil {
					return e
				}
				store, err := jobs.NewBoltStore(path.Join(serviceDir, "jobs.db"))
				if err != nil {
					return err
				}
				logStore, err := log.NewSyslogServer(path.Join(serviceDir, "tasklogs.bleve"), "tasksLog", -1)
				if err != nil {
					return err
				}
				handler := NewJobsHandler(store, logStore)
				proto.RegisterJobServiceHandler(m.Options().Server, handler)
				log2.RegisterLogRecorderHandler(m.Options().Server, handler)
				sync.RegisterSyncEndpointHandler(m.Options().Server, handler)

				m.Init(
					micro.BeforeStop(func() error {
						handler.Close()
						logStore.Close()
						store.Close()
						return nil
					}),
					micro.AfterStart(func() error {
						for _, j := range getDefaultJobs() {
							if e := handler.GetJob(m.Options().Context, &proto.GetJobRequest{JobID: j.ID}, &proto.GetJobResponse{}); e != nil {
								handler.PutJob(m.Options().Context, &proto.PutJobRequest{Job: j}, &proto.PutJobResponse{})
							}
							// Force re-adding thumbs job
							if Migration230 && j.ID == "thumbs-job" {
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
						if Migration150 {
							// Remove archive-changes-job
							if e := handler.DeleteJob(m.Options().Context, &proto.DeleteJobRequest{JobID: "archive-changes-job"}, &proto.DeleteJobResponse{}); e != nil {
								log3.Logger(m.Options().Context).Error("Could not remove archive-changes-job", zap.Error(e))
							} else {
								log3.Logger(m.Options().Context).Info("[Migration] Removed archive-changes-job")
							}
							// Remove resync-changes-job
							if e := handler.DeleteJob(m.Options().Context, &proto.DeleteJobRequest{JobID: "resync-changes-job"}, &proto.DeleteJobResponse{}); e != nil {
								log3.Logger(m.Options().Context).Error("Could not remove resync-changes-job", zap.Error(e))
							} else {
								log3.Logger(m.Options().Context).Info("[Migration] Removed resync-changes-job")
							}
						}
						if Migration230 {
							// Remove clean thumbs job and re-insert thumbs job
							if e := handler.DeleteJob(m.Options().Context, &proto.DeleteJobRequest{JobID: "clean-thumbs-job"}, &proto.DeleteJobResponse{}); e != nil {
								log3.Logger(m.Options().Context).Error("Could not remove clean-thumbs-job", zap.Error(e))
							} else {
								log3.Logger(m.Options().Context).Info("[Migration] Removed clean-thumbs-job")
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
