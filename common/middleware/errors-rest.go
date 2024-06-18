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

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/errors/langerr"
	"github.com/pydio/cells/v4/common/proto/rest"
)

var (
	defaultIDs = map[int]string{
		500: "E_INTERNAL_SERVER_ERROR",
		401: "E_UNAUTHORIZED",
		403: "E_FORBIDDEN",
		404: "E_NOT_FOUND",
		423: "E_RESOURCE_LOCKED",
		503: "E_SERVICE_UNAVAILABLE",
	}
)

func commonRestError(req *restful.Request, resp *restful.Response, err error, code int, warnLevel bool, errorID ...string) {
	// Find default ID
	id := defaultIDs[code]
	if len(errorID) > 0 {
		id = errorID[0]
	}
	// Log error if necessary
	HandleErrorRest(req.Request.Context(), err, "[REST]"+req.Request.RequestURI, nil, nil, warnLevel)

	// Emit http response
	emit(req, resp, code, id)
}

func emit(req *restful.Request, resp *restful.Response, code int, id string) {
	ll := DetectedLanguages(req.Request.Context())
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  id,
		Detail: langerr.T(ll...)("error." + id),
	}
	_ = resp.WriteHeaderAndEntity(code, e)
}

// restError500 logs the error with context and write an Error 500 on the response.
func restError500(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	commonRestError(req, resp, err, 500, false, errorID...)
}

// restError404 logs the error with context and writes an Error 404 on the response.
func restError404(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	if errors.IsNetworkError(err) {
		commonRestError(req, resp, err, 503, false, errorID...)
		return
	}
	commonRestError(req, resp, err, 404, true, errorID...)
}

// restError403 logs the error with context and write an Error 403 on the response.
func restError403(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	if errors.IsNetworkError(err) {
		restError503(req, resp, err)
		return
	}
	commonRestError(req, resp, err, 403, false, errorID...)
}

// restError503 logs the error with context and write an Error 503 on the response.
func restError503(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	commonRestError(req, resp, err, 503, false, errorID...)
}

// restError423 logs the error with context and write an Error 423 on the response.
func restError423(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	commonRestError(req, resp, err, 423, false, errorID...)
}

// restError401 logs the error with context and write an Error 401 on the response.
func restError401(req *restful.Request, resp *restful.Response, err error, errorID ...string) {
	if errors.IsNetworkError(err) {
		commonRestError(req, resp, err, 503, false, errorID...)
		return
	}
	id := "E_UNAUTHORIZED"
	if len(errorID) > 0 {
		id = errorID[0]
	}
	HandleErrorRest(req.Request.Context(), err, "[REST]"+req.Request.RequestURI, nil, []error{errors.EmptyIDToken})
	emit(req, resp, 401, id)
}

// restErrorDetect parses the error and tries to detect the correct code.
func restErrorDetect(req *restful.Request, resp *restful.Response, err error, defaultCode ...int32) {
	if errors.IsNetworkError(err) {
		restError503(req, resp, err)
		return
	}
	if errors.Is(err, errors.StatusNotFound) {
		restError404(req, resp, err)
	} else if errors.Is(err, errors.StatusServiceUnavailable) {
		restError503(req, resp, err)
	} else if errors.Is(err, errors.StatusForbidden) {
		restError403(req, resp, err)
	} else if errors.Is(err, errors.StatusUnauthorized) {
		restError401(req, resp, err)
	} else if errors.Is(err, errors.StatusLocked) {
		restError423(req, resp, err)
	} else {
		restError500(req, resp, err)
	}

}

func WrapErrorHandlerToRoute(handler func(req *restful.Request, rsp *restful.Response) error) func(req *restful.Request, rsp *restful.Response) {
	return func(req *restful.Request, rsp *restful.Response) {
		if re := handler(req, rsp); re != nil {
			restErrorDetect(req, rsp, re)
		}
	}
}
