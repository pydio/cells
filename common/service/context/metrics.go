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

package servicecontext

import (
	"context"
	"net/http"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common/service/metrics"
	"github.com/uber-go/tally"
)

func NewMetricsWrapper(service micro.Service) {

	var options []micro.Option
	ctx := service.Options().Context

	name := GetServiceName(ctx)
	options = append(options, micro.WrapHandler(wrapperByName(name)))
	service.Init(options...)

}

func wrapperByName(name string) server.HandlerWrapper {

	return func(fn server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			scope := metrics.GetMetricsForService(name)
			if scope == tally.NoopScope {
				return fn(ctx, req, rsp)
			}
			scope.Counter("grpc_calls").Inc(1)
			tsw := scope.Timer("grpc_time").Start()
			defer tsw.Stop()
			return fn(ctx, req, rsp)
		}
	}
}

func NewMetricsHttpWrapper(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scope := metrics.GetMetricsForService(GetServiceName(r.Context()))
		if scope == tally.NoopScope {
			h.ServeHTTP(w, r)
			return
		}
		scope.Counter("rest_calls").Inc(1)
		tsw := scope.Timer("rest_time").Start()
		defer tsw.Stop()
		h.ServeHTTP(w, r)

	})

}
