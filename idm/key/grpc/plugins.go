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

// Package grpc is a simple encryption key persistence layer
package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/dao/mysql"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	commonsql "github.com/pydio/cells/v4/common/sql"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/idm/key"
)

const ServiceName = common.ServiceGrpcNamespace_ + common.ServiceUserKey

func init() {
	runtime.Register("main", func(ctx context.Context) {
		var s service.Service
		s = service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Encryption Keys server"),
			service.WithTODOStorage(key.NewDAO, commonsql.NewDAO,
				service.WithStoragePrefix("idm_key"),
				service.WithStorageSupport(mysql.Driver, sqlite.Driver),
			),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				h, e := NewUserKeyStore(ctx, s)
				if e != nil {
					return e
				}
				encryption.RegisterUserKeyStoreEnhancedServer(server, h)

				return nil
			}),
		)
	})
}
