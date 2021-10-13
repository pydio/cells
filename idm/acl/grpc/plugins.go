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

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/meta"
	"github.com/pydio/cells/idm/acl"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceAcl),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Access Control List service"),
			service.WithStorage(acl.NewDAO, "idm_acl"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.ValidVersion("1.2.0"),
					Up:            UpgradeTo120,
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				service.AddMicroMeta(m, meta.ServiceMetaProvider, "stream")

				handler := new(Handler)
				idm.RegisterACLServiceHandler(m.Server(), handler)
				tree.RegisterNodeProviderStreamerHandler(m.Server(), handler)

				// Clean acls on Ws or Roles deletion
				m.Server().Subscribe(m.Server().NewSubscriber(common.TopicIdmEvent, &WsRolesCleaner{handler}))

				// Clean acls on Nodes deletion
				m.Server().Subscribe(m.Server().NewSubscriber(common.TopicTreeChanges, newNodesCleaner(m.Options().Context, handler)))

				// For when it will be used: clean locks at startup
				/*
					dao := servicecontext.GetDAO(m.Options().Context).(acl.DAO)
					if dao != nil {
						q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{Actions: []*idm.ACLAction{{Name: permissions.AclLock.Name}}})
						if num, _ := dao.Del(&service2.Query{SubQueries: []*any.Any{q}}); num > 0 {
							log.Logger(m.Options().Context).Info(fmt.Sprintf("Cleaned %d locks in ACLs", num))
						}
					}
				*/

				return nil
			}),
		)
	})
}
