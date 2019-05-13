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
	"time"

	"github.com/golang/protobuf/ptypes/empty"
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
	protoservice "github.com/pydio/cells/common/service/proto"
)

var (
	syncHandler *Handler
)

func init() {

	plugins.Register(func() {

		sources := config.SourceNamesForDataServices(common.SERVICE_DATA_SYNC)

		for _, datasource := range sources {

			service.NewService(
				service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+datasource),
				service.Tag(common.SERVICE_TAG_DATASOURCE),
				service.Description("Synchronization service between objects and index for a given datasource"),
				service.Source(datasource),
				service.Fork(true),
				service.Unique(true),
				service.AutoStart(false),
				service.WithMicro(func(m micro.Service) error {

					m.Server().Subscribe(m.Server().NewSubscriber(common.TOPIC_INDEX_EVENT, func(ctx context.Context, msg *tree.IndexEvent) error {
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

					m.Init(micro.AfterStart(func() error {

						s := m.Options().Server
						ctx := m.Options().Context
						datasource := s.Options().Metadata["source"]
						if datasource == "" {
							return fmt.Errorf("could not find source key in service Metadata")
						}

						// Making sure index is started
						service.Retry(func() error {
							log.Logger(ctx).Debug("Sync " + datasource + " - Try to contact Index")
							c := protoservice.NewService(registry.GetClient(common.SERVICE_DATA_INDEX_ + datasource))
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

						syncHandler.Start()

						// Now post a job to start indexation in background
						md := make(map[string]string)
						md[common.PYDIO_CONTEXT_USER_KEY] = common.PYDIO_SYSTEM_USERNAME
						ctx = metadata.NewContext(ctx, md)
						e = service.Retry(func() error {
							jobsClient := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
							if _, err := jobsClient.GetJob(ctx, &jobs.GetJobRequest{JobID: "resync-ds-" + datasource}); err == nil {
								log.Logger(ctx).Debug("Sending event to start trigger re-indexation")
								client.Publish(ctx, client.NewPublication(common.TOPIC_TIMER_EVENT, &jobs.JobTriggerEvent{
									JobID:  "resync-ds-" + datasource,
									RunNow: true,
								}))
							} else if errors.Parse(err.Error()).Code == 404 {
								log.Logger(ctx).Info("Creating job in scheduler to trigger re-indexation")
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
							} else {
								log.Logger(ctx).Debug("Could not get info about job, retrying...")
								return err
							}
							return nil
						}, 5*time.Second)
						if e != nil {
							log.Logger(ctx).Error("service started but could not contact Job service to trigger re-indexation")
						}
						return nil
					}))

					m.Init(micro.BeforeStop(func() error {
						if syncHandler != nil {
							ctx := m.Options().Context
							log.Logger(ctx).Info("Stopping sync task and registry watch")
							syncHandler.Stop()
						}
						return nil
					}))

					return nil
				}),
			)
		}
	})
}
