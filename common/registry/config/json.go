package configregistry

import (
	"fmt"

	"google.golang.org/protobuf/encoding/protojson"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type jsonReader struct{}

func (j *jsonReader) Unmarshal(data []byte, out interface{}) error {
	switch vout := out.(type) {
	case *interface{}:
		i := new(pb.Item)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		ret := ToItem(i)

		*vout = ret
	case *registry.Item:
		i := new(pb.Item)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		ret := ToItem(i)

		*vout = ret
	case *[]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for _, v := range i.Items {
			*vout = append(*vout, ToItem(v))
		}
	case map[string]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for k, v := range i.Items {
			vout[k] = ToItem(v)
		}
	}

	return nil
}

type jsonWriter struct{}

func (j *jsonWriter) Marshal(in interface{}) ([]byte, error) {

	switch v := in.(type) {
	case map[string]interface{}:
		items := map[string]*pb.Item{}

		for k, i := range v {
			items[k] = ToProtoItem(i.(registry.Item))
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ItemMap{Items: items})
	case []registry.Item:
		var items []*pb.Item
		for _, i := range v {
			items = append(items, ToProtoItem(i))
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ListResponse{Items: items})
	case registry.Item:
		item := ToProtoItem(v)

		return protojson.MarshalOptions{Indent: "  "}.Marshal(item)
	}

	return nil, fmt.Errorf("should not be here")
}

func WithJSONItem() configx.Option {
	return func(o *configx.Options) {
		o.Unmarshaler = &jsonReader{}
		o.Marshaller = &jsonWriter{}
	}
}
