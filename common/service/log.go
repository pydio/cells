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

package service

import (
	"context"
	"net/http"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"

	servicecontext "github.com/pydio/cells/common/service/context"
)

func newLogProvider(service micro.Service) error {

	var options []micro.Option
	ctx := service.Options().Context
	name := servicecontext.GetServiceName(ctx)
	options = append(options, micro.WrapHandler(NewLogHandlerWrapper(name)))
	service.Init(options...)

	return nil
}

// NewLogHandlerWrapper wraps a db connection within the handler so it can be accessed by the handler itself.
func NewLogHandlerWrapper(name string) server.HandlerWrapper {
	return func(h server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			ctx = servicecontext.WithServiceName(ctx, name)

			err := h(ctx, req, rsp)

			return err
		}
	}
}

// NewLogHTTPHandlerWrapper wraps a db connection to the HTTP Handler
func NewLogHTTPHandlerWrapper(h http.Handler, serviceName string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r = r.WithContext(servicecontext.WithServiceName(r.Context(), serviceName))
		h.ServeHTTP(w, r)

	})
}
