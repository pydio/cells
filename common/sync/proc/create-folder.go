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
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

func (pr *Processor) processCreateFolder(cancelCtx context.Context, operation merger.Operation, operationId string, pg chan int64) error {

	pg <- 1
	localPath := operation.GetRefPath()
	ctx := operation.CreateContext(pr.GlobalContext)
	if pr.Locker != nil {
		pr.Locker.LockFile(operation, localPath, operationId)
		defer pr.Locker.UnlockFile(operation, localPath)
	}
	provider, ok1 := operation.Target().(model.UuidProvider)
	receiver, ok2 := operation.Source().(model.UuidReceiver)
	if ok1 && ok2 {
		if sameIdNode, e := provider.LoadNodeByUuid(ctx, operation.GetNode().GetUuid()); e == nil && sameIdNode != nil {
			pr.Logger().Info("Node found with same UUID", zap.String("local", localPath), sameIdNode.ZapPath())
			if sameIdNode.GetPath() == localPath {
				// This is the same node, it already exists! Ignore operation
				pr.Logger().Info("CreateFolder: already exists with same UUID, ignoring!", zap.String("refPath", operation.GetRefPath()))
				return nil
			}
			// This is a duplicate! We have to refresh .pydio content now
			newNode, er := receiver.UpdateNodeUuid(ctx, &tree.Node{Path: localPath})
			if er == nil {
				pr.Logger().Info("Refreshed folder on source as Uuid was a duplicate.")
				operation.SetNode(newNode)
			} else {
				pr.Logger().Info("Error while trying to refresh folder Uuid on source", zap.Error(er))
				return er
			}
		}
	}
	err := operation.Target().CreateNode(ctx, operation.GetNode(), false)
	if err != nil && strings.Contains(string(err.Error()), "Duplicate entry") {
		pr.Logger().Error("Duplicate UUID found, we should have refreshed uuids on source?", zap.Error(err))
	}
	return err
}
