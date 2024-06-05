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

// Package rest is used once at install-time when running install via browser
package service

import (
	"context"
	"net/http"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/discovery/install/assets"
)

func init() {
	routing.RegisterRoute("install", "Installation Frontend", "/")

	runtime.Register("install", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceWebNamespace_+common.ServiceInstall),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("WEB Installation server"),
			service.WithHTTP(func(ctx context.Context, mux routing.RouteRegistrar) error {
				httpFs := http.FS(assets.PydioInstallBox)

				fs := http.FileServer(httpFs)
				wrap := func(handler http.Handler) http.Handler {
					return http.TimeoutHandler(handler, 15*time.Second, "There was a timeout while serving the frontend resources...")
				}
				fs = wrap(fs)

				root := mux.Route("install")
				root.Handle("/res/", fs)
				root.Handle("/", fs)

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute("install")
				return nil
			}),
		)
	})
}
