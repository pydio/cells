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

// Package grpc is the persistence service for all activities.
//
// It is listening to many events broadcasted by the application and storing them inside associated feeds, depending
// on the event context, owner, object type, etc...
// Persistence is implemented on a Bolt database.
package grpc

import (
	"context"
	"path/filepath"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/meta"
	acproto "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	serviceproto "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/queue"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceActivity
)

func init() {
	jobs.RegisterDefault(digestJob(), Name)

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
					Up:            registerDigestJob,
				},
			}),
			service.WithStorage(activity.NewDAO,
				service.WithStoragePrefix("activity"),
				service.WithStorageSupport(boltdb.Driver, mongodb.Driver),
				service.WithStorageMigrator(activity.Migrate),
				service.WithStorageDefaultDriver(func() (string, string) {
					return boltdb.Driver, filepath.Join(runtime.MustServiceDataDir(Name), "activities.db")
				}),
			),
			service.WithGRPC(func(c context.Context, srv grpc.ServiceRegistrar) error {

				d := servicecontext.GetDAO(c).(activity.DAO)
				// Register Subscribers
				subscriber := NewEventsSubscriber(c, d)
				// Start fifo - it is stopped by c.Done()
				fifo, er := queue.OpenQueue(c, runtime.PersistingQueueURL("serviceName", common.ServiceGrpcNamespace_+common.ServiceActivity, "name", "changes"))
				if er != nil {
					return er
				}
				counterName := broker.WithCounterName("activity")

				processOneWithTimeout := func(ct context.Context, event *tree.NodeChangeEvent) error {
					var ca context.CancelFunc
					ctx, ca = context.WithTimeout(runtimecontext.ForkContext(ct, c), 10*time.Second)
					defer ca()
					return subscriber.HandleNodeChange(ctx, event)
				}

				if e := broker.SubscribeCancellable(c, common.TopicTreeChanges, func(message broker.Message) error {
					md, bb := message.RawData()
					msg := &tree.NodeChangeEvent{}
					if e := proto.Unmarshal(bb, msg); e == nil {
						if msg.Target != nil && (msg.Target.Etag == common.NodeFlagEtagTemporary || msg.Target.HasMetaKey(common.MetaNamespaceDatasourceInternal)) {
							return nil
						}
						if msg.Source != nil && msg.Source.HasMetaKey(common.MetaNamespaceDatasourceInternal) {
							return nil
						}
						if msg.Optimistic {
							return nil
						}
						return processOneWithTimeout(metadata.NewContext(c, md), msg)
					}
					return nil
				}, broker.WithLocalQueue(fifo), counterName); e != nil {
					return e
				}

				if e := broker.SubscribeCancellable(c, common.TopicMetaChanges, func(message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ctx, e := message.Unmarshal(msg); e == nil {
						if msg.Optimistic || msg.Type != tree.NodeChangeEvent_UPDATE_USER_META {
							return nil
						}
						return processOneWithTimeout(ctx, msg)
					}
					return nil
				}, counterName); e != nil {
					return e
				}

				if e := broker.SubscribeCancellable(c, common.TopicIdmEvent, func(message broker.Message) error {
					msg := &idm.ChangeEvent{}
					if ctx, e := message.Unmarshal(msg); e == nil {
						return subscriber.HandleIdmChange(ctx, msg)
					}
					return nil
				}, counterName); e != nil {
					return e
				}

				acproto.RegisterActivityServiceEnhancedServer(srv, &Handler{RuntimeCtx: ctx, dao: d})
				tree.RegisterNodeProviderStreamerEnhancedServer(srv, &MetaProvider{RuntimeCtx: ctx, dao: d})

				return nil
			}),
		)
	})
}

func digestJob() *jobs.Job {
	// Build queries for standard users
	q1, _ := anypb.New(&idm.UserSingleQuery{NodeType: idm.NodeType_USER})
	q2, _ := anypb.New(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeAnyValue: true, Not: true})
	return &jobs.Job{
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
						SubQueries: []*anypb.Any{q1, q2},
						Operation:  serviceproto.OperationType_AND,
					},
				},
			},
		},
	}

}

func registerDigestJob(ctx context.Context) error {

	log.Logger(ctx).Info("Registering default job for creating activities digests")
	cliJob := jobs.NewJobServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceJobs))
	if _, err := cliJob.PutJob(ctx, &jobs.PutJobRequest{Job: digestJob()}); err != nil {
		return err
	}

	return nil
}
