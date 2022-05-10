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
	"fmt"

	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/generic"
)

// WithGeneric adds a http micro service handler to the current service
func WithGeneric(f func(context.Context, *generic.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeGeneric
		o.serverStart = func() error {
			var srvg *generic.Server

			if !o.Server.As(&srvg) {
				return fmt.Errorf("server %s is not a generic server", o.Name)
			}

			return f(o.Context, srvg)
		}
	}
}

// WithGenericStop adds a http micro service handler to the current service
func WithGenericStop(f func(context.Context, *generic.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			var srvg *generic.Server

			o.Server.As(&srvg)

			return f(o.Context, srvg)
		}
	}
}
