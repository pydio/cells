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

// Package grpc is the persistence service for all activities.
//
// It is listening to many events broadcasted by the application and storing them inside associated feeds, depending
// on the event context, owner, object type, etc...
// Persistence is implemented on a Bolt database.
package grpc

import (
	"context"
	"time"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
)

var (
	Name = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(Name),
			service.Tag(common.SERVICE_TAG_BROKER),
			service.Description("Activity Service is collecting activity for users and nodes"),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, []string{}),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            RegisterDigestJob,
				},
			}),
			service.WithStorage(activity.NewDAO, "broker_activity"),
			service.Unique(true),
			service.WithMicro(func(m micro.Service) error {
				m.Init(
					micro.Metadata(map[string]string{"MetaProvider": "stream"}),
				)
				dao := servicecontext.GetDAO(m.Options().Context).(activity.DAO)
				// Register Subscribers
				subscriber := NewEventsSubscriber(dao)
				s := m.Options().Server
				if err := s.Subscribe(s.NewSubscriber(common.TOPIC_TREE_CHANGES, func(ctx context.Context, msg *tree.NodeChangeEvent) error {
					return subscriber.HandleNodeChange(ctx, msg)
				})); err != nil {
					return err
				}

				if err := s.Subscribe(s.NewSubscriber(common.TOPIC_IDM_EVENT, func(ctx context.Context, msg *idm.ChangeEvent) error {
					return subscriber.HandleIdmChange(ctx, msg)
				})); err != nil {
					return err
				}

				proto.RegisterActivityServiceHandler(m.Options().Server, new(Handler))
				tree.RegisterNodeProviderStreamerHandler(m.Options().Server, new(MetaProvider))

				return nil
			}),
		)
	})
}

func RegisterDigestJob(ctx context.Context) error {

	log.Logger(ctx).Info("Registering default job for creating activities digests")
	job := &jobs.Job{
		ID:             "users-activity-digest",
		Label:          "Users activities digest",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		MaxConcurrency: 1,
		AutoStart:      false,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT15M", // every 5 mn
		},
		Actions: []*jobs.Action{
			{
				ID: "broker.activity.actions.mail-digest",
				UsersSelector: &jobs.UsersSelector{
					All: true,
				},
			},
		},
	}

	return service.Retry(func() error {
		cliJob := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
		_, e := cliJob.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return e
	}, 5*time.Second, 20*time.Second)

}
