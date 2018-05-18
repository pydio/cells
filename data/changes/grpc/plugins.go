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

package grpc

import (
	"context"
	"time"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/changes"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CHANGES),
		service.Tag(common.SERVICE_TAG_DATA),
		service.Description("Index of nodes changes"),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, []string{}),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, []string{}),
		service.Migrations([]*service.Migration{{
			TargetVersion: service.FirstRun(),
			Up:            RegisterResync,
		}}),
		service.WithStorage(changes.NewDAO, "data_changes"),
		service.WithMicro(func(m micro.Service) error {
			h := &Handler{}
			tree.RegisterSyncChangesHandler(m.Options().Server, h)
			sync.RegisterSyncEndpointHandler(m.Options().Server, h)

			// Register Event Subscriber
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_TREE_CHANGES, h.OnTreeEvent)); err != nil {
				return err
			}

			return nil
		}),
		service.BeforeStop(func(s service.Service) error {
			cancel := s.Options().Cancel

			// NOTE:  though *probably* unnecessary, this ensures `cancel` is always called, thus avoiding a
			//   	  potential resource leak.  Note that this makes golint happy as well.
			cancel()

			return nil
		}),
	)
}

func RegisterResync(ctx context.Context) error {
	return service.Retry(func() error {
		log.Logger(ctx).Info("Installing Default Job for Changes Resync")
		jobsClient := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
		for _, j := range getResyncJobs() {
			jobsClient.PutJob(ctx, &jobs.PutJobRequest{Job: j})
		}
		return nil
	}, 9*time.Second, 30*time.Second)
}

func getResyncJobs() []*jobs.Job {
	return []*jobs.Job{
		{
			ID:             "resync-changes-job",
			Owner:          common.PYDIO_SYSTEM_USERNAME,
			Label:          "Make sure changes are correctly in sync with index",
			Inactive:       false,
			MaxConcurrency: 1,
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R/2012-06-04T19:25:16.828696-03:00/PT60M",
			},
			Actions: []*jobs.Action{{
				ID: "actions.cmd.resync",
				Parameters: map[string]string{
					"service": common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHANGES,
				},
			}},
		},
	}
}
