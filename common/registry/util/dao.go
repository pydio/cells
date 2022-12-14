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
	"golang.org/x/exp/maps"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
)

func ToProtoDao(d registry.Dao) *pb.Dao {
	if dd, ok := d.(*dao); ok {
		return dd.d
	}
	return &pb.Dao{
		Driver: d.Driver(),
		Dsn:    d.Dsn(),
	}
}

func ToDao(i *pb.Item, d *pb.Dao) registry.Dao {
	return &dao{I: i, d: d}
}

type dao struct {
	I *pb.Item
	d *pb.Dao
}

func (d *dao) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*dao); ok {
		return di.ID() == d.ID() && d.Name() == di.Name()
	}
	return false
}

func (d *dao) IsDeletable(m map[string]string) bool {
	return true
}

func (d *dao) IsMergeable(differ merger.Differ) bool {
	return d.ID() == differ.GetUniqueId()
}

func (d *dao) GetUniqueId() string {
	return d.ID()
}

func (d *dao) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (d *dao) Name() string {
	return d.I.Name
}

func (d *dao) ID() string {
	return d.I.Id
}

func (d *dao) Metadata() map[string]string {
	return maps.Clone(d.I.Metadata)
}

func (d *dao) As(i interface{}) bool {
	if ii, ok := i.(*registry.Dao); ok {
		*ii = d
		return true
	}
	return false
}

func (d *dao) Driver() string {
	return d.d.Driver
}

func (d *dao) Dsn() string {
	return d.d.Dsn
}
