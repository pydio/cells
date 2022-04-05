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

package service

import "github.com/pydio/cells/v4/common/etl/models"

func (s *service) Equals(differ models.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *service) IsDeletable(m map[string]string) bool {
	return true
}

func (s *service) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *service) GetUniqueId() string {
	return s.ID()
}

func (s *service) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
	// Return target
	return differ, nil
}
