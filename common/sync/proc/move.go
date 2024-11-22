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

package proc

import (
	"context"

	"github.com/pydio/cells/v5/common/sync/merger"
)

func (pr *Processor) processMove(ctx context.Context, operation merger.Operation, operationId string, pg chan int64) error {

	pg <- 1
	toPath := operation.GetRefPath()
	fromPath := operation.GetMoveOriginPath()

	if pr.Locker != nil {
		pr.Locker.LockFile(operation, toPath, operationId)
		pr.Locker.LockFile(operation, fromPath, operationId)
		defer pr.Locker.UnlockFile(operation, toPath)
		defer pr.Locker.UnlockFile(operation, fromPath)
	}

	return operation.Target().MoveNode(operation.CreateContext(pr.GlobalContext), fromPath, toPath)

}
