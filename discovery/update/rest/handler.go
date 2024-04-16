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

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/update"
	"github.com/pydio/cells/v4/common/service"
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

	ctx := req.Request.Context()
	var updateRequest update.UpdateRequest
	if e := req.ReadEntity(&updateRequest); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	cli := update.NewUpdateServiceClient(grpc.ResolveConn(ctx, common.ServiceUpdate))
	response, err := cli.UpdateRequired(ctx, &updateRequest)
	if err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(response)
	}

}

func (h *Handler) ApplyUpdate(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var applyRequest update.ApplyUpdateRequest
	if e := req.ReadEntity(&applyRequest); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	if applyRequest.TargetVersion == "" {
		service.RestError500(req, rsp, fmt.Errorf("please provide a target version"))
		return
	}

	cli := update.NewUpdateServiceClient(grpc.ResolveConn(ctx, common.ServiceUpdate))
	response, err := cli.ApplyUpdate(ctx, &applyRequest)
	if err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(response)
	}

}
