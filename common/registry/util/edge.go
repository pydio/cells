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
	"github.com/pydio/cells/v4/common/utils/merger"
)

func ToProtoGeneric(e registry.Generic) *pb.Generic {
	if dd, ok := e.(*generic); ok {
		return dd.e
	}
	return &pb.Generic{
		Id:       e.ID(),
		Name:     e.Name(),
		Metadata: e.Metadata(),
	}
}

func ToGeneric(e *pb.Generic) registry.Generic {
	return &generic{e}
}

type generic struct {
	e *pb.Generic
}

func (c *generic) Generic() {}

func (d *generic) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*generic); ok {
		return di.Name() == d.Name() && di.ID() == d.ID()
	}
	return false
}

func (d *generic) IsDeletable(m map[string]string) bool {
	return true
}

func (d *generic) IsMergeable(differ merger.Differ) bool {
	return d.ID() == differ.GetUniqueId()
}

func (d *generic) GetUniqueId() string {
	return d.ID()
}

func (d *generic) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (d *generic) Name() string {
	return d.e.Name
}

func (d *generic) ID() string {
	return d.e.Id
}

func (d *generic) Metadata() map[string]string {
	return d.e.Metadata
}

func (d *generic) As(i interface{}) bool {
	if ii, ok := i.(*registry.Generic); ok {
		*ii = d
		return true
	}
	return false
}
