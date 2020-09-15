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

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/views"
)

var (
	davRouter *views.Router
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GATEWAY_DAV),
			service.Tag(common.SERVICE_TAG_GATEWAY),
			service.RouterDependencies(),
			service.Description("DAV Gateway to tree service"),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
				return service.RunnerFunc(func() error {
						return nil
					}), service.CheckerFunc(func() error {
						return nil
					}), service.StopperFunc(func() error {
						return nil
					}), nil
			}, func(s service.Service) (micro.Option, error) {

				srv := defaults.NewHTTPServer()
				davRouter = views.NewStandardRouter(views.RouterOptions{
					WatchRegistry:    true,
					AuditEvent:       true,
					SynchronousCache: true,
					SynchronousTasks: true,
				})
				handler := newHandler(s.Options().Context, davRouter)
				handler = servicecontext.HttpMetaExtractorWrapper(handler)
				err := srv.Handle(srv.NewHandler(handler))
				if err != nil {
					return nil, err
				}

				return micro.Server(srv), nil
			}),
		)
	})
}
