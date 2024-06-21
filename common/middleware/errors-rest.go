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
	"net/http"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/errors/langerr"
	"github.com/pydio/cells/v4/common/proto/rest"
)

type httpStatus struct {
	base     error
	code     int
	msg      errors.ApiCode
	logLevel zapcore.Level
}

var (
	defaultStatus = httpStatus{
		base: errors.StatusInternalServerError,
		code: http.StatusInternalServerError,
		msg:  errors.ApiInternalServerError,
	}
	networkStatus = httpStatus{
		base: errors.StatusInternalServerError,
		code: http.StatusServiceUnavailable,
		msg:  errors.ApiServiceUnavailable,
	}
	orderedStatuses = []httpStatus{
		{base: errors.StatusUnauthorized, code: http.StatusUnauthorized, msg: errors.ApiUnauthorized},
		{base: errors.StatusForbidden, code: http.StatusForbidden, msg: errors.ApiForbidden},
		{base: errors.StatusNotFound, code: http.StatusNotFound, msg: errors.ApiNotFound, logLevel: zapcore.WarnLevel},
		{base: errors.StatusNotImplemented, code: http.StatusNotImplemented},
		{base: errors.StatusConflict, code: http.StatusConflict},
		{base: errors.StatusDataLoss, code: http.StatusInternalServerError},
		{base: errors.StatusLocked, code: http.StatusLocked, msg: errors.ApiResourceLocked},
		{base: errors.StatusQuotaReached, code: http.StatusUnprocessableEntity},
		{base: errors.StatusOutOfRange, code: http.StatusRequestedRangeNotSatisfiable},
		{base: errors.StatusPreconditionFailed, code: http.StatusPreconditionFailed},
		{base: errors.StatusRequestTimeout, code: http.StatusRequestTimeout},
		{base: errors.StatusTooManyRequests, code: http.StatusTooManyRequests},
		{base: errors.StatusCancelled, code: http.StatusBadRequest},
		{base: errors.StatusAborted, code: http.StatusBadRequest},
		{base: errors.StatusBadRequest, code: http.StatusBadRequest},
		networkStatus,
		defaultStatus,
	}
)

func commonRestError(req *restful.Request, resp *restful.Response, err error) {
	status := defaultStatus
	if errors.IsNetworkError(err) {
		status = networkStatus
	} else {
		for _, os := range orderedStatuses {
			if errors.Is(err, os.base) {
				status = os
				break
			}
		}
	}
	level := zapcore.ErrorLevel
	if status.logLevel < 0 || status.logLevel > 0 { // debug is -1, info is 0, higher is > 0
		level = status.logLevel
	}
	// Log error if necessary
	logRestError(req.Request.Context(), err, "[REST]"+req.Request.RequestURI, level)

	// Find default output message
	id := status.msg
	if id == "" {
		id = errors.ApiInternalServerError
	}
	// Find message in details
	var msgArgs []interface{}
	if code, args, has := errors.HasApiCode(err); has {
		id = code
		if len(args) > 0 {
			// Create a map for template data
			initMap := make(map[string]interface{})
			for i := 0; i < len(args); i += 2 {
				if key, o := args[i].(string); o {
					initMap[key] = args[i+1]
				}
			}
			if len(initMap) > 0 {
				msgArgs = append(msgArgs, initMap)
			}
		}
	}

	// Emit http response
	emit(req, resp, status.code, id, msgArgs...)
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

func WrapErrorHandlerToRoute(handler func(req *restful.Request, rsp *restful.Response) error) func(req *restful.Request, rsp *restful.Response) {
	return func(req *restful.Request, rsp *restful.Response) {
		if re := handler(req, rsp); re != nil {
			commonRestError(req, rsp, re)
		}
	}
}
