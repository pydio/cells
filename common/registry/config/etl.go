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
	"github.com/pydio/cells/v4/common/etl"
	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/registry"
)

func init() {
	etl.RegisterConverter(&converter{})
}

type converter struct{}

func (c *converter) Convert(i interface{}) ([]models.Differ, bool) {
	var res []models.Differ

	items, ok := i.([]registry.Item)
	if !ok {
		return nil, false
	}

	for _, i := range items {
		res = append(res, i.(models.Differ))
	}

	return res, true
}

type Diff struct {
	// List of acl to be updated
	update []registry.Item

	// List of acl to be deleted
	delete []registry.Item

	// List of acl to be created
	create []registry.Item
}

func (a *Diff) Add(vs ...interface{}) {
	for _, v := range vs {
		a.create = append(a.create, v.(registry.Item))
	}
}
func (a *Diff) Update(vs ...interface{}) {
	for _, v := range vs {
		a.update = append(a.update, v.(registry.Item))
	}
}
func (a *Diff) Delete(vs ...interface{}) {
	for _, v := range vs {
		a.delete = append(a.delete, v.(registry.Item))
	}
}

func (a *Diff) ToAdd() []interface{} {
	var res []interface{}

	for _, v := range a.create {
		res = append(res, v)
	}
	return res
}
func (a *Diff) ToUpdate() []interface{} {
	var res []interface{}

	for _, v := range a.update {
		res = append(res, v)
	}
	return res
}
func (a *Diff) ToDelete() []interface{} {
	var res []interface{}

	for _, v := range a.delete {
		res = append(res, v)
	}
	return res
}
