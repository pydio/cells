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

package frontend

import (
	"github.com/pydio/cells/v4/common/service"
)

var (
	loadedFs   *UnionHttpFs
	loadedPool *PluginsPool
)

// GetPluginsFS builds an HttpFs out of all the registered plugins boxes
func GetPluginsFS() *UnionHttpFs {
	if loadedFs == nil {
		loadedFs = NewUnionHttpFs(service.GetRegisteredPluginBoxes()...)
	}
	return loadedFs
}

// GetPluginsPool builds the pool out of all the registered plugins boxes
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

// HotReload empties internal fs and pool to trigger a reload at next call
// of GetPluginsFS or GetPluginsPool
func HotReload() {
	loadedFs = nil
	loadedPool = nil
}
