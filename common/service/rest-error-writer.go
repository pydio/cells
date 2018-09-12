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

package service

import (
	"github.com/emicklei/go-restful"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
)

// RestError500 logs the error with context and write an Error 500 on the response.
func RestError500(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 500", zap.Error(err))
	// resp.AddHeader("Content-Type", "application/json")
	resp.WriteError(500, err)
}

// RestError404 logs the error with context and writes an Error 404 on the response.
func RestError404(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 404", zap.Error(err))
	// resp.AddHeader("Content-Type", "application/json")
	resp.WriteError(404, err)
}

// RestError403 logs the error with context and write an Error 403 on the response.
func RestError403(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 403", zap.Error(err))
	// resp.AddHeader("Content-Type", "application/json")
	resp.WriteError(403, err)
}

// RestError401 logs the error with context and write an Error 401 on the response.
func RestError401(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 401", zap.Error(err))
	// resp.AddHeader("Content-Type", "application/json")
	resp.WriteError(401, err)
}
