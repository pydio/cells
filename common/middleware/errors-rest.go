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
	defaultIDs = map[int]errors.ApiCode{
		500: errors.ApiInternalServerError,
		401: errors.ApiUnauthorized,
		403: errors.ApiForbidden,
		404: errors.ApiNotFound,
		423: errors.ApiResourceLocked,
		503: errors.ApiServiceUnavailable,
	}
)

func commonRestError(req *restful.Request, resp *restful.Response, err error, code int, warnLevel bool) {
	id := defaultIDs[code]
	// Log error if necessary
	HandleErrorRest(req.Request.Context(), err, "[REST]"+req.Request.RequestURI, nil, nil, warnLevel)

	dd := errors.AllDetails(err)
	var msgArgs []interface{}
	if apiCode, ok := dd["apiCode"]; ok {
		id = apiCode.(errors.ApiCode)
		if apiCodeArgs, ok2 := dd["apiCodeArgs"]; ok2 {
			codeArgs := apiCodeArgs.([]interface{})
			// Create a map for template data
			initMap := make(map[string]interface{})
			for i := 0; i < len(codeArgs); i += 2 {
				if key, o := codeArgs[i].(string); o {
					initMap[key] = codeArgs[i+1]
				}
			}
			if len(initMap) > 0 {
				msgArgs = append(msgArgs, initMap)
			}
		}
	}
	// Emit http response
	emit(req, resp, code, id, msgArgs...)
}

func emit(req *restful.Request, resp *restful.Response, code int, apiCode errors.ApiCode, msgArgs ...interface{}) {
	ll := DetectedLanguages(req.Request.Context())
	resp.AddHeader("Content-Type", "application/json")
	e := &rest.Error{
		Title:  langerr.T(ll...)("error."+string(apiCode), msgArgs...),
		Detail: string(apiCode),
	}
	_ = resp.WriteHeaderAndEntity(code, e)
}

// restError500 logs the error with context and write an Error 500 on the response.
func restError500(req *restful.Request, resp *restful.Response, err error) {
	commonRestError(req, resp, err, 500, false)
}

// restError404 logs the error with context and writes an Error 404 on the response.
func restError404(req *restful.Request, resp *restful.Response, err error) {
	if errors.IsNetworkError(err) {
		commonRestError(req, resp, err, 503, false)
		return
	}
	commonRestError(req, resp, err, 404, true)
}

// restError403 logs the error with context and write an Error 403 on the response.
func restError403(req *restful.Request, resp *restful.Response, err error) {
	if errors.IsNetworkError(err) {
		restError503(req, resp, err)
		return
	}
	commonRestError(req, resp, err, 403, false)
}

// restError503 logs the error with context and write an Error 503 on the response.
func restError503(req *restful.Request, resp *restful.Response, err error) {
	commonRestError(req, resp, err, 503, false)
}

// restError423 logs the error with context and write an Error 423 on the response.
func restError423(req *restful.Request, resp *restful.Response, err error) {
	commonRestError(req, resp, err, 423, false)
}

// restError401 logs the error with context and write an Error 401 on the response.
func restError401(req *restful.Request, resp *restful.Response, err error) {
	if errors.IsNetworkError(err) {
		commonRestError(req, resp, err, 503, false)
		return
	}
	id := errors.ApiUnauthorized
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
