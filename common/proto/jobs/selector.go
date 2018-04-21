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

package jobs

import (
	"context"

	"github.com/micro/go-micro/client"

	service "github.com/pydio/cells/common/service/proto"
)

type InputSelector interface {
	Select(cl client.Client, ctx context.Context, objects chan interface{}, done chan bool) error
	MultipleSelection() bool
}

type InputFilter interface {
	Filter(input ActionMessage) ActionMessage
}

func reduceQueryBooleans(results []bool, operation service.OperationType) bool {

	reduced := true
	if operation == service.OperationType_AND {
		// If one is false, it's false
		for _, b := range results {
			reduced = reduced && b
		}
	} else {
		// At least one must be true
		reduced = false
		for _, b := range results {
			reduced = reduced || b
			if b {
				break
			}
		}
	}
	return reduced
}
