/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package frontend

import (
	"github.com/pydio/packr"
)

var (
	registry   []PluginBox
	loadedFs   *UnionHttpFs
	loadedPool *PluginsPool
)

type PluginBox struct {
	Box     packr.Box
	Exposes []string
}

func RegisterPluginBoxes(boxes ...PluginBox) {

	if registry == nil {
		registry = make([]PluginBox, len(boxes))
	}

	registry = append(registry, boxes...)

}

func GetRegisteredPluginBoxes() []PluginBox {

	if registry == nil {
		return []PluginBox{}
	}

	return registry

}

func GetPluginsFS() *UnionHttpFs {
	if loadedFs == nil {
		loadedFs = NewUnionHttpFs(GetRegisteredPluginBoxes()...)
	}
	return loadedFs
}

func GetPluginsPool() (*PluginsPool, error) {
	if loadedPool == nil {
		pool := NewPluginsPool()
		if e := pool.Load(GetPluginsFS()); e != nil {
			return nil, e
		} else {
			loadedPool = pool
		}
	}
	return loadedPool, nil
}
