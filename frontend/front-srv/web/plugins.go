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

// Package web is a service for providing additional plugins to PHP frontend
package web

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/frontend/front-srv/web/index"
)

var (
	Name = common.SERVICE_API_NAMESPACE_ + common.SERVICE_FRONTPLUGS
)

func init() {
	service.NewService(
		service.Name(Name),
		service.Tag(common.SERVICE_TAG_FRONTEND),
		service.Description("REST service for providing additional plugins to PHP frontend"),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			cfg := servicecontext.GetConfig(ctx)

			port := cfg.Int("port", 9025)

			return service.RunnerFunc(func() error {
					router := mux.NewRouter()
					httpFs := frontend.GetPluginsFS()
					fs := http.FileServer(httpFs)
					router.Handle("/index.json", fs)
					router.PathPrefix("/plug/").Handler(http.StripPrefix("/plug/", fs))
					indexHandler := index.NewIndexHandler()
					router.Handle("/gui", indexHandler)
					router.Handle("/user/reset-password/{resetPasswordKey}", indexHandler)
					router.Handle("/public/{link}", index.NewPublicHandler())
					http.Handle("/", router)
					srv := &http.Server{
						Handler: router,
						Addr:    fmt.Sprintf(":%d", port),
						// Good practice: enforce timeouts for servers you create!
						WriteTimeout: 15 * time.Second,
						ReadTimeout:  15 * time.Second,
					}
					srv.ListenAndServe()

					return nil
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					return nil
				}), nil
		}),
	)
}
