/*
 * Copyright (c) 2018-2022. Abstrium SAS <team (at) pydio.com>
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

package metrics

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/metrics"
	"github.com/pydio/cells/v5/common/telemetry/profile"
)

func init() {

	routing.RegisterRoute(common.RouteMetrics, "Metrics Pull API", common.DefaultRouteMetrics)
	routing.RegisterRoute(common.RouteProfile, "Profiling Pull API", common.DefaultRouteProfile)

	runtime.Register("main", func(ctx context.Context) {

		if metrics.HasPullServices() {
			for _, svc := range metrics.GetPullServices() {
				svc.InitHTTPPullService(ctx, common.RouteMetrics)
			}
		}

		if profile.HasPullServices() {
			for _, svc := range profile.GetPullServices() {
				svc.InitHTTPPullService(ctx, common.RouteProfile)
			}
		}

	})
}
