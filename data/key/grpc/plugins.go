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

// Package grpc provides a pydio GRPC service for managing files encryption keys
package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/dao/mysql"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	commonsql "github.com/pydio/cells/v4/common/sql"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/key"
)

var ServiceName = common.ServiceGrpcNamespace_ + common.ServiceEncKey

func init() {
	runtime.Register("main", func(ctx context.Context) {
		var s service.Service
		s = service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Encryption Keys server"),
			service.WithTODOStorage(key.NewDAO, commonsql.NewDAO,
				service.WithStoragePrefix("data_key"),
				service.WithStorageSupport(mysql.Driver, sqlite.Driver)),
			service.WithGRPC(func(c context.Context, srv grpc.ServiceRegistrar) error {
				h := NewNodeKeyManagerHandler(s)
				encryption.RegisterNodeKeyManagerEnhancedServer(srv, h)
				if e := broker.SubscribeCancellable(c, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if e := message.Unmarshal(msg); e == nil {
						return h.HandleTreeChanges(ctx, msg)
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
