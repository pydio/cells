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

// Package micro starts a micro web service in API mode to dispatch all REST calls to the underlying services
package micro

import (
	"context"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/micro/go-api"
	ahandler "github.com/micro/go-api/handler"
	ahttp "github.com/micro/go-api/handler/http"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro/router"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.RegisterInstall(register)
	plugins.Register(register)
}

func register(ctx context.Context) {
	service.NewService(
		service.Name(common.ServiceMicroApi),
		service.Tag(common.ServiceTagGateway),
		service.Description("Proxy handler to dispatch REST requests to the underlying services"),
		service.WithHTTP(func() http.Handler {

			r := mux.NewRouter()
			rt := router.NewRouter(router.WithNamespace(strings.TrimRight(common.ServiceRestNamespace_, ".")), router.WithHandler(api.Http))
			ht := ahttp.NewHandler(
				ahandler.WithNamespace(strings.TrimRight(common.ServiceRestNamespace_, ".")),
				ahandler.WithRouter(rt),
				// ahandler.WithService(s.Options().Micro.(micro.Service)),
			)

			r.PathPrefix("/{service:[a-zA-Z0-9]+}").Handler(ht)

			return r
		}),
	)
}
