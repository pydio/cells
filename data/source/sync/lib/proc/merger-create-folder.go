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

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

func (b *Merger) processCreateFolder(event *filters.BatchedEvent, operationId string) error {

	localPath := event.EventInfo.Path
	ctx := event.EventInfo.CreateContext(b.GlobalContext)
	dbNode, _ := event.Target.LoadNode(ctx, localPath)
	log.Logger(ctx).Debug("Should processs CreateFolder", zap.Any("dbNode", dbNode), zap.Any("event", event.Node))
	if dbNode == nil {
		b.lockFileTo(event, localPath, operationId)
		defer b.unlockFile(event, localPath)
		err := event.Target.CreateNode(ctx, &tree.Node{
			Path: localPath,
			Type: tree.NodeType_COLLECTION,
			Uuid: event.Node.Uuid,
		}, false)
		if err != nil && strings.Contains(string(err.Error()), "Duplicate entry") {
			b.Logger().Error("Duplicate UUID found, we should have refreshed uuids on source?", zap.Error(err))
			return err
		}
	} else {
		b.Logger().Debug("CreateFolder: already exists, ignoring!", zap.Any("e", event.EventInfo))
	}
	if event.Source.GetEndpointInfo().RequiresFoldersRescan && !event.EventInfo.ScanEvent {
		b.Logger().Info("Rescanning folder to be sure", zap.String("path", localPath))
		// Rescan folder content, events below may not have been detected
		var visit = func(path string, node *tree.Node, err error) {
			if err != nil {
				b.Logger().Error("Error while rescanning folder ", zap.Error(err))
				return
			}
			if !common.IsIgnoredFile(path) {
				scanEvent := common.NodeToEventInfo(ctx, path, node, common.EventCreate)
				scanEvent.OperationId = operationId
				b.RequeueChannels[event.Source] <- scanEvent
			}
			return
		}
		go event.Source.Walk(visit, event.EventInfo.Path)
	}

	return nil
}
