/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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

package rest

import (
	"math"

	"github.com/pydio/cells/v5/common/proto/rest"
)

// PopulatePagination computes next/previous pages and offsets
func PopulatePagination(offset, limit, total int32) *rest.Pagination {
	var totalPages, crtPage, nextOffset, prevOffset int32
	pageSize := limit
	totalPages = int32(math.Ceil(float64(total) / float64(pageSize)))
	crtPage = int32(math.Floor(float64(offset)/float64(pageSize))) + 1
	if crtPage > 1 {
		prevOffset = offset - pageSize
	}
	if crtPage < totalPages {
		nextOffset = offset + pageSize
	}
	return &rest.Pagination{
		Limit:         pageSize,
		CurrentOffset: offset,
		Total:         total,
		CurrentPage:   crtPage,
		TotalPages:    totalPages,
		NextOffset:    nextOffset,
		PrevOffset:    prevOffset,
	}

}
