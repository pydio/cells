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

package rest

import (
	"fmt"

	"github.com/emicklei/go-restful"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/micro"
)

type Handler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"UpdateService"}
}

func (h *Handler) Filter() func(string) string {
	return func(s string) string {
		return s
	}
}

func (h *Handler) UpdateRequired(req *restful.Request, rsp *restful.Response) {

	cli := update.NewUpdateServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE, defaults.NewClient())
	response, err := cli.UpdateRequired(req.Request.Context(), &update.UpdateRequest{})
	if err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(response)
	}

}

func (h *Handler) ApplyUpdate(req *restful.Request, rsp *restful.Response) {

	targetVersion := req.PathParameter("TargetVersion")
	if targetVersion == "" {
		service.RestError500(req, rsp, fmt.Errorf("please prove a target version"))
		return
	}

	cli := update.NewUpdateServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE, defaults.NewClient())
	response, err := cli.ApplyUpdate(req.Request.Context(), &update.ApplyUpdateRequest{
		TargetVersion: targetVersion,
	})
	if err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(response)
	}

}
