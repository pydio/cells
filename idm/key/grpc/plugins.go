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
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/configx"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/idm/key"
)

const ServiceName = common.ServiceGrpcNamespace_ + common.ServiceUserKey

func init() {
	runtime.Register("main", func(ctx context.Context) {
		var srv grpc.ServiceRegistrar
		if !server.Get(&srv) {
			panic("no grpc server available")
		}

		dao, err := key.NewDAO(ctx, storage.Main)
		if err != nil {
			panic(err)
		}

		opts := configx.New()

		if err := dao.Init(ctx, opts); err != nil {
			panic(err)
		}

		h, e := NewUserKeyStore(ctx, dao.(key.DAO))
		if e != nil {
			panic(e)
		}

		encryption.RegisterUserKeyStoreServer(srv, h)
	})
}
