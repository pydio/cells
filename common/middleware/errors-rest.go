/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package middleware

import (
	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

type restErrorEmitter func(req *restful.Request, resp *restful.Response, err error, errorID ...string)

// RestError500 logs the error with context and write an Error 500 on the response.
func RestError500(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	id := "E_INTERNAL_SERVER_ERROR"
	if len(errorID) > 0 {
		id = errorID[0]
	}
	ctx := req.Request.Context()
	msg, ff := HandleErrorRest(ctx, err, "[REST]"+req.Request.RequestURI)
	log.Logger(ctx).Error(msg, ff...)

	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: id,
	}
	_ = resp.WriteHeaderAndEntity(500, e)
}

// RestError404 logs the error with context and writes an Error 404 on the response.
func RestError404(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err, errorID...)
		return
	}
	id := "E_NOT_FOUND"
	if len(errorID) > 0 {
		id = errorID[0]
	}
	ctx := req.Request.Context()
	msg, ff := HandleErrorRest(ctx, err, "[REST]"+req.Request.RequestURI)
	log.Logger(ctx).Warn(msg, ff...)

	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: id,
	}
	_ = resp.WriteHeaderAndEntity(404, e)
}

// RestError403 logs the error with context and write an Error 403 on the response.
func RestError403(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	id := "E_FORBIDDEN"
	if len(errorID) > 0 {
		id = errorID[0]
	}

	ctx := req.Request.Context()
	msg, ff := HandleErrorRest(ctx, err, "[REST]"+req.Request.RequestURI)
	log.Logger(ctx).Error(msg, ff...)

	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: id,
	}
	_ = resp.WriteHeaderAndEntity(403, e)
}

// RestError503 logs the error with context and write an Error 503 on the response.
func RestError503(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	id := "E_SERVICE_UNAVAILABLE"
	if len(errorID) > 0 {
		id = errorID[0]
	}

	ctx := req.Request.Context()
	msg, ff := HandleErrorRest(ctx, err, "[REST]"+req.Request.RequestURI)
	log.Logger(ctx).Error(msg, ff...)

	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: id,
	}
	_ = resp.WriteHeaderAndEntity(503, e)
}

// RestError423 logs the error with context and write an Error 423 on the response.
func RestError423(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	id := "E_RESOURCE_LOCKED"
	if len(errorID) > 0 {
		id = errorID[0]
	}

	log.Logger(req.Request.Context()).Error("Rest Error 423", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: id,
	}
	_ = resp.WriteHeaderAndEntity(423, e)
}

// RestError401 logs the error with context and write an Error 401 on the response.
func RestError401(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	id := "E_UNAUTHORIZED"
	if len(errorID) > 0 {
		id = errorID[0]
	}

	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	if !errors.Is(err, errors.EmptyIDToken) {
		HandleErrorRest(req.Request.Context(), err, "[REST]"+req.Request.RequestURI)
	}
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Code:  id,
		Title: id,
	}
	_ = resp.WriteHeaderAndEntity(401, e)
}

// RestErrorDetect parses the error and tries to detect the correct code.
func RestErrorDetect(req *restful.Request, resp *restful.Response, err error, defaultCode ...int32) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	if errors.Is(err, errors.StatusNotFound) {
		RestError404(req, resp, err)
	} else if errors.Is(err, errors.StatusServiceUnavailable) {
		RestError503(req, resp, err)
	} else if errors.Is(err, errors.StatusForbidden) {
		RestError403(req, resp, err)
	} else if errors.Is(err, errors.StatusUnauthorized) {
		RestError401(req, resp, err)
	} else if errors.Is(err, errors.StatusLocked) {
		RestError423(req, resp, err)
	} else {
		RestError500(req, resp, err)
	}

}
