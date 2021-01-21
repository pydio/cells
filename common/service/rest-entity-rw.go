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
