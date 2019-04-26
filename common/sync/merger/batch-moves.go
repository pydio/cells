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

package merger

import (
	"context"
	"path"
	"sort"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/utils/mtree"
)

type Move struct {
	deleteEvent *BatchEvent
	createEvent *BatchEvent
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

func (b *Batch) sortClosestMoves(logCtx context.Context, possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	targets := make(map[string]bool)
	for _, m := range possibleMoves {
		source := m.deleteEvent.Key
		byT, ok := greatestSource[source]
		for _, m2 := range possibleMoves {
			source2 := m2.deleteEvent.Key
			if source2 != source {
				continue
			}
			if _, alreadyUsed := targets[m2.createEvent.Key]; alreadyUsed {
				continue
			}
			if !ok || m2.Distance() > byT.Distance() {
				greatestSource[source] = m2
			}
		}
		if m, ok := greatestSource[source]; ok {
			targets[m.createEvent.Key] = true
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

	for _, m := range greatestTarget {
		moves = append(moves, m)
	}

	return
}

func (b *Batch) detectFolderMoves(ctx context.Context) {
	sorted := b.sortedKeys(b.Deletes)
	target, ok := model.AsPathSyncTarget(b.Target)

	for _, k := range sorted {
		deleteEvent, still := b.Deletes[k]
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
		} else if ok {
			dbNode, _ = target.LoadNode(deleteEvent.EventInfo.CreateContext(ctx), localPath)
			log.Logger(ctx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode == nil || dbNode.IsLeaf() {
			continue
		}

		for _, createEvent := range b.CreateFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", createEvent.Node.Zap(), dbNode.Zap())
			if createEvent.Node.Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				createEvent.Node = dbNode
				b.FolderMoves[createEvent.Key] = createEvent
				b.pruneMovesByPath(ctx, deleteEvent.Key, createEvent.Key)
				break
			}
		}
	}

	b.rescanMoves()
}

func (b *Batch) pruneMovesByPath(ctx context.Context, from, to string) {
	// First remove folder from Creates/Deletes

	delete(b.Deletes, from)
	delete(b.CreateFolders, to)
	fromPrefix := from + "/"
	// Now remove all children
	for p, deleteEvent := range b.Deletes {
		if !strings.HasPrefix(p, fromPrefix) {
			continue
		}
		targetPath := path.Join(to, strings.TrimPrefix(p, fromPrefix))
		if createEvent, ok := b.CreateFiles[targetPath]; ok {
			if createEvent.Node != nil && deleteEvent.Node != nil && createEvent.Node.Etag != deleteEvent.Node.Etag {
				n := MostRecentNode(createEvent.Node, deleteEvent.Node)
				n.Path = targetPath
				// Will require additional Transfer
				b.UpdateFiles[targetPath] = &BatchEvent{
					Key:       targetPath,
					Node:      n,
					Batch:     b,
					EventInfo: model.NodeToEventInfo(ctx, targetPath, n, model.EventCreate),
				}
			}
			delete(b.CreateFiles, targetPath)
			delete(b.Deletes, p)
		} else if _, ok2 := b.CreateFolders[targetPath]; ok2 {
			delete(b.CreateFolders, targetPath)
			delete(b.Deletes, p)
		} else if moveEvent, ok3 := b.FolderMoves[targetPath]; ok3 && strings.HasPrefix(moveEvent.Node.Path, fromPrefix) {
			// An inner-folder was already detected as moved
			delete(b.FolderMoves, targetPath)
		}
	}

}

func (b *Batch) rescanMoves() {

	testPath := func(from, name string) bool {
		return len(name) > len(from) && strings.HasPrefix(name, strings.TrimRight(from, "/")+"/")
	}
	replacePath := func(from, to, name string) string {
		return strings.TrimRight(to, "/") + "/" + strings.TrimPrefix(name, strings.TrimRight(from, "/")+"/")
	}

	// Scan sub-moves
	for _, to := range b.sortedKeys(b.FolderMoves) {
		from := b.FolderMoves[to].Node.Path
		// Look for other moves that where originating from the initial folder
		for _, to2 := range b.sortedKeys(b.FolderMoves) {
			from2 := b.FolderMoves[to2].Node.Path
			if testPath(from, from2) {
				b.FolderMoves[to2].Node.Path = replacePath(from, to, from2)
			}
		}
	}

	// Scan Deletes
	for to, move := range b.FolderMoves {
		from := move.Node.Path
		for delKey, delEv := range b.Deletes {
			if testPath(from, delKey) {
				newKey := replacePath(from, to, delKey)
				delete(b.Deletes, delKey)
				delEv.Key = newKey
				delEv.Node.Path = newKey
				delEv.EventInfo.Path = newKey
				b.Deletes[newKey] = delEv
			}
		}
	}

}

func (b *Batch) sortedKeys(data map[string]*BatchEvent) []string {
	var out []string
	for k, _ := range data {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
