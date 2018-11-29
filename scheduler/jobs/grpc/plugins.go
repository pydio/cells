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
	"path"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	proto "github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/scheduler/jobs"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS),
			service.Tag(common.SERVICE_TAG_SCHEDULER),
			service.Description("Store for scheduler jobs description"),
			service.Unique(true),
			service.WithMicro(func(m micro.Service) error {
				serviceDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_JOBS)
				if e != nil {
					return e
				}
				store, err := jobs.NewBoltStore(path.Join(serviceDir, "jobs.db"))
				if err != nil {
					return err
				}
				handler := &JobsHandler{
					store: store,
				}
				proto.RegisterJobServiceHandler(m.Options().Server, handler)

				m.Init(
					micro.BeforeStop(func() error {
						store.Close()
						return nil
					}),
					micro.AfterStart(func() error {
						for _, j := range getDefaultJobs() {
							handler.PutJob(m.Options().Context, &proto.PutJobRequest{Job: j}, &proto.PutJobResponse{})
						}
						// Clean tasks stuck in "Running" status
						handler.CleanStuckTasks(m.Options().Context)
						return nil
					}),
				)

				return nil
			}),
		)

	})
}
