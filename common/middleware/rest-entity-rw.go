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

package middleware

import (
	"context"
	"io"

	protovalidate "github.com/bufbuild/protovalidate-go"
	restful "github.com/emicklei/go-restful/v3"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/errors"
)

type detectedLanguagesKey struct{}

// DetectedLanguages reads languages from context
func DetectedLanguages(ctx context.Context) []string {
	var ll []string
	if v := ctx.Value(detectedLanguagesKey{}); v != nil {
		ll = v.([]string)
	}
	return ll
}

// WithDetectedLanguages passes the languages in context
func WithDetectedLanguages(ctx context.Context, ll []string) context.Context {
	return context.WithValue(ctx, detectedLanguagesKey{}, ll)
}

// ProtoEntityReaderWriter can read and write values using an encoding such as JSON,XML.
type ProtoEntityReaderWriter struct {
	validator protovalidate.Validator
}

// Read a serialized version of the value from the request.
// The Request may have a decompressing reader. Depends on Content-Encoding.
func (e *ProtoEntityReaderWriter) Read(req *restful.Request, v interface{}) error {
	pb := v.(proto.Message)
	bb, err := io.ReadAll(req.Request.Body)
	if err != nil {
		return errors.Tag(err, errors.RestInputError)
	}
	if err = protojson.Unmarshal(bb, pb); err != nil {
		return errors.Tag(err, errors.RestInputError)
	}
	// todo - do we need to allocate on each call ?
	validator, er := protovalidate.New()
	if er != nil {
		return errors.Tag(er, errors.RestInputError)
	}
	if err = validator.Validate(pb); err != nil {
		return errors.Tag(err, errors.RestInputError)
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
	bb, ee := protojson.Marshal(v.(proto.Message))
	if ee != nil {
		return errors.Tag(ee, errors.RestOutputWriteError)
	}
	if _, er := resp.Write(bb); er != nil {
		return errors.Tag(er, errors.RestOutputWriteError)
	} else {
		return nil
	}
}
