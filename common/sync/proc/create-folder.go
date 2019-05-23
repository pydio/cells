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

package proc

import (
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

func (pr *Processor) processCreateFolder(operation *merger.Operation, operationId string, pg chan int64) error {

	pg <- 1
	localPath := operation.EventInfo.Path
	ctx := operation.EventInfo.CreateContext(pr.GlobalContext)
	dbNode, _ := operation.Target().LoadNode(ctx, localPath)
	if dbNode == nil {
		if pr.Connector != nil {
			pr.Connector.LockFile(operation, localPath, operationId)
			defer pr.Connector.UnlockFile(operation, localPath)
		}
		provider, ok1 := operation.Target().(model.UuidProvider)
		receiver, ok2 := operation.Source().(model.UuidReceiver)
		if ok1 && ok2 {
			if sameIdNode, e := provider.LoadNodeByUuid(ctx, operation.Node.Uuid); e == nil && sameIdNode != nil {
				// This is a duplicate! We have to refresh .pydio content now
				newNode, er := receiver.UpdateNodeUuid(ctx, &tree.Node{Path: localPath})
				if er == nil {
					pr.Logger().Info("Refreshed folder on source as Uuid was a duplicate.")
					operation.Node.Uuid = newNode.Uuid
				} else {
					pr.Logger().Info("Error while trying to refresh folder Uuid on source", zap.Error(er))
					return er
				}
			}
		}
		folderNode := &tree.Node{
			Path: localPath,
			Type: tree.NodeType_COLLECTION,
			Uuid: operation.Node.Uuid,
		}
		pr.Logger().Debug("Should process CreateFolder", folderNode.Zap("newNode"))
		err := operation.Target().CreateNode(ctx, folderNode, false)
		if err != nil && strings.Contains(string(err.Error()), "Duplicate entry") {
			pr.Logger().Error("Duplicate UUID found, we should have refreshed uuids on source?", zap.Error(err))
			return err
		}
	} else {
		pr.Logger().Debug("CreateFolder: already exists, ignoring!", zap.Any("e", operation.EventInfo))
	}
	if pr.Connector != nil && operation.Source().GetEndpointInfo().RequiresFoldersRescan && !operation.EventInfo.ScanEvent {
		pr.Logger().Info("Rescanning folder to be sure", zap.String("path", localPath))
		// Rescan folder content, events below may not have been detected
		var visit = func(path string, node *tree.Node, err error) {
			if err != nil {
				pr.Logger().Error("Error while rescanning folder ", zap.Error(err))
				return
			}
			if !model.IsIgnoredFile(path) {
				scanEvent := model.NodeToEventInfo(ctx, path, node, model.EventCreate)
				scanEvent.OperationId = operationId
				pr.Connector.Requeue(operation.Source(), scanEvent)
			}
			return
		}
		go operation.Source().Walk(visit, operation.EventInfo.Path, true)
	}

	return nil
}
