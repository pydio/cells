/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package configregistry

import (
	"encoding/json"
	"fmt"
	"reflect"

	"google.golang.org/protobuf/encoding/protojson"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/utils/configx"
)

func WithJSONItemMap() configx.Option {
	return func(o *configx.Options) {
		o.Unmarshaler = &jsonItemMapReader{}
		o.Marshaller = &jsonItemMapWriter{}
	}
}

func WithJSONItem() configx.Option {
	return func(o *configx.Options) {
		o.Unmarshaler = &jsonItemReader{}
		o.Marshaller = &jsonItemWriter{}
	}
}

type jsonItemMapReader struct{}

func (j *jsonItemMapReader) Unmarshal(data []byte, out interface{}) error {
	switch vout := out.(type) {
	case *interface{}:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err == nil {
			*vout = i
		}

		return nil
	case *[]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for _, v := range i.Items {
			*vout = append(*vout, util.ToItem(v))
		}

		return nil
	case map[string]interface{}:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for k, v := range i.Items {
			vout[k] = util.ToItem(v)
		}

		return nil
	case map[string]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for k, v := range i.Items {
			vout[k] = util.ToItem(v)
		}

		return nil
	}

	return fmt.Errorf("should not be here in unmarshal")
}

type jsonItemMapWriter struct{}

func (j *jsonItemMapWriter) Marshal(in interface{}) ([]byte, error) {

	switch v := in.(type) {
	case map[string]registry.Item:
		items := map[string]*pb.Item{}
		for k, i := range v {
			items[k] = util.ToProtoItem(i)
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ItemMap{Items: items})
	case map[string]interface{}:
		items := map[string]*pb.Item{}

		for k, i := range v {
			items[k] = i.(*pb.Item)
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ItemMap{Items: items})
	case []registry.Item:
		var items []*pb.Item
		for _, i := range v {
			items = append(items, util.ToProtoItem(i))
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ListResponse{Items: items})
	case *pb.ItemMap:
		return protojson.MarshalOptions{Indent: "  "}.Marshal(v)
	}

	return nil, fmt.Errorf("should not be here in marshal %s", reflect.TypeOf(in))
}

type jsonItemReader struct{}

func (j *jsonItemReader) Unmarshal(data []byte, out interface{}) error {
	switch vout := out.(type) {
	case *interface{}:
		j := new(pb.Item)

		if err := protojson.Unmarshal(data, j); err != nil {
			return err
		}

		*vout = j

		return nil
	case *registry.Item:
		i := new(pb.Item)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		ret := util.ToItem(i)

		*vout = ret

		return nil
	case *[]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for _, v := range i.Items {
			*vout = append(*vout, util.ToItem(v))
		}

		return nil
	case map[string]interface{}:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for k, v := range i.Items {
			vout[k] = util.ToItem(v)
		}

		return nil
	case map[string]registry.Item:
		i := new(pb.ItemMap)

		if err := protojson.Unmarshal(data, i); err != nil {
			return err
		}

		for k, v := range i.Items {
			vout[k] = util.ToItem(v)
		}

		return nil
	}

	return fmt.Errorf("should not be here in unmarshal")
}

type jsonItemWriter struct{}

func (j *jsonItemWriter) Marshal(in interface{}) ([]byte, error) {

	switch v := in.(type) {
	case map[string]registry.Item:
		items := map[string]*pb.Item{}
		for k, i := range v {
			items[k] = util.ToProtoItem(i)
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ItemMap{Items: items})
	case map[string]interface{}:
		items := map[string]*pb.Item{}

		for k, i := range v {
			switch vv := i.(type) {
			case registry.Item:
				items[k] = util.ToProtoItem(vv)
			case *pb.Item:
				items[k] = vv
			default:
				return json.Marshal(in)
			}
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ItemMap{Items: items})
	case []registry.Item:
		var items []*pb.Item
		for _, i := range v {
			items = append(items, util.ToProtoItem(i))
		}

		return protojson.MarshalOptions{Indent: "  "}.Marshal(&pb.ListResponse{Items: items})
	case registry.Item:
		item := util.ToProtoItem(v)

		return protojson.MarshalOptions{Indent: "  "}.Marshal(item)
	case *pb.ItemMap:
		return protojson.MarshalOptions{Indent: "  "}.Marshal(v)
	}

	return json.Marshal(in)
}
