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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

var (
	davRouter nodes.Client
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGatewayDav),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("DAV Gateway to tree service"),
			service.WithHTTP(func(runtimeCtx context.Context, mux server.HttpMux) error {
				davRouter = compose.PathClient(
					nodes.WithContext(runtimeCtx),
					nodes.WithRegistryWatch(),
					nodes.WithAuditEventsLogging(),
					nodes.WithSynchronousCaching(),
					nodes.WithSynchronousTasks(),
				)
				handler := newHandler(runtimeCtx, davRouter)
				handler = servicecontext.HttpWrapperMeta(runtimeCtx, handler)
				mux.Handle("/dav/", handler)
				return nil
			}),
		)
	})
}
