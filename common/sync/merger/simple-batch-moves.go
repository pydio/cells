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
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/utils/mtree"
)

type Move struct {
	deleteEvent *Operation
	createEvent *Operation
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

func (b *SimpleBatch) detectFileMoves(ctx context.Context) {

	var possibleMoves []*Move
	for _, deleteEvent := range b.deletes {
		if dbNode, found := deleteEvent.NodeInTarget(ctx); found {
			deleteEvent.Node = dbNode
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, createEvent := range b.createFiles {
					if createEvent.Node != nil && createEvent.Node.Uuid != "" && createEvent.Node.Uuid == dbNode.Uuid {
						log.Logger(ctx).Debug("Existing leaf node with Uuid: safe move to ", createEvent.Node.ZapPath())
						createEvent.Node = dbNode
						b.fileMoves[createEvent.Key] = createEvent
						delete(b.deletes, deleteEvent.Key)
						delete(b.createFiles, createEvent.Key)
						found = true
						break
					}
				}
				// Look by Etag
				if !found {
					for _, createEvent := range b.createFiles {
						if createEvent.Node != nil && createEvent.Node.Etag == dbNode.Etag {
							log.Logger(ctx).Debug("Existing leaf node with same ETag: enqueuing possible move", createEvent.Node.ZapPath())
							possibleMoves = append(possibleMoves, &Move{
								deleteEvent: deleteEvent,
								createEvent: createEvent,
								dbNode:      dbNode,
							})
						}
					}
				}
			}
		} else {
			_, createFileExists := b.createFiles[deleteEvent.Key]
			_, createFolderExists := b.createFolders[deleteEvent.Key]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same batch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				var testLeaf bool
				if createFileExists {
					testLeaf = true
				} else {
					testLeaf = false
				}
				existNode, _ := b.Source().LoadNode(deleteEvent.EventInfo.CreateContext(ctx), deleteEvent.EventInfo.Path, testLeaf)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(b.createFiles, deleteEvent.Key)
					}
					if createFolderExists {
						delete(b.createFolders, deleteEvent.Key)
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(b.deletes, deleteEvent.Key)
		}
	}

	moves := b.sortClosestMoves(ctx, possibleMoves)
	for _, move := range moves {
		log.Logger(ctx).Debug("Picked closest move", zap.Object("move", move))
		move.createEvent.Node = move.dbNode
		b.fileMoves[move.createEvent.Key] = move.createEvent
		delete(b.deletes, move.deleteEvent.Key)
		delete(b.createFiles, move.createEvent.Key)
	}

}

func (b *SimpleBatch) sortClosestMoves(logCtx context.Context, possibleMoves []*Move) (moves []*Move) {

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

func (b *SimpleBatch) detectFolderMoves(ctx context.Context) {
	sorted := b.sortedKeys(b.deletes)
	target, ok := model.AsPathSyncTarget(b.Target())

	for _, k := range sorted {
		deleteEvent, still := b.deletes[k]
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

		for _, createEvent := range b.createFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", createEvent.Node.Zap(), dbNode.Zap())
			if createEvent.Node.Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				createEvent.Node = dbNode
				b.folderMoves[createEvent.Key] = createEvent
				b.pruneMovesByPath(ctx, deleteEvent.Key, createEvent.Key)
				break
			}
		}
	}

	b.rescanMoves()
}

func (b *SimpleBatch) pruneMovesByPath(ctx context.Context, from, to string) {
	// First remove folder from Creates/Deletes

	delete(b.deletes, from)
	delete(b.createFolders, to)
	fromPrefix := from + "/"
	// Now remove all children
	for p, deleteEvent := range b.deletes {
		if !strings.HasPrefix(p, fromPrefix) {
			continue
		}
		targetPath := path.Join(to, strings.TrimPrefix(p, fromPrefix))
		if createEvent, ok := b.createFiles[targetPath]; ok {
			if createEvent.Node != nil && deleteEvent.Node != nil && createEvent.Node.Etag != deleteEvent.Node.Etag {
				n := MostRecentNode(createEvent.Node, deleteEvent.Node)
				n.Path = targetPath
				// Will require additional Transfer
				b.updateFiles[targetPath] = &Operation{
					Key:       targetPath,
					Node:      n,
					Batch:     b,
					EventInfo: model.NodeToEventInfo(ctx, targetPath, n, model.EventCreate),
				}
			}
			delete(b.createFiles, targetPath)
			delete(b.deletes, p)
		} else if _, ok2 := b.createFolders[targetPath]; ok2 {
			delete(b.createFolders, targetPath)
			delete(b.deletes, p)
		} else if moveEvent, ok3 := b.folderMoves[targetPath]; ok3 && strings.HasPrefix(moveEvent.Node.Path, fromPrefix) {
			// An inner-folder was already detected as moved
			delete(b.folderMoves, targetPath)
		}
	}

}

func (b *SimpleBatch) rescanMoves() {

	testPath := func(from, name string) bool {
		return len(name) > len(from) && strings.HasPrefix(name, strings.TrimRight(from, "/")+"/")
	}
	replacePath := func(from, to, name string) string {
		return strings.TrimRight(to, "/") + "/" + strings.TrimPrefix(name, strings.TrimRight(from, "/")+"/")
	}

	// Scan sub-moves
	for _, to := range b.sortedKeys(b.folderMoves) {
		from := b.folderMoves[to].Node.Path
		// Look for other moves that where originating from the initial folder
		for _, to2 := range b.sortedKeys(b.folderMoves) {
			from2 := b.folderMoves[to2].Node.Path
			if testPath(from, from2) {
				b.folderMoves[to2].Node.Path = replacePath(from, to, from2)
			}
		}
	}

	// Scan Deletes
	for to, move := range b.folderMoves {
		from := move.Node.Path
		for delKey, delEv := range b.deletes {
			if testPath(from, delKey) {
				newKey := replacePath(from, to, delKey)
				delete(b.deletes, delKey)
				delEv.Key = newKey
				delEv.Node.Path = newKey
				delEv.EventInfo.Path = newKey
				b.deletes[newKey] = delEv
			}
		}
	}

}
