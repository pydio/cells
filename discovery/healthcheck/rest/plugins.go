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

// Package rest starts a service that exposes a healthcheck.
package rest

import (
	"context"
	"fmt"
	"net/http"

	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {

		port := fmt.Sprintf("%v", viper.Get("healthcheck"))
		if port == "0" {
			return
		}

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceHealthCheck),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Port(port),
			service.Description("Healthcheck for services"),
			service.WithHTTP(func() http.Handler {
				return NewRouter()
			}),
		)
	})
}
