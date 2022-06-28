/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package service

import (
	"context"
	"github.com/pydio/cells/v4/common/server"

	"google.golang.org/grpc"
)

// WithGRPC adds a GRPC service handler to the current service
func WithGRPC(f func(context.Context, grpc.ServiceRegistrar) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeGrpc
		o.serverStart = func() error {
			if o.Server == nil {
				return errNoServerAttached
			}

			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)

			return f(o.Context, registrar)
		}
	}
}

// WithGRPCStop hooks to the grpc server stop
func WithGRPCStop(f func(context.Context, grpc.ServiceRegistrar) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)
			return f(o.Context, registrar)
		}
	}
}
