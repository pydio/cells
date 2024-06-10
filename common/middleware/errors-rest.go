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
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
)

type restErrorEmitter func(req *restful.Request, resp *restful.Response, err error)

// RestError500 logs the error with context and write an Error 500 on the response.
func RestError500(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 500", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  err.Error(),
		Detail: err.Error(),
	}
	if parsed := serviceerrors.FromError(err); parsed.Status != "" && parsed.Detail != "" {
		e.Title = parsed.Detail
		e.Detail = parsed.Status + ": " + parsed.Detail + ":" + parsed.Id
	}
	_ = resp.WriteHeaderAndEntity(500, e)
}

// RestError404 logs the error with context and writes an Error 404 on the response.
func RestError404(req *restful.Request, resp *restful.Response, err error) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	log.Logger(req.Request.Context()).Warn("Rest Error 404", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  err.Error(),
		Detail: err.Error(),
	}
	if parsed := serviceerrors.FromError(err); parsed.Status != "" && parsed.Detail != "" {
		e.Title = parsed.Detail
		e.Detail = parsed.Status + ": " + parsed.Detail
	}
	_ = resp.WriteHeaderAndEntity(404, e)
}

// RestError403 logs the error with context and write an Error 403 on the response.
func RestError403(req *restful.Request, resp *restful.Response, err error) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	log.Logger(req.Request.Context()).Error("Rest Error 403", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  err.Error(),
		Detail: err.Error(),
	}
	if parsed := serviceerrors.FromError(err); parsed.Status != "" && parsed.Detail != "" {
		e.Title = parsed.Detail
		e.Detail = parsed.Status + ": " + parsed.Detail
	}
	_ = resp.WriteHeaderAndEntity(403, e)
}

// RestError503 logs the error with context and write an Error 503 on the response.
func RestError503(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 503", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  err.Error(),
		Detail: err.Error(),
	}
	if parsed := serviceerrors.FromError(err); parsed.Code == 503 {
		e.Title = "Service temporarily unavailable"
		e.Detail = "Service temporarily unavailable"
	}
	_ = resp.WriteHeaderAndEntity(503, e)
}

// RestError423 logs the error with context and write an Error 423 on the response.
func RestError423(req *restful.Request, resp *restful.Response, err error) {
	log.Logger(req.Request.Context()).Error("Rest Error 423", zap.Error(err))
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  err.Error(),
		Detail: err.Error(),
	}
	if parsed := serviceerrors.FromError(err); parsed.Code == 423 {
		e.Title = "This resource is currently locked, please retry later!"
		e.Detail = "This resource is currently locked, please retry later!"
	}
	_ = resp.WriteHeaderAndEntity(423, e)
}

// RestError401 logs the error with context and write an Error 401 on the response.
func RestError401(req *restful.Request, resp *restful.Response, err error, errorID string) {
	if errorID == "" {
		errorID = "E_UNAUTHORIZED"
	}

	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	if !errors.Is(err, errors.EmptyIDToken) {
		err = HandleErrorRest(req.Request.Context(), err, "[REST]"+req.Request.RequestURI)
	}
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Code:  errorID,
		Title: errorID,
	}
	/*
		if parsed := serviceerrors.FromError(err); parsed.Status != "" && parsed.Detail != "" {
			e.Title = parsed.Detail
			e.Detail = parsed.Status + ": " + parsed.Detail
		}
	*/
	_ = resp.WriteHeaderAndEntity(401, e)
}

// RestErrorDetect parses the error and tries to detect the correct code.
func RestErrorDetect(req *restful.Request, resp *restful.Response, err error, defaultCode ...int32) {
	if errors.IsNetworkError(err) {
		RestError503(req, resp, err)
		return
	}
	emitters := map[int32]restErrorEmitter{
		500: RestError500,
		404: RestError404,
		403: RestError403,
		401: func(req *restful.Request, resp *restful.Response, err error) {
			RestError401(req, resp, err, "")
		},
		423: RestError423,
		503: RestError503,
	}
	parsed := serviceerrors.FromError(err)
	// Special case for underlying service not available
	if parsed.Id == "go.micro.client" && parsed.Detail == "none available" {
		parsed.Code = 503
		RestError503(req, resp, parsed)
		return
	}
	erCode := parsed.Code
	if f, ok := emitters[erCode]; ok {
		f(req, resp, err)
		return
	} else if len(defaultCode) > 0 {
		if f, ok := emitters[defaultCode[0]]; ok {
			f(req, resp, err)
			return
		}
	}
	emitters[500](req, resp, err)
}
