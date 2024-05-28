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
package rest

import (
	"context"

	"github.com/jcuga/golongpoll"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	runtime.Register("install", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceInstall),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("RESTful Installation server"),
			service.WithWeb(func(c context.Context) service.WebHandler {
				eventManager, _ := golongpoll.StartLongpoll(golongpoll.Options{})

				return &Handler{
					eventManager: eventManager,
					onSuccess: func() error {
						var bkr broker.Broker
						if propagator.Get(c, broker.ContextKey, &bkr) {
							return bkr.Publish(c, common.TopicInstallSuccessEvent, nil)
						}
						return broker.Publish(c, common.TopicInstallSuccessEvent, nil)
					},
				}
			}),
		)
	})
}
