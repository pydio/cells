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

// Package grpc is a pydio service running synchronization between objects and index.
package grpc

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/object"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	protoservice "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/data/source/sync"
	synccommon "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	synctask "github.com/pydio/cells/data/source/sync/lib/task"
)

var (
	syncConfig *object.DataSource
)

func init() {

	for _, v := range config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC, "sources").StringSlice([]string{}) {

		datasource := v

		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+datasource),
			service.Tag(common.SERVICE_TAG_DATASOURCE),
			service.Description("Synchronization service between objects and index for a given datasource"),
			service.WithMicro(func(m micro.Service) error {

				m.Init(micro.AfterStart(func() error {

					ctx := m.Options().Context

					// The current call is triggered inside a BeforeStart, thus we don't
					// have the full config yet.
					if err := servicecontext.ScanConfig(ctx, &syncConfig); err != nil {
						return err
					}

					// Making sure index is started
					service.Retry(func() error {
						log.Logger(ctx).Debug("Sync " + datasource + " - Try to contact Index")
						c := protoservice.NewServiceClient(registry.GetClient(common.SERVICE_DATA_INDEX_ + datasource))
						r, err := c.Status(context.Background(), &empty.Empty{})
						if err != nil {
							return err
						}

						if !r.GetOK() {
							log.Logger(ctx).Info(common.SERVICE_DATA_INDEX_ + datasource + " not yet available")
							return fmt.Errorf("index not reachable")
						}
						return nil
					}, 3*time.Second, 50*time.Second)

					var minioConfig *object.MinioConfig
					service.Retry(func() error {
						log.Logger(ctx).Debug("Sync " + datasource + " - Try to contact Objects")
						cli := object.NewObjectsEndpointClient(registry.GetClient(common.SERVICE_DATA_OBJECTS_ + syncConfig.ObjectsServiceName))
						resp, err := cli.GetMinioConfig(ctx, &object.GetMinioConfigRequest{})
						if err != nil {
							log.Logger(ctx).Debug(common.SERVICE_DATA_OBJECTS_ + syncConfig.ObjectsServiceName + " not yet available")
							return err
						}
						minioConfig = resp.MinioConfig
						return nil
					}, 3*time.Second, 50*time.Second)

					if minioConfig == nil {
						return fmt.Errorf("objects not reachable")
					}

					var source synccommon.PathSyncTarget
					if syncConfig.Watch {
						return fmt.Errorf("datasource watch is not implemented yet")
					} else {
						s3client, errs3 := endpoints.NewS3Client(ctx,
							minioConfig.BuildUrl(), minioConfig.ApiKey, minioConfig.ApiSecret, syncConfig.ObjectsBucket, syncConfig.ObjectsBaseFolder)
						if errs3 != nil {
							return errs3
						}
						normalizeS3, _ := strconv.ParseBool(syncConfig.StorageConfiguration["normalize"])
						if normalizeS3 {
							s3client.ServerRequiresNormalization = true
						}
						source = s3client
					}

					indexClientWrite := tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX_+datasource, m.Client())
					indexClientRead := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX_+datasource, m.Client())
					sessionClient := tree.NewSessionIndexerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX_+datasource, m.Client())

					target := sync.NewIndexEndpoint(datasource, indexClientRead, indexClientWrite, sessionClient)

					syncTask := synctask.NewSync(ctx, source, target)
					syncTask.Direction = "left"

					syncHandler := &Handler{
						S3client:     source,
						IndexClient:  indexClientRead,
						SyncTask:     syncTask,
						SyncConfig:   syncConfig,
						ObjectConfig: minioConfig,
					}
					tree.RegisterNodeProviderHandler(m.Server(), syncHandler)
					tree.RegisterNodeReceiverHandler(m.Server(), syncHandler)
					protosync.RegisterSyncEndpointHandler(m.Server(), syncHandler)
					object.RegisterDataSourceEndpointHandler(m.Server(), syncHandler)
					object.RegisterResourceCleanerEndpointHandler(m.Options().Server, syncHandler)

					syncTask.Start(ctx)

					md := make(map[string]string)
					md[common.PYDIO_CONTEXT_USER_KEY] = common.PYDIO_SYSTEM_USERNAME
					ctx = metadata.NewContext(ctx, md)
					// Now post a job to start indexation in background
					jobsClient := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
					if resp, err := jobsClient.GetJob(ctx, &jobs.GetJobRequest{JobID: "resync-ds-" + datasource}); err == nil && resp.Job != nil {
						log.Logger(ctx).Info("Sending event to start datasource resync")
						client.Publish(ctx, client.NewPublication(common.TOPIC_TIMER_EVENT, &jobs.JobTriggerEvent{
							JobID:  "resync-ds-" + datasource,
							RunNow: true,
						}))
					} else {
						log.Logger(ctx).Info("Create job to start datasource resync")
						job := &jobs.Job{
							ID:             "resync-ds-" + datasource,
							Owner:          common.PYDIO_SYSTEM_USERNAME,
							Label:          "Sync DataSource " + datasource,
							Inactive:       false,
							MaxConcurrency: 1,
							AutoStart:      true,
							Actions: []*jobs.Action{
								{
									ID: "actions.cmd.resync",
									Parameters: map[string]string{
										"service": common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_SYNC_ + datasource,
									},
								},
							},
						}

						_, e := jobsClient.PutJob(ctx, &jobs.PutJobRequest{
							Job: job,
						})
						return e
					}

					return nil
				}))

				return nil
			}),
		)
	}
}
