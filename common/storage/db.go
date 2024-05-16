/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package storage

import (
	"context"
)

type Storage interface {
	Get(ctx context.Context, out interface{}) (provides bool, er error)
	CloseConns(ctx context.Context, clean ...bool) (er error)
}

var storages []Storage

func Get(ctx context.Context, out interface{}) (provides bool, er error) {
	for _, store := range storages {
		if ok, er := store.Get(ctx, out); ok {
			return true, er
		}
	}

	return false, nil
}
