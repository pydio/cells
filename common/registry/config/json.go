package configregistry

import (
	"fmt"
	"reflect"

	"google.golang.org/protobuf/encoding/protojson"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type jsonReader struct{}

func (j *jsonReader) Unmarshal(data []byte, out interface{}) error {
	i := new(pb.ListResponse)

	if err := protojson.Unmarshal(data, i); err != nil {
		return err
	}

	var ret []registry.Item
	for _, v := range i.Items {
		ret = append(ret, ToItem(v))
	}

	reflect.ValueOf(out).Elem().Set(reflect.ValueOf(ret))

	return nil
}

type jsonWriter struct{}

func (j *jsonWriter) Marshal(in interface{}) ([]byte, error) {

	switch v := in.(type) {
	case []registry.Item:
		var items []*pb.Item
		for _, i := range v {
			items = append(items, ToProtoItem(i))
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ListResponse{Items: items})
	}

	return nil, fmt.Errorf("should not be here")
}

func WithJSONItem() configx.Option {
	return func(o *configx.Options) {
		o.Unmarshaler = &jsonReader{}
		o.Marshaller = &jsonWriter{}
	}
}
