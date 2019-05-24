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

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	"go.uber.org/zap"
)

func (b *FlatPatch) detectFileMoves(ctx context.Context) {

	var possibleMoves []*Move
	for _, deleteOp := range b.deletes {
		if dbNode, found := deleteOp.NodeInTarget(ctx); found {
			deleteOp.SetNode(dbNode)
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, createOp := range b.createFiles {
					if createOp.GetNode() != nil && createOp.GetNode().Uuid != "" && createOp.GetNode().Uuid == dbNode.Uuid {
						// Now remove from delete/create
						delete(b.deletes, deleteOp.GetRefPath())
						delete(b.createFiles, createOp.GetRefPath())
						// Enqueue in moves only if path differ
						if createOp.GetNode().Path != dbNode.Path {
							log.Logger(ctx).Debug("Existing leaf node with uuid and different path: safe move to ", createOp.GetNode().ZapPath())
							createOp.SetNode(dbNode)
							createOp.UpdateType(OpMoveFile)
							b.fileMoves[createOp.GetRefPath()] = createOp
						}
						found = true
						break
					}
				}
				// Look by Etag
				if !found {
					for _, createOp := range b.createFiles {
						if createOp.GetNode() != nil && createOp.GetNode().Etag == dbNode.Etag {
							log.Logger(ctx).Debug("Existing leaf node with same ETag: enqueuing possible move", createOp.GetNode().ZapPath())
							possibleMoves = append(possibleMoves, &Move{
								deleteOp: deleteOp,
								createOp: createOp,
								dbNode:   dbNode,
							})
						}
					}
				}
			}
		} else {
			_, createFileExists := b.createFiles[deleteOp.GetRefPath()]
			_, createFolderExists := b.createFolders[deleteOp.GetRefPath()]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same patch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				existNode, _ := deleteOp.NodeFromSource(ctx) // b.Source().LoadNode(deleteOp.CreateContext(ctx), deleteOp.EventInfo.Path, testLeaf)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(b.createFiles, deleteOp.GetRefPath())
					}
					if createFolderExists {
						delete(b.createFolders, deleteOp.GetRefPath())
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(b.deletes, deleteOp.GetRefPath())
		}
	}

	moves := sortClosestMoves(possibleMoves)
	for _, move := range moves {
		log.Logger(ctx).Debug("Picked closest move", zap.Object("move", move))
		// Remove from deletes/creates
		delete(b.deletes, move.deleteOp.GetRefPath())
		delete(b.createFiles, move.createOp.GetRefPath())
		// Enqueue in move if Paths differ
		if move.createOp.GetNode().Path != move.dbNode.Path {
			move.createOp.SetNode(move.dbNode)
			move.createOp.UpdateType(OpMoveFile)
			b.fileMoves[move.createOp.GetRefPath()] = move.createOp
		}
	}

}

func (b *FlatPatch) detectFolderMoves(ctx context.Context) {
	sorted := b.sortedKeys(b.deletes)
	target, ok := model.AsPathSyncTarget(b.Target())

	for _, k := range sorted {
		deleteEvent, still := b.deletes[k]
		if !still {
			// May have been deleted during the process
			continue
		}
		localPath := deleteEvent.GetRefPath()
		var dbNode *tree.Node
		if deleteEvent.GetNode() != nil {
			// If deleteEvent has node, it is already loaded from a snapshot,
			// no need to reload from target
			dbNode = deleteEvent.GetNode()
		} else if ok {
			dbNode, _ = target.LoadNode(deleteEvent.CreateContext(ctx), localPath)
			log.Logger(ctx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode == nil || dbNode.IsLeaf() {
			continue
		}

		for _, opCreate := range b.createFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", opCreate.GetNode().Zap(), dbNode.Zap())
			if opCreate.GetNode().Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				opCreate.SetNode(dbNode)
				opCreate.UpdateType(OpMoveFolder)
				b.folderMoves[opCreate.GetRefPath()] = opCreate
				b.pruneMovesByPath(ctx, deleteEvent.GetRefPath(), opCreate.GetRefPath())
				break
			}
		}
	}

	b.rescanMoves()
}

func (b *FlatPatch) pruneMovesByPath(ctx context.Context, from, to string) {
	// First remove folder from Creates/Deletes

	delete(b.deletes, from)
	delete(b.createFolders, to)
	fromPrefix := from + "/"
	// Now remove all children
	for p, deleteOp := range b.deletes {
		if !strings.HasPrefix(p, fromPrefix) {
			continue
		}
		targetPath := path.Join(to, strings.TrimPrefix(p, fromPrefix))
		if createOp, ok := b.createFiles[targetPath]; ok {
			if createOp.GetNode() != nil && deleteOp.GetNode() != nil && createOp.GetNode().Etag != deleteOp.GetNode().Etag {
				n := MostRecentNode(createOp.GetNode(), deleteOp.GetNode())
				n.Path = targetPath
				fakeEvent := model.NodeToEventInfo(ctx, targetPath, n, model.EventCreate)
				// Will require additional Transfer
				b.Enqueue(NewOpFromEvent(OpUpdateFile, fakeEvent, n))
			}
			delete(b.createFiles, targetPath)
			delete(b.deletes, p)
		} else if _, ok2 := b.createFolders[targetPath]; ok2 {
			delete(b.createFolders, targetPath)
			delete(b.deletes, p)
		} else if moveEvent, ok3 := b.folderMoves[targetPath]; ok3 && strings.HasPrefix(moveEvent.GetNode().Path, fromPrefix) {
			// An inner-folder was already detected as moved
			delete(b.folderMoves, targetPath)
		}
	}

}

func (b *FlatPatch) rescanMoves() {

	testPath := func(from, name string) bool {
		return len(name) > len(from) && strings.HasPrefix(name, strings.TrimRight(from, "/")+"/")
	}
	replacePath := func(from, to, name string) string {
		return strings.TrimRight(to, "/") + "/" + strings.TrimPrefix(name, strings.TrimRight(from, "/")+"/")
	}

	// Scan sub-moves
	for _, to := range b.sortedKeys(b.folderMoves) {
		from := b.folderMoves[to].GetNode().Path
		// Look for other moves that where originating from the initial folder
		for _, to2 := range b.sortedKeys(b.folderMoves) {
			from2 := b.folderMoves[to2].GetNode().Path
			if testPath(from, from2) {
				b.folderMoves[to2].GetNode().Path = replacePath(from, to, from2)
			}
		}
	}

	// Scan Deletes
	for to, move := range b.folderMoves {
		from := move.GetNode().Path
		for delKey, delEv := range b.deletes {
			if testPath(from, delKey) {
				newKey := replacePath(from, to, delKey)
				delete(b.deletes, delKey)
				delEv.UpdateRefPath(newKey)
				b.deletes[newKey] = delEv
			}
		}
	}

}
