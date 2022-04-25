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

package util

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

func ToProtoItems(ii []registry.Item) []*pb.Item {
	var items []*pb.Item

	for _, i := range ii {
		items = append(items, ToProtoItem(i))
	}

	return items
}

func ToProtoItem(i registry.Item) *pb.Item {
	item := &pb.Item{}

	switch v := i.(type) {
	case registry.Service:
		item.Item = &pb.Item_Service{Service: ToProtoService(v)}
	case registry.Node:
		item.Item = &pb.Item_Node{Node: ToProtoNode(v)}
	case registry.Dao:
		item.Item = &pb.Item_Dao{Dao: ToProtoDao(v)}
	case registry.Edge:
		item.Item = &pb.Item_Edge{Edge: ToProtoEdge(v)}
	case registry.Generic:
		item.Item = &pb.Item_Generic{Generic: ToProtoGeneric(v)}
	}

	return item
}

func ToItem(s *pb.Item) registry.Item {
	switch v := s.Item.(type) {
	case *pb.Item_Service:
		return ToService(v.Service)
	case *pb.Item_Node:
		return ToNode(v.Node)
	case *pb.Item_Dao:
		return ToDao(v.Dao)
	case *pb.Item_Edge:
		return ToEdge(v.Edge)
	case *pb.Item_Generic:
		return ToGeneric(v.Generic)
	}

	return nil
}
