/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package index

import (
	"context"

	"github.com/pydio/cells/v4/common/proto/front"
	"github.com/pydio/cells/v4/common/service/frontend"
)

type ManifestHandler struct {
	front.UnimplementedManifestServiceServer
	HandlerName string
}

func (m *ManifestHandler) Name() string {
	return m.HandlerName
}

func (m *ManifestHandler) ExposedParameters(ctx context.Context, request *front.ExposedParametersRequest) (*front.ExposedParametersResponse, error) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		return nil, e
	}
	response := &front.ExposedParametersResponse{}
	params := pool.ExposedParametersByScope(request.Scope, request.Exposed)
	for _, p := range params {
		response.Parameters = append(response.Parameters, &front.ExposedParameter{
			Name:     p.Attrname,
			Scope:    p.Attrscope,
			PluginId: p.PluginId,
		})
	}
	return response, nil
}
