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

// Package service is the GRPC persistence service for all activities.
//
// It is listening to many events broadcasted by the application and storing them inside associated feeds, depending
// on the event context, owner, object type, etc...
// Persistence is implemented on a Bolt database.
package service

import (
	"context"
	"time"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/broker/activity"
	"github.com/pydio/cells/v5/broker/activity/actions"
	grpc2 "github.com/pydio/cells/v5/broker/activity/grpc"
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/nodes/meta"
	acproto "github.com/pydio/cells/v5/common/proto/activity"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceActivity
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Activity Service is collecting activity for users and nodes"),
			service.Metadata(meta.ServiceMetaProvider, "stream"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            manager.StorageMigration(),
				},
				{
					TargetVersion: service.FirstRun(),
					Up:            actions.RegisterDigestJob,
				},
			}),
			service.WithStorageDrivers(activity.Drivers...),
			service.WithStorageMigrator(activity.Migrate),
			service.WithGRPC(func(c context.Context, srv grpc.ServiceRegistrar) error {

				// Register Subscribers
				subscriber := grpc2.NewEventsSubscriber(c, Name)
				counterName := broker.WithCounterName("activity")
				opts := []broker.SubscribeOption{counterName}
				idmOpts := []broker.SubscribeOption{counterName}
				var mgr manager.Manager
				if propagator.Get(c, manager.ContextKey, &mgr) {
					if d, e := mgr.GetQueuePool(common.QueueTypePersistent); e == nil {
						opts = append(opts, broker.WithAsyncQueuePool(d, map[string]interface{}{"name": "treeChanges"}))
						// TODO - USED FOR TESTING QUEUING ON IDM EVENTS
						//idmOpts = append(idmOpts, broker.WithAsyncQueuePool(d, map[string]interface{}{"name": "idmChanges"}))
					}
				}

				processOneWithTimeout := func(ct context.Context, event *tree.NodeChangeEvent) error {
					var ca context.CancelFunc
					ctx, ca = context.WithTimeout(propagator.ForkContext(ct, c), 10*time.Second)
					defer ca()
					return subscriber.HandleNodeChange(ctx, event)
				}

				if e := broker.SubscribeCancellable(c, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					var e error
					if ctx, e = message.Unmarshal(ctx, msg); e == nil {
						if msg.Target != nil && (msg.Target.Etag == common.NodeFlagEtagTemporary || msg.Target.HasMetaKey(common.MetaNamespaceDatasourceInternal)) {
							return nil
						}
						if msg.Source != nil && msg.Source.HasMetaKey(common.MetaNamespaceDatasourceInternal) {
							return nil
						}
						if msg.Optimistic {
							return nil
						}
						return processOneWithTimeout(ctx, msg)
					}
					return nil
				}, opts...); e != nil {
					return e
				}

				if e := broker.SubscribeCancellable(c, common.TopicMetaChanges, func(ctx context.Context, message broker.Message) error {
					var e error
					msg := &tree.NodeChangeEvent{}
					if ctx, e = message.Unmarshal(ctx, msg); e == nil {
						if msg.Optimistic || msg.Type != tree.NodeChangeEvent_UPDATE_USER_META {
							return nil
						}
						return processOneWithTimeout(ctx, msg)
					}
					return nil
				}, counterName); e != nil {
					return e
				}

				if e := broker.SubscribeCancellable(c, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					msg := &idm.ChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, msg); e == nil {
						return subscriber.HandleIdmChange(ctx, msg)
					}
					return nil
				}, idmOpts...); e != nil {
					return e
				}

				acproto.RegisterActivityServiceServer(srv, &grpc2.Handler{})
				tree.RegisterNodeProviderStreamerServer(srv, &grpc2.MetaProvider{})

				return nil
			}),
		)
	})
}
