/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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

// Package service provides the GRPC persistence layer for CRUD-ing roles
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/share"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	grpc2 "github.com/pydio/cells/v5/idm/share/grpc"
)

const Name = common.ServiceGrpcNamespace_ + common.ServiceShare

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Share Service"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := &grpc2.Handler{}
				share.RegisterShareServiceServer(server, handler)
				return nil
			}),
		)
	})
}
