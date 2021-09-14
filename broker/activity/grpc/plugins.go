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

	"github.com/pydio/cells/common/registry"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro"

	"github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	serviceproto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/common/utils/meta"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceActivity
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Activity Service is collecting activity for users and nodes"),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceJobs, []string{}),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceTree, []string{}),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            RegisterDigestJob,
				},
			}),
			service.WithStorage(activity.NewDAO, "broker_activity"),
			service.Unique(true),
			service.WithMicro(func(m micro.Service) error {
				service.AddMicroMeta(m, meta.ServiceMetaProvider, "stream")

				dao := servicecontext.GetDAO(m.Options().Context).(activity.DAO)
				// Register Subscribers
				subscriber := NewEventsSubscriber(dao)
				s := m.Options().Server
				batcher := cache.NewEventsBatcher(m.Options().Context, 3*time.Second, 20*time.Second, 2000, func(ctx context.Context, msg *tree.NodeChangeEvent) {
					subscriber.HandleNodeChange(ctx, msg)
				})
				m.Init(micro.BeforeStop(func() error {
					batcher.Stop()
					return nil
				}))
				if err := s.Subscribe(s.NewSubscriber(common.TopicTreeChanges, func(ctx context.Context, msg *tree.NodeChangeEvent) error {
					// Always ignore events on Temporary nodes and internal nodes
					if msg.Target != nil && (msg.Target.Etag == common.NodeFlagEtagTemporary || msg.Target.HasMetaKey(common.MetaNamespaceDatasourceInternal)) {
						return nil
					}
					if msg.Source != nil && msg.Source.HasMetaKey(common.MetaNamespaceDatasourceInternal) {
						return nil
					}
					if msg.Optimistic {
						return nil
					}
					batcher.Events <- &cache.EventWithContext{NodeChangeEvent: *msg, Ctx: ctx}
					return nil
				})); err != nil {
					return err
				}
				if err := s.Subscribe(s.NewSubscriber(common.TopicMetaChanges, func(ctx context.Context, msg *tree.NodeChangeEvent) error {
					if msg.Optimistic || msg.Type != tree.NodeChangeEvent_UPDATE_USER_META {
						return nil
					}
					batcher.Events <- &cache.EventWithContext{NodeChangeEvent: *msg, Ctx: ctx}
					return nil
				})); err != nil {
					return err
				}

				if err := s.Subscribe(s.NewSubscriber(common.TopicIdmEvent, func(ctx context.Context, msg *idm.ChangeEvent) error {
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
	// Build queries for standard users
	q1, _ := ptypes.MarshalAny(&idm.UserSingleQuery{NodeType: idm.NodeType_USER})
	q2, _ := ptypes.MarshalAny(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeAnyValue: true, Not: true})
	job := &jobs.Job{
		ID:             "users-activity-digest",
		Label:          "Users activities digest",
		Owner:          common.PydioSystemUsername,
		MaxConcurrency: 1,
		AutoStart:      false,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT15M", // every 5 mn
		},
		Actions: []*jobs.Action{
			{
				ID: "broker.activity.actions.mail-digest",
				UsersSelector: &jobs.UsersSelector{
					Label: "All users except hidden",
					Query: &serviceproto.Query{
						SubQueries: []*any.Any{q1, q2},
						Operation:  serviceproto.OperationType_AND,
					},
				},
			},
		},
	}

	return service.Retry(ctx, func() error {
		cliJob := jobs.NewJobServiceClient(common.ServiceGrpcNamespace_+common.ServiceJobs, defaults.NewClient())
		_, e := cliJob.PutJob(ctx, &jobs.PutJobRequest{Job: job}, registry.ShortRequestTimeout())
		return e
	}, 5*time.Second, 20*time.Second)

}
