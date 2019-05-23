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
			delete(t.createFiles, createEvent.Key)
			if _, exists := t.deletes[createEvent.Key]; exists {
				delete(t.deletes, createEvent.Key)
			}
			continue
		}
		if node.Uuid == "" && !model.IsFolderHiddenFile(node.Path) {
			t.refreshUUIDs[createEvent.Key] = createEvent
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
	for _, createEvent := range t.createFolders {
		if _, err := createEvent.NodeFromSource(ctx); err != nil {
			delete(t.createFolders, createEvent.Key)
			if _, exists := t.deletes[createEvent.Key]; exists {
				delete(t.deletes, createEvent.Key)
			}
			continue
		}
		if refresher != nil && existingFolders != nil {
			if _, ok := existingFolders[createEvent.Node.Uuid]; ok {
				// There is a duplicate - update Uuid
				refreshNode := createEvent.Node.Clone()
				refreshNode.Uuid = uuid.New()
				if newNode, err := refresher.UpdateFolderUuid(ctx, refreshNode); err == nil {
					createEvent.Node = newNode
				}
			}
		}
	}

}

func (t *TreePatch) detectFileMoves(ctx context.Context) {

	var possibleMoves []*Move
	for _, deleteEvent := range t.deletes {
		if dbNode, found := deleteEvent.NodeInTarget(ctx); found {
			deleteEvent.Node = dbNode
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, opCreate := range t.createFiles {
					if opCreate.Node != nil && opCreate.Node.Uuid != "" && opCreate.Node.Uuid == dbNode.Uuid {
						// Now remove from delete/create
						delete(t.deletes, deleteEvent.Key)
						delete(t.createFiles, opCreate.Key)
						// Enqueue Update if Etag differ
						if opCreate.Node.Etag != "" && opCreate.Node.Etag != dbNode.Etag {
							t.QueueOperation(&Operation{
								Type:      OpUpdateFile,
								Node:      dbNode,
								Key:       deleteEvent.Key,
								EventInfo: deleteEvent.EventInfo,
							})
						}
						// Enqueue in moves if path differ
						if opCreate.Node.Path != dbNode.Path {
							log.Logger(ctx).Debug("Existing leaf node with uuid and different path: safe move to ", opCreate.Node.ZapPath())
							opCreate.Node = dbNode
							opCreate.Type = OpMoveFile
							t.QueueOperation(opCreate)
						}
						found = true
						break
					}
				}
				// Look by Etag
				if !found {
					for _, createEvent := range t.createFiles {
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
			_, createFileExists := t.createFiles[deleteEvent.Key]
			_, createFolderExists := t.createFolders[deleteEvent.Key]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same patch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				var testLeaf bool
				if createFileExists {
					testLeaf = true
				} else {
					testLeaf = false
				}
				existNode, _ := t.Source().LoadNode(deleteEvent.EventInfo.CreateContext(ctx), deleteEvent.EventInfo.Path, testLeaf)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(t.createFiles, deleteEvent.Key)
					}
					if createFolderExists {
						delete(t.createFolders, deleteEvent.Key)
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(t.deletes, deleteEvent.Key)
		}
	}

	moves := sortClosestMoves(possibleMoves)
	for _, move := range moves {
		log.Logger(ctx).Debug("Picked closest move", zap.Object("move", move))
		// Remove from deletes/creates
		delete(t.deletes, move.deleteEvent.Key)
		delete(t.createFiles, move.createEvent.Key)
		// Enqueue in move if Paths differ
		if move.createEvent.Node.Path != move.dbNode.Path {
			move.createEvent.Node = move.dbNode
			move.createEvent.Type = OpMoveFile
			t.QueueOperation(move.createEvent)
		}
	}

}

func (t *TreePatch) detectFolderMoves(ctx context.Context) {
	sorted := t.sortedKeys(t.deletes)
	target, ok := model.AsPathSyncTarget(t.Target())

	for _, k := range sorted {
		deleteEvent, still := t.deletes[k]
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

		for _, opCreate := range t.createFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", opCreate.Node.Zap(), dbNode.Zap())
			if opCreate.Node.Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				opCreate.Node = dbNode
				opCreate.Type = OpMoveFolder
				t.QueueOperation(opCreate)
				delete(t.deletes, deleteEvent.Key)
				delete(t.createFolders, opCreate.Key)
				//t.pruneMovesByPath(ctx, deleteEvent.Key, opCreate.Key)
				break
			}
		}
	}

	//t.rescanMoves()
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

func (t *TreePatch) prune(ctx context.Context) {
	t.Walk(func(n *TreeNode) (prune bool) {
		if n.OpMoveTarget != nil {
			// Compare finally paths after all tree will be processed
			modSrc := n.ProcessedPath(true, true)
			modTarget := n.OpMoveTarget.ProcessedPath(true, true)
			if modSrc == modTarget {
				fmt.Println("Move will finally be identical, remove PathOperation", modSrc, modTarget)
				n.PathOperation = nil
				n.OpMoveTarget = nil

			}
		}
		if n.PathOperation != nil && n.PathOperation.Type == OpDelete && !n.IsLeaf() {
			fmt.Println("Delete folder found, remove all branch underneath!", n.Path)
			prune = true
		}
		return
	})
}
