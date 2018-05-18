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

// Package wopi serves files using the WOPI protocol.
package wopi

import (
	"context"
	"fmt"
	"net/http"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/views"
)

var (
	viewsRouter *views.Router
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_REST_NAMESPACE_+common.SERVICE_GATEWAY_WOPI),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.RouterDependencies(),
		service.Description("WOPI REST Gateway to tree service"),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			viewsRouter = views.NewUuidRouter(views.RouterOptions{WatchRegistry: true, AuditEvent: true})

			config := servicecontext.GetConfig(ctx)
			port := config.Int("port", 5014)

			router := NewRouter()

			log.Logger(ctx).Debug(fmt.Sprintf("Starting Wopi Server on port %d", port))

			return service.RunnerFunc(func() error {
					return http.ListenAndServe(fmt.Sprintf(":%d", port), router)
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					return nil
				}), nil
		}),
	)
}
