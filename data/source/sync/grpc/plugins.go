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

// Package grpc is a pydio service running synchronization between objects and index.
package grpc

import (
	"context"

	"github.com/pydio/cells/v4/data/source/sync"

	"github.com/pydio/cells/v4/common/broker"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/object"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var (
	syncHandler *Handler
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		sources := config.SourceNamesForDataServices(common.ServiceDataSync)
		dss := config.ListSourcesFromConfig()

		for _, datasource := range sources {
			dsObject, ok := dss[datasource]
			if !ok {
				log.Error("Could not find datasource in config ", zap.String("datasource", datasource))
				continue
			}

			newService(ctx, dsObject)
			continue

		}
	})
}

func newService(ctx context.Context, dsObject *object.DataSource) {
	datasource := dsObject.Name
	var sOptions []service.ServiceOption
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + datasource
	sOptions = append(sOptions,
		service.Name(srvName),
		service.Context(ctx),
		service.Tag(common.ServiceTagDatasource),
		service.Description("Synchronization service between objects and index for a given datasource"),
		service.Source(datasource),
		service.Fork(true),
		service.Unique(true),
		service.AutoStart(false),
		service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
			_ = broker.SubscribeCancellable(ctx, common.TopicIndexEvent, func(message broker.Message) error {
				if syncHandler == nil {
					return nil
				}
				event := &tree.IndexEvent{}
				if _, e := message.Unmarshal(event); e == nil {
					if event.SessionForceClose != "" {
						syncHandler.BroadcastCloseSession(event.SessionForceClose)
					}
					if event.ErrorDetected && event.DataSourceName == syncHandler.dsName {
						syncHandler.NotifyError(event.ErrorPath)
					}
				}
				return nil

			})

			var e error
			syncHandler, e = NewHandler(ctx, srvName, datasource)
			if e != nil {
				return e
			}

			tree.RegisterNodeProviderEnhancedServer(srv, syncHandler)
			tree.RegisterNodeReceiverEnhancedServer(srv, syncHandler)
			protosync.RegisterSyncEndpointEnhancedServer(srv, syncHandler)
			object.RegisterDataSourceEndpointEnhancedServer(srv, syncHandler)
			object.RegisterResourceCleanerEndpointEnhancedServer(srv, syncHandler)

			go func() error {

				if e := syncHandler.Init(); e != nil {
					return e
				}

				md := make(map[string]string)
				md[common.PydioContextUserKey] = common.PydioSystemUsername
				jobCtx := metadata.NewContext(ctx, md)
				// jobsClient := jobs.NewJobServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceJobs, grpc2.WithCallTimeout(grpc2.CallTimeoutShort)))
				jobsClient := jobs.NewJobServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceJobs))
				serviceName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + datasource

				if !dsObject.FlatStorage {
					syncHandler.Start()

					// e = std.Retry(jobCtx, func() error {
					if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "resync-ds-" + datasource}); err == nil {
						if !dsObject.SkipSyncOnRestart {
							log.Logger(jobCtx).Debug("Sending event to start trigger re-indexation")
							broker.MustPublish(jobCtx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
								JobID:  "resync-ds-" + datasource,
								RunNow: true,
							})
						}
					} else if errors.FromError(err).Code == 404 {
						log.Logger(jobCtx).Info("Creating job in scheduler to trigger re-indexation")
						job := getJobDefinition(datasource, serviceName, false, !dsObject.SkipSyncOnRestart)
						_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
							Job: job,
						})
						return e
					} else {
						log.Logger(jobCtx).Debug("Could not get info about job, retrying...")
						return err
					}
					return nil
					// }, 5*time.Second, 30*time.Second)
					if e != nil {
						log.Logger(jobCtx).Error("service started but could not contact Job service to trigger re-indexation")
					}
				} else {
					syncHandler.StartConfigsOnly()

					var clearConfigKey string

					// Create an authenticated context for sync operations if any
					bg := context.Background()
					bg = metadata.WithUserNameMetadata(bg, common.PydioSystemUsername)
					bg = servicecontext.WithServiceName(bg, servicecontext.GetServiceName(ctx))

					if _, has := dsObject.StorageConfiguration[object.StorageKeyInitFromBucket]; has {
						if _, e := syncHandler.FlatScanEmpty(bg, nil, nil); e != nil {
							log.Logger(ctx).Warn("Could not scan storage bucket after start", zap.Error(e))
						} else {
							clearConfigKey = object.StorageKeyInitFromBucket
						}
					} else if snapKey, has := dsObject.StorageConfiguration[object.StorageKeyInitFromSnapshot]; has {
						if _, e := syncHandler.FlatSyncSnapshot(bg, "read", snapKey, nil, nil); e != nil {
							log.Logger(ctx).Warn("Could not init index from stored snapshot after start", zap.Error(e))
						} else {
							clearConfigKey = object.StorageKeyInitFromSnapshot
						}
					}
					if clearConfigKey != "" {
						// Now save config without "initFromBucket" key
						newValue := proto.Clone(dsObject).(*object.DataSource)
						delete(newValue.StorageConfiguration, clearConfigKey)
						if ce := config.Set(newValue.StorageConfiguration, "services", serviceName, "StorageConfiguration"); ce != nil {
							log.Logger(jobCtx).Error("[initFromBucket] Removing "+clearConfigKey+" key from datasource", zap.Error(ce))
						} else {
							log.Logger(jobCtx).Info("[initFromBucket] Removed "+clearConfigKey+" key from datasource", zap.Any("ds", newValue.StorageConfiguration))
						}

						if err := config.Save("system", "Removing "+clearConfigKey+" key from datasource "+serviceName); err != nil {
							log.Logger(jobCtx).Error("[initFromBucket] Saving "+clearConfigKey+" key removal from datasource", zap.Error(err))
						}
					}

					// Post a job to dump snapshot manually (Flat, non-internal only)
					if !dsObject.IsInternal() {
						//e = std.Retry(jobCtx, func() error {
						if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "snapshot-" + datasource}); err != nil {
							if errors.FromError(err).Code == 404 {
								log.Logger(jobCtx).Info("Creating job in scheduler to dump snapshot for " + datasource)
								job := getJobDefinition(datasource, serviceName, true, false)
								_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
									Job: job,
								})
								return e
							} else {
								log.Logger(jobCtx).Info("Could not get info about job, retrying...", zap.Error(err))
								return err
							}
						}
						return nil
						// }, 2*time.Second, 5*time.Second)
						if e != nil {
							log.Logger(jobCtx).Warn("service started but could not contact Job service insert snapshot dump")
						}
					}
				}

				return nil
			}()

			return nil
		}),
	)

	if storage := WithStorage(datasource); storage != nil {
		sOptions = append(sOptions, storage)
	}
	service.NewService(sOptions...)

}

func WithStorage(source string) service.ServiceOption {
	mapperType := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source, "StorageConfiguration", "checksumMapper").String()
	switch mapperType {
	case "dao":
		return service.WithStorage(sync.NewDAO, service.WithStoragePrefix("data_sync_"+source))
	}
	return nil
}

func getJobDefinition(dsName, serviceName string, flat, autoStart bool) *jobs.Job {
	if flat {
		return &jobs.Job{
			ID:             "snapshot-" + dsName,
			Owner:          common.PydioSystemUsername,
			Label:          "Snapshot DB index for Datasource " + dsName,
			MaxConcurrency: 1,
			AutoStart:      autoStart,
			Actions: []*jobs.Action{
				{
					ID:    "actions.cmd.resync",
					Label: "Dump Snapshot",
					Parameters: map[string]string{
						"service": serviceName,
						"path":    "write/snapshot.db",
					},
				},
			},
		}

	} else {

		return &jobs.Job{
			ID:             "resync-ds-" + dsName,
			Owner:          common.PydioSystemUsername,
			Label:          "Sync DataSource " + dsName,
			Inactive:       false,
			MaxConcurrency: 1,
			AutoStart:      autoStart,
			Actions: []*jobs.Action{
				{
					ID: "actions.cmd.resync",
					Parameters: map[string]string{
						"service": serviceName,
					},
				},
			},
		}
	}

}
