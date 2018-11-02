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

package test

import (
	"github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/test"
	"github.com/pydio/cells/common/service"
)

var name = common.SERVICE_TEST_NAMESPACE_ + "objects"

func init() {
	service.NewService(
		service.Name(name),
		service.Tag(common.SERVICE_TAG_DATA),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX, []string{}),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS, []string{}),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC, []string{}),
		service.Description("Test Objects Service conformance"),
		service.WithMicro(func(m micro.Service) error {

			test.RegisterTesterHandler(m.Server(), NewHandler())

			return nil
		}),
	)
}
