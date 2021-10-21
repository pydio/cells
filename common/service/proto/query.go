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
	"errors"

	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/protobuf/jsonpb"
	"github.com/micro/protobuf/proto"
	"github.com/micro/protobuf/ptypes"
	"github.com/mitchellh/mapstructure"
	json "github.com/pydio/cells/x/jsonx"
)

type ConcreteQuery struct {
	Name string      `json:"Name,omitempty"`
	Data interface{} `json:"Data,omitempty"`
}

type outputFormat struct {
	SubQueries []interface{} `json:"SubQueries,omitempty"`
	Operation  OperationType `json:"Operation,omitempty"`
	Offset     int64         `json:"Offset,omitempty"`
	Limit      int64         `json:"Limit,omitempty"`
	GroupBy    int32         `json:"groupBy,omitempty"`
}

func (q *Query) MarshalJSONPB(marshaler *jsonpb.Marshaler) ([]byte, error) {

	data := outputFormat{
		SubQueries: []interface{}{},
		Operation:  q.Operation,
		Offset:     q.Offset,
		Limit:      q.Limit,
		GroupBy:    q.GroupBy,
	}

	for _, obj := range q.SubQueries {
		if concrete, err := q.marshalAnyTypes(obj); err == nil {
			data.SubQueries = append(data.SubQueries, concrete)
		} else {
			data.SubQueries = append(data.SubQueries, obj)
		}
	}
	return json.Marshal(data)
}

func (q *Query) marshalAnyTypes(obj *any.Any) (*ConcreteQuery, error) {

	/*
		TODO - find a solution to register a marshaller
		nodeQ := &tree.Query{}
		if e := ptypes.UnmarshalAny(obj, nodeQ); e == nil {
			return &ConcreteQuery{Name: "tree.Query", Data: nodeQ}, nil
		}
	*/

	aoQ := &ActionOutputQuery{}
	if e := ptypes.UnmarshalAny(obj, aoQ); e == nil {
		return &ConcreteQuery{Name: "ActionOutputQuery", Data: aoQ}, nil
	}

	sourceQ := &SourceSingleQuery{}
	if e := ptypes.UnmarshalAny(obj, sourceQ); e == nil {
		return &ConcreteQuery{Name: "SourceSingleQuery", Data: sourceQ}, nil
	}

	return nil, errors.New("Type Not Found")
}

func (q *Query) UnmarshalJSONPB(unmarshaller *jsonpb.Unmarshaler, data []byte) error {

	input := &outputFormat{SubQueries: []interface{}{}}
	json.Unmarshal(data, input)
	q.GroupBy = input.GroupBy
	q.Limit = input.Limit
	q.Offset = input.Offset
	q.Operation = input.Operation
	q.SubQueries = []*any.Any{}
	for _, obj := range input.SubQueries {
		var casted ConcreteQuery
		if err := mapstructure.Decode(obj, &casted); err == nil {
			var o proto.Message
			switch casted.Name {
			/*case "tree.Query":
			o = &tree.Query{}
			*/
			case "ActionOutputQuery":
				o = &ActionOutputQuery{}
			case "SourceSingleQuery":
				o = &SourceSingleQuery{}
			}
			if e := mapstructure.Decode(casted.Data, o); e == nil {
				anyfied, _ := ptypes.MarshalAny(o)
				q.SubQueries = append(q.SubQueries, anyfied)
			}
		} else {
			var a any.Any
			if e := mapstructure.Decode(obj, &a); e == nil {
				q.SubQueries = append(q.SubQueries, &a)
			}

		}

	}

	return nil
}

func ReduceQueryBooleans(results []bool, operation OperationType) bool {

	reduced := true
	if operation == OperationType_AND {
		// If one is false, it's false
		for _, b := range results {
			reduced = reduced && b
		}
	} else {
		// At least one must be true
		reduced = false
		for _, b := range results {
			reduced = reduced || b
			if b {
				break
			}
		}
	}
	return reduced
}
