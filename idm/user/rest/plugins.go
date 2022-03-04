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

// Package rest provides a gateway to the underlying grpc service
package rest

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceUser),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("RESTful Gateway to users service"),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceUser, []string{}),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceRole, []string{}),
			service.WithWeb(func(c context.Context) service.WebHandler {
				return NewUserHandler(c)
			}),
		)
	})
}
