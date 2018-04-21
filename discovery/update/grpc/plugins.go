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

// Package grpc is in charge of detecting updates and applying them
package grpc

import (
	"github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/service"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE),
		service.Tag(common.SERVICE_TAG_DISCOVERY),
		service.Description("Update checker service"),
		service.ExposedConfigs(ExposedConfigs),
		service.WithMicro(func(m micro.Service) error {
			handler := new(Handler)
			update.RegisterUpdateServiceHandler(m.Server(), handler)
			return nil
		}),
	)
}
