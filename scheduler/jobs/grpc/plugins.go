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

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	log3 "github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/plugins"
	proto "github.com/pydio/cells/v4/common/proto/jobs"
	log2 "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/scheduler/jobs"
)

var (
	Migration140 = false
	Migration150 = false
	Migration230 = false
)

const ServiceName = common.ServiceGrpcNamespace_ + common.ServiceJobs

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Store for scheduler jobs description"),
			service.Unique(true),
			service.Fork(true),
			service.WithStorage(jobs.NewDAO, "jobs"),
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
			service.WithGRPC(func(c context.Context, server *grpc.Server) error {

				serviceDir, e := config.ServiceDataDir(ServiceName)
				if e != nil {
					return e
				}
				store := servicecontext.GetDAO(c).(jobs.DAO)

				logStore, err := log.NewSyslogServer(path.Join(serviceDir, "tasklogs.bleve"), "tasksLog", -1)
				if err != nil {
					return err
				}
				handler := NewJobsHandler(c, store, logStore)
				proto.RegisterJobServiceEnhancedServer(server, handler)
				log2.RegisterLogRecorderEnhancedServer(server, handler)
				sync.RegisterSyncEndpointEnhancedServer(server, handler)

				for _, j := range getDefaultJobs() {
					if _, e := handler.GetJob(c, &proto.GetJobRequest{JobID: j.ID}); e != nil {
						handler.PutJob(c, &proto.PutJobRequest{Job: j})
					}
					// Force re-adding thumbs job
					if Migration230 && j.ID == "thumbs-job" {
						handler.PutJob(c, &proto.PutJobRequest{Job: j})
					}
				}
				// Clean tasks stuck in "Running" status
				handler.CleanStuckTasks(c)
				if Migration140 {
					if resp, e := handler.DeleteTasks(c, &proto.DeleteTasksRequest{
						JobId:      "users-activity-digest",
						Status:     []proto.TaskStatus{proto.TaskStatus_Any},
						PruneLimit: 1,
					}); e == nil {
						log3.Logger(c).Info("Migration 1.4.0: removed tasks on job users-activity-digest that could fill up the scheduler", zap.Any("number", len(resp.Deleted)))
					} else {
						log3.Logger(c).Error("Error while trying to prune tasks for job users-activity-digest", zap.Error(e))
					}
					if resp, e := handler.DeleteTasks(c, &proto.DeleteTasksRequest{
						JobId:      "resync-changes-job",
						Status:     []proto.TaskStatus{proto.TaskStatus_Any},
						PruneLimit: 1,
					}); e == nil {
						log3.Logger(c).Info("Migration 1.4.0: removed tasks on job resync-changes-job that could fill up the scheduler", zap.Any("number", len(resp.Deleted)))
					} else {
						log3.Logger(c).Error("Error while trying to prune tasks for job resync-changes-job", zap.Error(e))
					}
				}
				if Migration150 {
					// Remove archive-changes-job
					if _, e := handler.DeleteJob(c, &proto.DeleteJobRequest{JobID: "archive-changes-job"}); e != nil {
						log3.Logger(c).Error("Could not remove archive-changes-job", zap.Error(e))
					} else {
						log3.Logger(c).Info("[Migration] Removed archive-changes-job")
					}
					// Remove resync-changes-job
					if _, e := handler.DeleteJob(c, &proto.DeleteJobRequest{JobID: "resync-changes-job"}); e != nil {
						log3.Logger(c).Error("Could not remove resync-changes-job", zap.Error(e))
					} else {
						log3.Logger(c).Info("[Migration] Removed resync-changes-job")
					}
				}
				if Migration230 {
					// Remove clean thumbs job and re-insert thumbs job
					if _, e := handler.DeleteJob(c, &proto.DeleteJobRequest{JobID: "clean-thumbs-job"}); e != nil {
						log3.Logger(c).Error("Could not remove clean-thumbs-job", zap.Error(e))
					} else {
						log3.Logger(c).Info("[Migration] Removed clean-thumbs-job")
					}
				}

				go func() {
					<-c.Done()
					handler.Close()
					logStore.Close()
				}()
				return nil
			}),
		)

	})
}
