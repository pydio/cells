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
	"fmt"
	"time"

	servicecontext "github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"

	"go.uber.org/zap"

	"github.com/golang/protobuf/proto"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/object"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/source/sync"
)

var (
	syncHandler *Handler
)

func init() {

	plugins.Register("main", func(ctx context.Context) {

		sources := config.SourceNamesForDataServices(common.ServiceDataSync)
		dss := config.ListSourcesFromConfig()

		for _, datasource := range sources {

			var sOptions []service.ServiceOption
			sOptions = append(sOptions,
				service.Name(common.ServiceGrpcNamespace_+common.ServiceDataSync_+datasource),
				service.Context(ctx),
				service.Tag(common.ServiceTagDatasource),
				service.Description("Synchronization service between objects and index for a given datasource"),
				service.Source(datasource),
				service.Fork(true),
				service.Unique(true),
				service.AutoStart(false),
				service.WithMicro(func(m micro.Service) error {
					m.Server().Subscribe(m.Server().NewSubscriber(common.TopicIndexEvent, func(ctx context.Context, msg *tree.IndexEvent) error {
						if syncHandler == nil {
							return nil
						}
						if msg.SessionForceClose != "" {
							syncHandler.BroadcastCloseSession(msg.SessionForceClose)
						}
						if msg.ErrorDetected && msg.DataSourceName == syncHandler.dsName {
							syncHandler.NotifyError(msg.ErrorPath)
						}
						return nil
					}))

					s := m.Server()
					ctx := m.Options().Context
					datasource := s.Options().Metadata["source"]
					if datasource == "" || dss[datasource] == nil {
						return fmt.Errorf("could not find source key in service Metadata")
					}

					var e error
					syncHandler, e = NewHandler(ctx, datasource)
					if e != nil {
						return e
					}

					tree.RegisterNodeProviderHandler(m.Server(), syncHandler)
					tree.RegisterNodeReceiverHandler(m.Server(), syncHandler)
					protosync.RegisterSyncEndpointHandler(m.Server(), syncHandler)
					object.RegisterDataSourceEndpointHandler(m.Server(), syncHandler)
					object.RegisterResourceCleanerEndpointHandler(m.Options().Server, syncHandler)

					dsObject := dss[datasource]

					md := make(map[string]string)
					md[common.PydioContextUserKey] = common.PydioSystemUsername
					jobCtx := metadata.NewContext(ctx, md)
					jobsClient := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
					serviceName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + datasource

					if !dsObject.FlatStorage {
						syncHandler.Start()
						m.Init(
							micro.AfterStart(func() error {
								// Post a job to start indexation in background
								e = service.Retry(jobCtx, func() error {
									if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "resync-ds-" + datasource}); err == nil {
										if !dsObject.SkipSyncOnRestart {
											log.Logger(jobCtx).Debug("Sending event to start trigger re-indexation")
											client.Publish(jobCtx, client.NewPublication(common.TopicTimerEvent, &jobs.JobTriggerEvent{
												JobID:  "resync-ds-" + datasource,
												RunNow: true,
											}))
										}
									} else if errors.Parse(err.Error()).Code == 404 {
										log.Logger(jobCtx).Info("Creating job in scheduler to trigger re-indexation")
										job := getJobDefinition(datasource, serviceName, false, !dsObject.SkipSyncOnRestart)
										_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
											Job: job,
										}, registry.ShortRequestTimeout())
										return e
									} else {
										log.Logger(jobCtx).Debug("Could not get info about job, retrying...")
										return err
									}
									return nil
								}, 5*time.Second, 30*time.Second)
								if e != nil {
									log.Logger(jobCtx).Error("service started but could not contact Job service to trigger re-indexation")
									m.Server().Stop()
								}

								return nil
							}),
							micro.BeforeStop(func() error {
								if syncHandler != nil {
									ctx := m.Options().Context
									log.Logger(ctx).Info("Stopping sync task and registry watch")
									syncHandler.Stop()
								}
								return nil
							}),
						)
					} else {
						syncHandler.StartConfigsOnly()
						m.Init(
							micro.AfterStart(func() error {
								var clearConfigKey string

								// Create an authenticated context for sync operations if any
								bg := context.Background()
								bg = context2.WithUserNameMetadata(bg, common.PydioSystemUsername)
								bg = servicecontext.WithServiceName(bg, servicecontext.GetServiceName(m.Options().Context))

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
								}

								// Post a job to dump snapshot manually (Flat, non-internal only)
								if !dsObject.IsInternal() {
									e = service.Retry(jobCtx, func() error {
										if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "snapshot-" + datasource}); err != nil {
											if errors.Parse(err.Error()).Code == 404 {
												log.Logger(jobCtx).Info("Creating job in scheduler to dump snapshot for " + datasource)
												job := getJobDefinition(datasource, serviceName, true, false)
												_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
													Job: job,
												}, registry.ShortRequestTimeout())
												return e
											} else {
												log.Logger(jobCtx).Debug("Could not get info about job, retrying...")
												return err
											}
										}
										return nil
									}, 5*time.Second, 30*time.Second)
									if e != nil {
										log.Logger(jobCtx).Warn("service started but could not contact Job service insert snapshot dump")
									}
								}

								return nil
							}),
							micro.BeforeStop(func() error {
								if syncHandler != nil {
									ctx := m.Options().Context
									log.Logger(ctx).Info("Stopping configs watch")
									syncHandler.StopConfigsOnly()
								}
								return nil
							}),
						)
					}

					return nil
				}),
			)

			if storage := WithStorage(datasource); storage != nil {
				sOptions = append(sOptions, storage)
			}
			service.NewService(sOptions...)

		}
	})
}

func WithStorage(source string) service.ServiceOption {
	mapperType := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source, "StorageConfiguration", "checksumMapper").String()
	switch mapperType {
	case "dao":
		prefix := "data_sync_" + source
		return service.WithStorage(sync.NewDAO, prefix)
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
