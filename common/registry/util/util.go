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

package util

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

// ToProtoItems transforms a list of interfaces to protobuf for serialization
func ToProtoItems(ii []registry.Item) []*pb.Item {
	var items []*pb.Item

	for _, i := range ii {
		items = append(items, ToProtoItem(i))
	}

	return items
}

// ToProtoItem transforms a registry.Item to its protobuf counterpart
func ToProtoItem(i registry.Item) *pb.Item {
	item := &pb.Item{
		Id:       i.ID(),
		Name:     i.Name(),
		Metadata: i.Metadata(),
	}

	switch v := i.(type) {
	case registry.Node:
		item.Item = &pb.Item_Node{Node: ToProtoNode(v)}
	case registry.Service:
		item.Item = &pb.Item_Service{Service: ToProtoService(v)}
	case registry.Server:
		item.Item = &pb.Item_Server{Server: ToProtoServer(v)}
	case registry.Dao:
		item.Item = &pb.Item_Dao{Dao: ToProtoDao(v)}
	case registry.Edge:
		item.Item = &pb.Item_Edge{Edge: ToProtoEdge(v)}
	case registry.Generic:
		item.Item = &pb.Item_Generic{Generic: ToProtoGeneric(v)}
	}

	return item
}

// ToItem wraps a protobuf item in a registry.Item interface
func ToItem(s *pb.Item) registry.Item {
	switch v := s.Item.(type) {
	case *pb.Item_Node:
		return ToNode(s, v.Node)
	case *pb.Item_Service:
		return ToService(s, v.Service)
	case *pb.Item_Server:
		return ToServer(s, v.Server)
	case *pb.Item_Dao:
		return ToDao(s, v.Dao)
	case *pb.Item_Edge:
		return ToEdge(s, v.Edge)
	case *pb.Item_Generic:
		return ToGeneric(s, v.Generic)
	}

	return nil
}

// ToOptions parses a protobuf pb.Options to a slice of registry.Option
func ToOptions(s *pb.Options) (oo []registry.Option) {
	if s == nil {
		return
	}
	for _, name := range s.Names {
		oo = append(oo, registry.WithName(name))
	}
	for _, itemType := range s.Types {
		oo = append(oo, registry.WithType(itemType))
	}
	if s.GetMetaName() != "" {
		oo = append(oo, registry.WithMeta(s.GetMetaName(), s.GetMetaValue()))
	}
	return
}

func DetectType(i registry.Item) pb.ItemType {
	var n registry.Node
	var s registry.Service
	var sr registry.Server
	var d registry.Dao
	var e registry.Edge
	var g registry.Generic
	if i.As(&n) {
		return pb.ItemType_NODE
	} else if i.As(&s) {
		return pb.ItemType_SERVICE
	} else if i.As(&sr) {
		return pb.ItemType_SERVER
	} else if i.As(&d) {
		return pb.ItemType_DAO
	} else if i.As(&e) {
		return pb.ItemType_EDGE
	} else if i.As(&g) {
		return g.Type()
	}
	return pb.ItemType_ALL
}
