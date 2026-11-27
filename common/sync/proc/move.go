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

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
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

	err := operation.Target().MoveNode(operation.CreateContext(pr.GlobalContext), fromPath, toPath)
	if err != nil && model.IsNotFound(err) && operation.Type() == merger.OpMoveFile {
		// The source is missing on the target (e.g. the echo of a move whose origin was already renamed here): the
		// move can never succeed, transfer the destination from the source instead.
		if n, e := operation.Source().LoadNode(ctx, toPath); e == nil && n.IsLeaf() {
			pr.Logger().Info("Move source is missing on target, transferring destination instead", zap.String("from", fromPath), zap.String("to", toPath))
			return pr.processCreateFile(ctx, &moveAsCreate{Operation: operation, node: n}, operationId, pg)
		}
	}
	return err

}

// moveAsCreate processes a file move as the creation of its destination, with the node loaded from the source
type moveAsCreate struct {
	merger.Operation
	node tree.N
}

func (m *moveAsCreate) GetNode() tree.N {
	return m.node
}

func (m *moveAsCreate) Type() merger.OperationType {
	return merger.OpCreateFile
}
