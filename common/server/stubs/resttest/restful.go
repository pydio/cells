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

package resttest

import (
	"bytes"
	"context"
	"fmt"
	"net/http"

	restful "github.com/emicklei/go-restful/v3"
	"google.golang.org/protobuf/encoding/protojson"

	"google.golang.org/protobuf/proto"
)

type reqBody struct {
	bytes.Buffer
}

func (r *reqBody) Close() error {
	return nil
}

type respWriter struct {
	bytes.Buffer
	statusCode int
	hh         http.Header
}

func (r *respWriter) Header() http.Header {
	return r.hh
}

func (r *respWriter) WriteHeader(statusCode int) {
	r.statusCode = statusCode
}

func RunRestfulHandler(ctx context.Context, handler restful.RouteFunction, payload proto.Message, expected proto.Message, pathParameters map[string]string) (int, error) {

	// Marshal Proto and build restful.Request
	inputData, e := protojson.Marshal(payload)
	if e != nil {
		return 500, e
	}
	input := bytes.NewBuffer(inputData)
	body := &reqBody{Buffer: *input}
	req := restful.NewRequest(
		(&http.Request{
			Body: body,
			Header: map[string][]string{
				"Content-Type": {"application/json"},
			},
		}).WithContext(ctx),
	)
	for k, v := range pathParameters {
		req.PathParameters()[k] = v
	}
	restful.DefaultResponseContentType(restful.MIME_JSON)
	output := bytes.NewBuffer([]byte{})
	resp := restful.NewResponse(&respWriter{Buffer: *output, hh: map[string][]string{}})

	// Run Handler
	handler(req, resp)

	// Decode Response
	sCode := resp.ResponseWriter.(*respWriter).statusCode
	sContent := resp.ResponseWriter.(*respWriter).String()
	if sCode != http.StatusOK {
		return sCode, fmt.Errorf("Error Status :%s", sContent)
	}
	er := protojson.Unmarshal([]byte(sContent), expected)
	return sCode, er

}
