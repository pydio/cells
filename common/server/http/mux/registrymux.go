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

package mux

import (
	"context"
	"fmt"
	"net/http"

	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/config/routing"
)

type Middleware struct {
	clienthttp.Resolver
}

func NewMiddleware(ctx context.Context, serverID string, r routing.RouteRegistrar) Middleware {
	m := Middleware{
		Resolver: clienthttp.NewResolver(),
	}
	m.Resolver.Init(ctx, serverID, r)
	return m
}

// ServeHTTP.
func (m Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	served, er := m.Resolver.ServeHTTP(w, r)
	if er != nil && !served {
		fmt.Println("http middleware did not find proxy for serving")
	}

}
