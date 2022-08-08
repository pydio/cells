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

// Package grpc provides persistence layer for user-defined metadata
package grpc

import (
	"context"

	"github.com/go-sql-driver/mysql"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	meta2 "github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/idm"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/idm/meta"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceUserMeta
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Metadata(meta2.ServiceMetaProvider, "stream"),
			service.Metadata(meta2.ServiceMetaNsProvider, "list"),
			service.Description("User-defined Metadata"),

			service.WithStorage(meta.NewDAO, service.WithStoragePrefix("idm_usr_meta")),
			service.Unique(true),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            defaultMetas,
				},
			}),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				handler, err := NewHandler(ctx, servicecontext.GetDAO(ctx).(meta.DAO))
				if err != nil {
					return err
				}
				idm.RegisterUserMetaServiceEnhancedServer(server, handler)
				tree.RegisterNodeProviderStreamerEnhancedServer(server, handler)

				// Clean role on user deletion
				cleaner := NewCleaner(servicecontext.GetDAO(ctx))
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if ct, e := message.Unmarshal(ev); e == nil {
						return cleaner.Handle(ct, ev)
					}
					return nil
				}); e != nil {
					return e
				}

				return nil
			}),
		)
	})
}

func defaultMetas(ctx context.Context) error {
	log.Logger(ctx).Info("Inserting default namespace for metadata")
	dao := servicecontext.GetDAO(ctx).(meta.DAO)
	err := dao.GetNamespaceDao().Add(&idm.UserMetaNamespace{
		Namespace:      "usermeta-tags",
		Label:          "Tags",
		Indexable:      true,
		JsonDefinition: "{\"type\":\"tags\"}",
		Policies: []*service2.ResourcePolicy{
			{Action: service2.ResourcePolicyAction_READ, Subject: "*", Effect: service2.ResourcePolicy_allow},
			{Action: service2.ResourcePolicyAction_WRITE, Subject: "*", Effect: service2.ResourcePolicy_allow},
		},
	})

	me, ok := err.(*mysql.MySQLError)
	if !ok {
		return err
	}
	if me.Number == 1062 {
		// This is a duplicate error, we ignore it
		return nil
	}
	return err
}
