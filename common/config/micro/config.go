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

package micro

import (
	"github.com/pydio/go-os/config"
)

// wrapper around micro config that rewrites to the source if possible
type writableConfig struct {
	config.Config
}

// Sets internal cached value
func (w *writableConfig) Set(val interface{}, path ...string) {
	w.Config.Set(val, path...)

	b := w.Config.Bytes()

	// Setting data in all sources available if we have write access
	for _, source := range w.Config.Options().Sources {
		sw, ok := source.(Writer)
		if ok {
			sw.Write(&config.ChangeSet{Data: b})
		}
	}
}

// Deletes internal cached value
func (w *writableConfig) Del(path ...string) {
	w.Config.Del(path...)

	b := w.Config.Bytes()

	// Setting data in all sources available if we have write access
	for _, source := range w.Config.Options().Sources {
		sw, ok := source.(Writer)
		if ok {
			sw.Write(&config.ChangeSet{Data: b})
		}
	}
}
