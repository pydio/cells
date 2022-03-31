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

// Package rest exposes a simple API used by admins to query the whole tree directly without going through routers.
package rest

import (
	restful "github.com/emicklei/go-restful/v3"
	"github.com/pydio/cells/v4/common/service"

	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/data/templates"
)

type Handler struct {
	Dao templates.DAO
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"TemplatesService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return func(s string) string {
		return s
	}
}

func (a *Handler) ListTemplates(req *restful.Request, rsp *restful.Response) {

	nodes, er := a.Dao.List(req.Request.Context())
	if er != nil {
		service.RestErrorDetect(req, rsp, er)
		return
	}
	response := &rest.ListTemplatesResponse{}
	for _, node := range nodes {
		response.Templates = append(response.Templates, node.AsTemplate())
	}

	rsp.WriteEntity(response)

}
