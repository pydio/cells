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
package service

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	broker_log "github.com/pydio/cells/v5/broker/log"
	"github.com/pydio/cells/v5/common"
	proto "github.com/pydio/cells/v5/common/proto/jobs"
	log2 "github.com/pydio/cells/v5/common/proto/log"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/jobs"
	grpc3 "github.com/pydio/cells/v5/scheduler/jobs/grpc"
)

const Name = common.ServiceGrpcNamespace_ + common.ServiceJobs

func init() {
	defaults := grpc3.GetDefaultJobs()
	for _, j := range defaults {
		proto.RegisterDefault(j, Name)
	}

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Store for scheduler jobs description"),
			service.WithNamedStorageDrivers("main", jobs.Drivers),
			service.WithNamedStorageDrivers("logs", broker_log.Drivers),
			service.WithStorageMigrator(jobs.Migrate),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up:            InitDefaults,
				},
				{
					TargetVersion: service.ValidVersion("1.4.0"),
					Up:            Migration140,
				},
				{
					TargetVersion: service.ValidVersion("1.5.0"),
					Up:            Migration150,
				},
				{
					TargetVersion: service.ValidVersion("2.2.99"),
					Up:            Migration230,
				},
			}),
			service.WithGRPCStop(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				return nil
			}),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				handler := grpc3.NewJobsHandler(ctx, Name)
				// Used by the upper-level logcore.Handler to resolve the storage driver
				handler.ResolveOptions = append(handler.ResolveOptions, manager.WithName("logs"))

				proto.RegisterJobServiceServer(server, handler)
				log2.RegisterLogRecorderServer(server, handler)
				sync.RegisterSyncEndpointServer(server, handler)

				// TODO - should be in migrations directly (multi context handled)
				/*
					autoStarts := make(map[context.Context][]*proto.Job)
					ctx = runtime.WithServiceName(ctx, common.ServiceJobsGRPC)
					logger := log3.Logger(ctx)

					// We should wait for service task to be started, then start jobs
					var hc grpc2.HealthMonitor
					if len(autoStarts) > 0 {
						hc = grpc2.NewHealthChecker(ctx)
						go func() {
							hc.Monitor(common.ServiceGrpcNamespace_ + common.ServiceTasks)
							for tc, jj := range autoStarts {
								for _, j := range jj {
									logger.Info("Sending a start event for job '" + j.Label + "'")
									_ = broker.Publish(tc, common.TopicTimerEvent, &proto.JobTriggerEvent{
										JobID:  j.ID,
										RunNow: true,
									})
								}
							}
						}()
					}

					go func() {
						<-ctx.Done()
						handler.Close()
						if hc != nil {
							hc.Stop()
						}
					}()
				*/
				return nil
			}),
		)
	})
}

func InitDefaults(ctx context.Context) error {
	handler := grpc3.NewJobsHandler(ctx, Name)
	logger := log.Logger(ctx)
	for _, j := range grpc3.GetDefaultJobs() {
		if _, e := handler.GetJob(ctx, &proto.GetJobRequest{JobID: j.ID}); e != nil {
			_, _ = handler.PutJob(ctx, &proto.PutJobRequest{Job: j})
		}
	}

	// Clean tasks stuck in "Running" status
	if _, er := handler.CleanStuckTasks(ctx, true, logger); er != nil {
		logger.Warn("Could not run CleanStuckTasks: "+er.Error(), zap.Error(er))
	}

	// Clean user-jobs (AutoStart+AutoClean) without any tasks
	if er := handler.CleanDeadUserJobs(ctx); er != nil {
		logger.Warn("Could not run CleanDeadUserJobs: "+er.Error(), zap.Error(er))
	}

	return nil
}

func Migration140(ctx context.Context) error {
	handler := grpc3.NewJobsHandler(ctx, Name)
	logger := log.Logger(ctx)

	if resp, e := handler.DeleteTasks(ctx, &proto.DeleteTasksRequest{
		JobId:      "users-activity-digest",
		Status:     []proto.TaskStatus{proto.TaskStatus_Any},
		PruneLimit: 1,
	}); e == nil {
		logger.Info("Migration 1.4.0: removed tasks on job users-activity-digest that could fill up the scheduler", zap.Int("number", len(resp.Deleted)))
	} else {
		logger.Error("Error while trying to prune tasks for job users-activity-digest", zap.Error(e))
	}
	if resp, e := handler.DeleteTasks(ctx, &proto.DeleteTasksRequest{
		JobId:      "resync-changes-job",
		Status:     []proto.TaskStatus{proto.TaskStatus_Any},
		PruneLimit: 1,
	}); e == nil {
		logger.Info("Migration 1.4.0: removed tasks on job resync-changes-job that could fill up the scheduler", zap.Int("number", len(resp.Deleted)))
	} else {
		logger.Error("Error while trying to prune tasks for job resync-changes-job", zap.Error(e))
	}

	return nil
}

func Migration150(ctx context.Context) error {
	handler := grpc3.NewJobsHandler(ctx, Name)
	logger := log.Logger(ctx)

	// Remove archive-changes-job
	if _, e := handler.DeleteJob(ctx, &proto.DeleteJobRequest{JobID: "archive-changes-job"}); e != nil {
		logger.Error("Could not remove archive-changes-job", zap.Error(e))
	} else {
		logger.Info("[Migration] Removed archive-changes-job")
	}
	// Remove resync-changes-job
	if _, e := handler.DeleteJob(ctx, &proto.DeleteJobRequest{JobID: "resync-changes-job"}); e != nil {
		logger.Error("Could not remove resync-changes-job", zap.Error(e))
	} else {
		logger.Info("[Migration] Removed resync-changes-job")
	}

	return nil
}

func Migration230(ctx context.Context) error {
	handler := grpc3.NewJobsHandler(ctx, Name)
	logger := log.Logger(ctx)

	// Remove clean thumbs job and re-insert thumbs job
	if _, e := handler.DeleteJob(ctx, &proto.DeleteJobRequest{JobID: "clean-thumbs-job"}); e != nil {
		logger.Error("Could not remove clean-thumbs-job", zap.Error(e))
	} else {
		logger.Info("[Migration] Removed clean-thumbs-job")
	}

	for _, j := range grpc3.GetDefaultJobs() {
		// Force re-adding thumbs job
		if j.ID == "thumbs-job" {
			_, _ = handler.PutJob(ctx, &proto.PutJobRequest{Job: j})
		}
	}

	return nil
}
