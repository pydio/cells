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

// Package grpc provides a service for storing and CRUD-ing ACLs
package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/dao/mysql"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/idm/acl"
)

var ServiceName = common.ServiceGrpcNamespace_ + common.ServiceAcl

func init() {

	runtime.Register("main", func(ctx context.Context) {
		var s service.Service

		getDAO := func(ctx context.Context) acl.DAO {
			var c dao.DAO
			if cfgFromCtx := servercontext.GetConfig(ctx); cfgFromCtx != nil {
				driver, dsn, _ := config.GetStorageDriver(cfgFromCtx, "storage", ServiceName)

				c, _ := dao.InitDAO(ctx, driver, dsn, "idm_acl", acl.NewDAO, cfgFromCtx.Val("services", ServiceName))

				service.UpdateServiceVersion(servicecontext.WithDAO(ctx, c), cfgFromCtx, s.Options())
			} else {
				c = servicecontext.GetDAO(s.Options().Context)
			}

			return c.(acl.DAO)
		}

		s = service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Access Control List service"),
			service.WithStorage(acl.NewDAO,
				service.WithStoragePrefix("idm_acl"),
				service.WithStorageSupport(mysql.Driver),
			),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.ValidVersion("1.2.0"),
					Up:            UpgradeTo120,
				},
			}),
			service.Metadata(meta.ServiceMetaProvider, "stream"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := NewHandler(ctx, getDAO)

				idm.RegisterACLServiceEnhancedServer(server, handler)
				tree.RegisterNodeProviderStreamerEnhancedServer(server, handler)

				// Clean acls on Ws or Roles deletion
				rCleaner := &WsRolesCleaner{Handler: handler}
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if e := message.Unmarshal(ev); e == nil {
						return rCleaner.Handle(ctx, ev)
					}
					return nil
				}); e != nil {
					return e
				}

				nCleaner := newNodesCleaner(ctx, handler)
				if e := broker.SubscribeCancellable(ctx, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					ev := &tree.NodeChangeEvent{}
					if e := message.Unmarshal(ev); e == nil {
						return nCleaner.Handle(ctx, ev)
					}
					return nil
				}); e != nil {
					return e
				}

				// For when it will be used: clean locks at startup
				//	dao := servicecontext.GetDAO(m.Options().Context).(acl.DAO)
				//	if dao != nil {
				//		q, _ := anypb.New(&idm.ACLSingleQuery{Actions: []*idm.ACLAction{{Name: permissions.AclLock.Name}}})
				//		if num, _ := dao.Del(&service2.Query{SubQueries: []*anypb.Any{q}}); num > 0 {
				//			log.Logger(m.Options().Context).Info(fmt.Sprintf("Cleaned %d locks in ACLs", num))
				//		}
				//	}

				return nil
			}),
		)
	})
}
