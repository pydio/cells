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

package service

import (
	"context"
	"net/http"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common/service/context"
)

func newLogProvider(service micro.Service) error {

	var options []micro.Option
	ctx := service.Options().Context

	name := servicecontext.GetServiceName(ctx)
	color := servicecontext.GetServiceColor(ctx)

	options = append(options, micro.WrapHandler(NewLogHandlerWrapper(name, color)))

	service.Init(options...)

	return nil
}

// NewLogHandlerWrapper wraps a db connection within the handler so it can be accessed by the handler itself.
func NewLogHandlerWrapper(name string, color uint64) server.HandlerWrapper {
	return func(h server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			ctx = servicecontext.WithServiceName(ctx, name)
			ctx = servicecontext.WithServiceColor(ctx, color)

			err := h(ctx, req, rsp)

			return err
		}
	}
}

// Same but for http
func NewLogHttpHandlerWrapper(h http.Handler, serviceName string, serviceColor uint64) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()
		ctx = servicecontext.WithServiceName(ctx, serviceName)
		ctx = servicecontext.WithServiceColor(ctx, serviceColor)

		r = r.WithContext(ctx)
		h.ServeHTTP(w, r)

	})
}
