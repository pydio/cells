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
	"fmt"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common/proto/tree"

	"github.com/pydio/cells/common/sync/model"
)

func (t *TreePatch) filterCreateFiles(ctx context.Context) {

	checksumProvider := t.Source().(model.ChecksumProvider)

	for _, createEvent := range t.createFiles {
		node, err := createEvent.NodeFromSource(ctx)
		if err != nil {
			delete(t.createFiles, createEvent.GetRefPath())
			if _, exists := t.deletes[createEvent.GetRefPath()]; exists {
				delete(t.deletes, createEvent.GetRefPath())
			}
			continue
		}
		if node.Uuid == "" && !model.IsFolderHiddenFile(node.Path) {
			t.refreshUUIDs[createEvent.GetRefPath()] = createEvent
		}
		if model.NodeRequiresChecksum(node) && checksumProvider != nil {
			checksumProvider.ComputeChecksum(node)
		}
	}

}

func (t *TreePatch) filterCreateFolders(ctx context.Context) {

	var existingFolders map[string][]*tree.Node
	var refresher model.UuidFoldersRefresher
	var ok bool
	if refresher, ok = t.Source().(model.UuidFoldersRefresher); ok && len(t.createFolders) > 0 {
		if c, e := refresher.ExistingFolders(ctx); e == nil {
			existingFolders = c
		}
	}
	for _, createOp := range t.createFolders {
		if _, err := createOp.NodeFromSource(ctx); err != nil {
			delete(t.createFolders, createOp.GetRefPath())
			if _, exists := t.deletes[createOp.GetRefPath()]; exists {
				delete(t.deletes, createOp.GetRefPath())
			}
			continue
		}
		if refresher != nil && existingFolders != nil {
			if _, ok := existingFolders[createOp.GetNode().Uuid]; ok {
				// There is a duplicate - update Uuid
				refreshNode := createOp.GetNode().Clone()
				refreshNode.Uuid = uuid.New()
				if newNode, err := refresher.UpdateFolderUuid(ctx, refreshNode); err == nil {
					createOp.SetNode(newNode)
				}
			}
		}
	}

}

func (t *TreePatch) detectFileMoves(ctx context.Context) {

	var possibleMoves []*Move
	for _, deleteOp := range t.deletes {
		if dbNode, found := deleteOp.NodeInTarget(ctx); found {
			deleteOp.SetNode(dbNode)
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, opCreate := range t.createFiles {
					if opCreate.GetNode() != nil && opCreate.GetNode().Uuid != "" && opCreate.GetNode().Uuid == dbNode.Uuid {
						// Now remove from delete/create
						delete(t.deletes, deleteOp.GetRefPath())
						delete(t.createFiles, opCreate.GetRefPath())
						// Enqueue Update if Etag differ
						if opCreate.GetNode().Etag != "" && opCreate.GetNode().Etag != dbNode.Etag {
							updateOp := deleteOp.Clone(OpUpdateFile)
							t.QueueOperation(updateOp)
						}
						// Enqueue in moves if path differ
						if opCreate.GetNode().Path != dbNode.Path {
							log.Logger(ctx).Debug("Existing leaf node with uuid and different path: safe move to ", opCreate.GetNode().ZapPath())
							opCreate.SetNode(dbNode)
							opCreate.UpdateType(OpMoveFile)
							t.QueueOperation(opCreate)
						}
						found = true
						break
					}
				}
				// Look by Etag
				if !found {
					for _, createOp := range t.createFiles {
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
			_, createFileExists := t.createFiles[deleteOp.GetRefPath()]
			_, createFolderExists := t.createFolders[deleteOp.GetRefPath()]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same patch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				existNode, _ := deleteOp.NodeFromSource(ctx)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(t.createFiles, deleteOp.GetRefPath())
					}
					if createFolderExists {
						delete(t.createFolders, deleteOp.GetRefPath())
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(t.deletes, deleteOp.GetRefPath())
		}
	}

	moves := sortClosestMoves(possibleMoves)
	for _, move := range moves {
		log.Logger(ctx).Debug("Picked closest move", zap.Object("move", move))
		// Remove from deletes/creates
		delete(t.deletes, move.deleteOp.GetRefPath())
		delete(t.createFiles, move.createOp.GetRefPath())
		// Enqueue in move if Paths differ
		if move.createOp.GetNode().Path != move.dbNode.Path {
			move.createOp.SetNode(move.dbNode)
			move.createOp.UpdateType(OpMoveFile)
			t.QueueOperation(move.createOp)
		}
	}

}

func (t *TreePatch) detectFolderMoves(ctx context.Context) {
	sorted := t.sortedKeys(t.deletes)
	target, ok := model.AsPathSyncTarget(t.Target())

	for _, k := range sorted {
		deleteOp, still := t.deletes[k]
		if !still {
			// May have been deleted during the process
			continue
		}
		localPath := deleteOp.GetRefPath()
		var dbNode *tree.Node
		if deleteOp.GetNode() != nil {
			// If deleteEvent has node, it is already loaded from a snapshot,
			// no need to reload from target
			dbNode = deleteOp.GetNode()
		} else if ok {
			dbNode, _ = target.LoadNode(deleteOp.CreateContext(ctx), localPath)
			log.Logger(ctx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode == nil || dbNode.IsLeaf() {
			continue
		}

		for _, opCreate := range t.createFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", opCreate.GetNode().Zap(), dbNode.Zap())
			if opCreate.GetNode().Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				opCreate.SetNode(dbNode)
				opCreate.UpdateType(OpMoveFolder)
				t.QueueOperation(opCreate)
				delete(t.deletes, deleteOp.GetRefPath())
				delete(t.createFolders, opCreate.GetRefPath())
				break
			}
		}
	}
}

func (t *TreePatch) enqueueRemaining(ctx context.Context) {
	for _, c := range t.createFolders {
		t.QueueOperation(c)
	}
	for _, c := range t.createFiles {
		t.QueueOperation(c)
	}
	for _, c := range t.deletes {
		t.QueueOperation(c)
	}
}

func (t *TreePatch) rescanFoldersIfRequired(ctx context.Context) {
	if t.options.NoRescan || !t.Source().GetEndpointInfo().RequiresFoldersRescan {
		return
	}
	var newFolders bool
	var newFiles bool
	t.WalkToFirstOperations(OpCreateFolder, func(op Operation) {
		if op.IsScanEvent() {
			return
		}
		log.Logger(ctx).Info("Rescanning folder to be sure", zap.String("patch", t.Target().GetEndpointInfo().URI), zap.String("path", op.GetRefPath()))
		// Rescan folder content, events below may not have been detected
		var visit = func(path string, node *tree.Node, err error) {
			if err != nil {
				log.Logger(ctx).Error("Error while rescanning folder ", zap.Error(err))
				return
			}
			if !model.IsIgnoredFile(path) {
				scanEvent := model.NodeToEventInfo(ctx, path, node, model.EventCreate)
				opType := OpCreateFolder
				if node.IsLeaf() {
					newFiles = true
					opType = OpCreateFile
				} else {
					newFolders = true
				}
				t.Enqueue(NewOperation(opType, scanEvent, node))
			}
			return
		}
		t.Source().Walk(visit, op.GetRefPath(), true)
	})
	// Re-perform filters on new resources
	if newFolders {
		t.filterCreateFolders(ctx)
	}
	if newFiles {
		t.filterCreateFiles(ctx)
	}
	if newFolders || newFiles {
		t.enqueueRemaining(ctx)
	}
}

func (t *TreePatch) prune(ctx context.Context) {
	t.Walk(func(n *TreeNode) (prune bool) {
		if n.PruneIdentityPathOperation() {
			log.Logger(ctx).Debug("Pruning node operation as it will result to identiy", zap.Any("n", n))
		}
		if n.PathOperation != nil && n.PathOperation.Type() == OpDelete && !n.IsLeaf() {
			fmt.Println("Delete folder found, remove all branch underneath!", n.Path)
			prune = true
		}
		return
	})
}
