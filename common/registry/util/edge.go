/*
 * Copyright (c) 2019-2022 Abstrium SAS <team (at) pydio.com>
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
	"github.com/pydio/cells/v4/common/utils/merger"
	"golang.org/x/exp/maps"
)

func ToProtoEdge(e registry.Edge) *pb.Edge {
	if dd, ok := e.(*edge); ok {
		return dd.E
	}
	return &pb.Edge{
		Vertices: e.Vertices(),
	}
}

func ToEdge(i *pb.Item, e *pb.Edge) registry.Edge {
	return &edge{I: i, E: e}
}

type edge struct {
	I *pb.Item
	E *pb.Edge
}

func (d *edge) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*edge); ok {
		return di.ID() == d.ID()
	}
	return false
}

func (d *edge) IsDeletable(m map[string]string) bool {
	return true
}

func (d *edge) IsMergeable(differ merger.Differ) bool {
	return d.ID() == differ.GetUniqueId()
}

func (d *edge) GetUniqueId() string {
	return d.ID()
}

func (d *edge) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (d *edge) Name() string {
	return d.I.Name
}

func (d *edge) ID() string {
	return d.I.Id
}

func (d *edge) Metadata() map[string]string {
	return maps.Clone(d.I.Metadata)
}

func (d *edge) As(i interface{}) bool {
	if ii, ok := i.(*registry.Edge); ok {
		*ii = d
		return true
	}
	return false
}

func (d *edge) Vertices() []string {
	return d.E.Vertices
}
