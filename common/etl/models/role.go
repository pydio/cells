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

package models

import "github.com/pydio/cells/v4/common/proto/idm"

type Role idm.Role

func (r *Role) Equals(differ Differ) bool {
	// If not Team Role, say Equal=true to avoid overriding existing
	return !r.IsTeam
}

func (r *Role) IsDeletable(m map[string]string) bool {
	return false
}

func (r *Role) IsMergeable(d Differ) bool {
	return r.Uuid == (d).(*Role).Uuid
}

func (r *Role) GetUniqueId() string {
	return r.Uuid
}

func (r *Role) Merge(differ Differ, params map[string]string) (Differ, error) {
	// Return target
	return differ, nil
}
