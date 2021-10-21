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

package service

import (
	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	validator "github.com/mwitkow/go-proto-validators"
)

// ProtoEntityReaderWriter can read and write values using an encoding such as JSON,XML.
type ProtoEntityReaderWriter struct {
}

// Read a serialized version of the value from the request.
// The Request may have a decompressing reader. Depends on Content-Encoding.
func (e *ProtoEntityReaderWriter) Read(req *restful.Request, v interface{}) error {
	pb := v.(proto.Message)
	if e := jsonpb.Unmarshal(req.Request.Body, pb); e != nil {
		return e
	}
	if valid, ok := pb.(validator.Validator); ok {
		return valid.Validate()
	}
	return nil
}

// Write a serialized version of the value on the response.
// The Response may have a compressing writer. Depends on Accept-Encoding.
// status should be a valid Http Status code
func (e *ProtoEntityReaderWriter) Write(resp *restful.Response, status int, v interface{}) error {

	if v == nil {
		resp.WriteHeader(status)
		// do not write a nil representation
		return nil
	}

	resp.Header().Set(restful.HEADER_ContentType, "application/json")
	resp.WriteHeader(status)
	encoder := &jsonpb.Marshaler{
		EnumsAsInts: false,
	}
	return encoder.Marshal(resp, v.(proto.Message))

}
