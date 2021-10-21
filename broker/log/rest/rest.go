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

package rest

import (
	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
)

type Handler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"LogService"}
}

// Filter returns a function to filter the swagger path
func (h *Handler) Filter() func(string) string {
	return nil
}

// Syslog retrieves the technical logs items matched by the query and export them in JSON, XLSX or CSV format
func (h *Handler) Syslog(req *restful.Request, rsp *restful.Response) {

	var input log.ListLogRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	ctx := req.Request.Context()

	c := log.NewLogRecorderClient(registry.GetClient(common.ServiceLog))

	res, err := c.ListLogs(ctx, &input)
	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	defer res.Close()

	logColl := &rest.LogMessageCollection{}
	for {
		response, err := res.Recv()
		if err != nil {
			break
		}
		logColl.Logs = append(logColl.Logs, response.GetLogMessage())
	}

	rsp.WriteEntity(logColl)

}
