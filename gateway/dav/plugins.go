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

// Package dav provides a REST gateway to communicate with pydio backend via the webdav protocol.
package dav

import (
	"context"
	"net/http"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/path"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
)

var (
	davRouter nodes.Handler
)

func RouterWithOptionalPrefix(runtime context.Context, s ...string) nodes.Handler {
	if davRouter == nil {
		davRouter = compose.PathClient(
			runtime,
			nodes.WithAuditEventsLogging(),
			nodes.WithSynchronousCaching(),
			nodes.WithSynchronousTasks(),
		)
	}
	if len(s) == 0 {
		return davRouter
	}
	pf := path.NewPermanentPrefix(s[0])
	return pf.Adapt(davRouter, nodes.RouterOptions{Context: runtime})
}

// GetHandler is public to let external package spinning a DAV http handler
func GetHandler(ctx context.Context, davPrefix, routerPrefix string) (http.Handler, nodes.Handler) {
	ro := RouterWithOptionalPrefix(ctx, routerPrefix)
	handler := newHandler(ctx, davPrefix, ro)
	return handler, ro
}

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGatewayDav),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("DAV Gateway to tree service"),
			service.WithHTTP(func(runtimeCtx context.Context, mux server.HttpMux) error {
				handler := newHandler(runtimeCtx, "/dav", RouterWithOptionalPrefix(ctx), "Cells DAV")
				mux.Handle("/dav/", handler)
				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux server.HttpMux) error {
				if m, ok := mux.(server.PatternsProvider); ok {
					m.DeregisterPattern("/dav/")
				}
				return nil
			}),
		)
	})
}
