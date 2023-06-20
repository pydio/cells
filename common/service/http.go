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
)

// WithHTTP adds a http micro service handler to the current service
func WithHTTP(f func(context.Context, server.HttpMux) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeHttp
		o.serverStart = func(c context.Context) error {
			var mux server.HttpMux
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux ", o.Name)
			}

			return f(c, mux)
		}
	}
}

func WithHTTPStop(f func(context.Context, server.HttpMux) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func(c context.Context) error {
			var mux server.HttpMux
			o.Server.As(&mux)
			return f(c, mux)
		}
	}
}

// WithPureHTTP adds a http micro service handler to the current service
func WithPureHTTP(f func(context.Context, server.HttpMux) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeHttpPure
		o.serverStart = func(c context.Context) error {
			var mux server.HttpMux
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux ", o.Name)
			}

			return f(c, mux)
		}
	}
}
