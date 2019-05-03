/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package filters

import (
	"context"
	"path"
	"sort"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/mtree"
	"github.com/pydio/cells/data/source/sync/lib/common"
)

type Move struct {
	deleteEvent *BatchedEvent
	createEvent *BatchedEvent
	dbNode      *tree.Node
}

func (m *Move) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if m == nil {
		return nil
	}
	encoder.AddString("From", m.deleteEvent.Key)
	encoder.AddString("To", m.createEvent.Key)
	encoder.AddObject("DbNode", m.dbNode)
	return nil
}

func (m *Move) Distance() int {
	sep := "/"
	pref := mtree.CommonPrefix(sep[0], m.deleteEvent.Key, m.createEvent.Key)
	return len(strings.Split(pref, sep))
}

func sortClosestMoves(logCtx context.Context, possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	for _, m := range possibleMoves {
		source := m.deleteEvent.Key
		byT, ok := greatestSource[source]
		for _, m2 := range possibleMoves {
			target2 := m2.deleteEvent.Key
			if target2 == source {
				if !ok || m2.Distance() > byT.Distance() {
					greatestSource[source] = m2
				}
			}
		}
	}

	// Dedup by target
	greatestTarget := make(map[string]*Move)
	for _, m := range greatestSource {
		byT, ok := greatestTarget[m.createEvent.Key]
		if !ok || m.Distance() > byT.Distance() {
			greatestTarget[m.createEvent.Key] = m
		}
	}

	for target, m := range greatestTarget {
		log.Logger(logCtx).Debug("Greatest Move", zap.Any("k", target), zap.Any("from", m.deleteEvent.Key), zap.Any("to", m.createEvent.Key))
		moves = append(moves, m)
	}

	return
}

func detectFolderMoves(logCtx context.Context, batch *Batch, target common.PathSyncTarget) {
	sorted := sortedKeys(batch.Deletes)
	for _, k := range sorted {
		deleteEvent, still := batch.Deletes[k]
		if !still {
			// May have been deleted during the process
			continue
		}
		localPath := deleteEvent.EventInfo.Path
		var dbNode *tree.Node
		if deleteEvent.Node != nil {
			// If deleteEvent has node, it is already loaded from a snapshot,
			// no need to reload from target
			dbNode = deleteEvent.Node
		} else {
			dbNode, _ = target.LoadNode(deleteEvent.EventInfo.CreateContext(logCtx), localPath)
			log.Logger(logCtx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode == nil || dbNode.IsLeaf() {
			continue
		}

		for _, createEvent := range batch.CreateFolders {
			log.Logger(logCtx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", createEvent.Node.Zap(), dbNode.Zap())
			if createEvent.Node.Uuid == dbNode.Uuid {
				log.Logger(logCtx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				createEvent.Node = dbNode
				batch.FolderMoves[createEvent.Key] = createEvent
				pruneMovesByPath(deleteEvent.Key, createEvent.Key, batch)
				break
			}
		}
	}
}

func pruneMovesByPath(from, to string, batch *Batch) {
	// First remove folder from Creates/Deletes

	delete(batch.Deletes, from)
	delete(batch.CreateFolders, to)
	fromPrefix := from + "/"
	// Now remove all children
	for p, _ := range batch.Deletes {
		if !strings.HasPrefix(p, fromPrefix) {
			continue
		}
		targetPath := path.Join(to, strings.TrimPrefix(p, fromPrefix))
		if _, ok := batch.CreateFiles[targetPath]; ok {
			delete(batch.CreateFiles, targetPath)
			delete(batch.Deletes, p)
		} else if _, ok2 := batch.CreateFolders[targetPath]; ok2 {
			delete(batch.CreateFolders, targetPath)
			delete(batch.Deletes, p)
		} else if moveEvent, ok3 := batch.FolderMoves[targetPath]; ok3 && strings.HasPrefix(moveEvent.Node.Path, fromPrefix) {
			// An inner-folder was already detected as moved
			delete(batch.FolderMoves, targetPath)
		}
	}

}

func sortedKeys(data map[string]*BatchedEvent) []string {
	out := make([]string, len(data))
	for k, _ := range data {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
