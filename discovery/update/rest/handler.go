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
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/update"
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

func (h *Handler) UpdateRequired(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var updateRequest update.UpdateRequest
	if e := req.ReadEntity(&updateRequest); e != nil {
		return e
	}
	cli := update.NewUpdateServiceClient(grpc.ResolveConn(ctx, common.ServiceUpdateGRPC))
	response, err := cli.UpdateRequired(ctx, &updateRequest)
	if err != nil {
		return err
	} else {
		return rsp.WriteEntity(response)
	}

}

func (h *Handler) ApplyUpdate(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var applyRequest update.ApplyUpdateRequest
	if e := req.ReadEntity(&applyRequest); e != nil {
		return e
	}
	if applyRequest.TargetVersion == "" {
		return errors.WithMessage(errors.InvalidParameters, "please provide a target version")
	}

	cli := update.NewUpdateServiceClient(grpc.ResolveConn(ctx, common.ServiceUpdateGRPC))
	response, err := cli.ApplyUpdate(ctx, &applyRequest)
	if err != nil {
		return err
	} else {
		return rsp.WriteEntity(response)
	}

}
