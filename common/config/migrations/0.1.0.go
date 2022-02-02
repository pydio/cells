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

package migrations

import (
	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	v, _ := version.NewVersion("0.1.0")
	add(v, getMigration(renameKeys))
}

func renameKeys(config configx.Values) error {
	return UpdateKeys(config, map[string]string{
		"services/pydio.api.websocket":      "services/" + common.ServiceGatewayNamespace_ + common.ServiceWebSocket,
		"services/pydio.grpc.gateway.data":  "services/" + common.ServiceGatewayData,
		"services/pydio.grpc.gateway.proxy": "services/" + common.ServiceGatewayProxy,
		"services/pydio.rest.gateway.dav":   "services/" + common.ServiceGatewayDav,
		"services/pydio.rest.gateway.wopi":  "services/" + common.ServiceGatewayWopi,
		"ports/micro.api":                   "ports/" + common.ServiceMicroApi,
		"services/micro.api":                "services/" + common.ServiceMicroApi,
		"services/pydio.api.front-plugins":  "services/" + common.ServiceWebNamespace_ + common.ServiceFrontStatics,
		// "services/pydio.grpc.auth/dex/connectors": "services/" + common.ServiceWebNamespace_ + common.ServiceOAuth + "/connectors",
	})
}
