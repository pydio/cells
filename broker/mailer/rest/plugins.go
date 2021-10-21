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

// Package rest exposes a simple API for posting emails
package rest

import (
	"context"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceRestNamespace_+common.ServiceMailer),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("REST send email service"),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceMailer, []string{}),
			service.WithWeb(func() service.WebHandler {
				return new(MailerHandler)
			}),
		)
	})
}
