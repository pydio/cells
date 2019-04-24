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

	common2 "github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type Batch struct {
	Source                 model.PathSyncSource
	Target                 model.PathSyncTarget
	CreateFiles            map[string]*BatchEvent
	CreateFolders          map[string]*BatchEvent
	Deletes                map[string]*BatchEvent
	FileMoves              map[string]*BatchEvent
	FolderMoves            map[string]*BatchEvent
	RefreshFilesUuid       map[string]*BatchEvent
	SessionProvider        model.SessionProvider
	SessionProviderContext context.Context
	StatusChan             chan BatchProcessStatus
	DoneChan               chan bool
}

type BatchEvent struct {
	EventInfo model.EventInfo
	Node      *tree.Node
	Key       string
	Batch     *Batch
}

func (b *BatchEvent) Source() model.PathSyncSource {
	return b.Batch.Source
}

func (b *BatchEvent) Target() model.PathSyncTarget {
	return b.Batch.Target
}

type BatchProcessStatus struct {
	IsError      bool
	StatusString string
	Progress     float32
}

func NewBatch(source model.PathSyncSource, target model.PathSyncTarget) (batch *Batch) {
	batch = &Batch{
		Source:           source,
		Target:           target,
		CreateFiles:      make(map[string]*BatchEvent),
		CreateFolders:    make(map[string]*BatchEvent),
		Deletes:          make(map[string]*BatchEvent),
		FileMoves:        make(map[string]*BatchEvent),
		FolderMoves:      make(map[string]*BatchEvent),
		RefreshFilesUuid: make(map[string]*BatchEvent),
	}
	return batch
}

func (b *Batch) Filter(ctx context.Context) {

	checksumProvider := b.Source.(model.ChecksumProvider)

	for _, createEvent := range b.CreateFiles {
		var node *tree.Node
		var err error
		if createEvent.EventInfo.ScanEvent && createEvent.EventInfo.ScanSourceNode != nil {
			log.Logger(ctx).Debug("Create File", node.Zap())
			node = createEvent.EventInfo.ScanSourceNode
		} else {
			// Todo : Feed node from event instead of calling LoadNode() again?
			node, err = b.Source.LoadNode(createEvent.EventInfo.CreateContext(ctx), createEvent.EventInfo.Path)
			if err == nil {
				log.Logger(ctx).Debug("Load File", node.Zap())
			}
		}
		if err != nil {
			delete(b.CreateFiles, createEvent.Key)
			if _, exists := b.Deletes[createEvent.Key]; exists {
				delete(b.Deletes, createEvent.Key)
			}
		} else {
			createEvent.Node = node
			if node.Uuid == "" && path.Base(node.Path) != common2.PYDIO_SYNC_HIDDEN_FILE_META {
				b.RefreshFilesUuid[createEvent.Key] = createEvent
			}
			if model.NodeRequiresChecksum(node) && checksumProvider != nil {
				if e := checksumProvider.ComputeChecksum(node); e == nil {
					log.Logger(ctx).Info("Recomputing Checksum for node", node.Zap())
				} else {
					log.Logger(ctx).Error("Cannot Recompute checksum for node", node.Zap())
				}
			}
		}
	}

	var folderUUIDs map[string][]*tree.Node
	var refresher model.UuidFoldersRefresher
	var ok bool
	if refresher, ok = b.Source.(model.UuidFoldersRefresher); ok && len(b.CreateFolders) > 0 {
		if c, e := refresher.ExistingFolders(ctx); e == nil {
			folderUUIDs = c
		}
	}

	for _, createEvent := range b.CreateFolders {
		var node *tree.Node
		var err error
		if createEvent.EventInfo.ScanEvent && createEvent.EventInfo.ScanSourceNode != nil {
			node = createEvent.EventInfo.ScanSourceNode
		} else {
			// Force reload to make sure to generate .pydio at that point
			node, err = b.Source.LoadNode(createEvent.EventInfo.CreateContext(ctx), createEvent.EventInfo.Path)
		}
		if err != nil {
			delete(b.CreateFolders, createEvent.Key)
			if _, exists := b.Deletes[createEvent.Key]; exists {
				delete(b.Deletes, createEvent.Key)
			}
		} else {
			createEvent.Node = node
		}
		log.Logger(ctx).Debug("Create Folder", zap.Any("node", createEvent.Node))
		if refresher != nil && folderUUIDs != nil && len(folderUUIDs) > 0 {
			if _, ok := folderUUIDs[createEvent.Node.Uuid]; ok {
				// There is a duplicate - update Uuid
				if newNode, err := refresher.UpdateFolderUuid(ctx, createEvent.Node); err == nil {
					createEvent.Node = newNode
				}
			}
		}
	}

	b.detectFolderMoves(ctx)

	var possibleMoves []*Move
	for _, deleteEvent := range b.Deletes {
		localPath := deleteEvent.EventInfo.Path
		var dbNode *tree.Node
		if deleteEvent.Node != nil {
			// If deleteEvent has node, it is already loaded from a snapshot, no need to reload from target
			dbNode = deleteEvent.Node
		} else {
			dbNode, _ = b.Target.LoadNode(deleteEvent.EventInfo.CreateContext(ctx), localPath)
			log.Logger(ctx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode != nil {
			deleteEvent.Node = dbNode
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, createEvent := range b.CreateFiles {
					if createEvent.Node != nil && createEvent.Node.Uuid == dbNode.Uuid {
						log.Logger(ctx).Debug("Existing leaf node with Uuid: safe move to ", createEvent.Node.ZapPath())
						createEvent.Node = dbNode
						b.FileMoves[createEvent.Key] = createEvent
						delete(b.Deletes, deleteEvent.Key)
						delete(b.CreateFiles, createEvent.Key)
						found = true
						break
					}
				}
				// Look by Etag
				if !found {
					for _, createEvent := range b.CreateFiles {
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
			_, createFileExists := b.CreateFiles[deleteEvent.Key]
			_, createFolderExists := b.CreateFolders[deleteEvent.Key]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same batch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				var testLeaf bool
				if createFileExists {
					testLeaf = true
				} else {
					testLeaf = false
				}
				existNode, _ := b.Source.LoadNode(deleteEvent.EventInfo.CreateContext(ctx), deleteEvent.EventInfo.Path, testLeaf)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(b.CreateFiles, deleteEvent.Key)
					}
					if createFolderExists {
						delete(b.CreateFolders, deleteEvent.Key)
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(b.Deletes, deleteEvent.Key)
		}
	}

	moves := b.sortClosestMoves(ctx, possibleMoves)
	for _, move := range moves {
		log.Logger(ctx).Debug("Picked closest move", zap.Object("move", move))
		move.createEvent.Node = move.dbNode
		b.FileMoves[move.createEvent.Key] = move.createEvent
		delete(b.Deletes, move.deleteEvent.Key)
		delete(b.CreateFiles, move.createEvent.Key)
	}

	// Prune Deletes: remove children if parent is already deleted
	var deleteDelete []string
	for _, folderDeleteEvent := range b.Deletes {
		deletePath := folderDeleteEvent.Node.Path
		for deleteKey, delEvent := range b.Deletes {
			from := delEvent.Node.Path
			if len(from) > len(deletePath) && strings.HasPrefix(from, deletePath) {
				deleteDelete = append(deleteDelete, deleteKey)
			}
		}
	}
	for _, del := range deleteDelete {
		log.Logger(ctx).Debug("Ignoring Delete for key " + del + " as parent is already delete")
		delete(b.Deletes, del)
	}

}

func (b *Batch) Stats() map[string]interface{} {
	return map[string]interface{}{
		"EndpointSource": b.Source.GetEndpointInfo().URI,
		"EndpointTarget": b.Target.GetEndpointInfo().URI,
		"CreateFiles":    len(b.CreateFiles),
		"CreateFolders":  len(b.CreateFolders),
		"MoveFiles":      len(b.FileMoves),
		"MoveFolders":    len(b.FolderMoves),
		"Deletes":        len(b.Deletes),
	}
}

func (b *Batch) String() string {
	if len(b.CreateFiles)+len(b.CreateFolders)+len(b.Deletes)+len(b.FolderMoves)+len(b.FileMoves) == 0 {
		return ""
	}
	output := "Batch on Target " + b.Target.GetEndpointInfo().URI + "\n"
	for k, _ := range b.CreateFiles {
		output += " + File " + k + "\n"
	}
	for k, _ := range b.CreateFolders {
		output += " + Folder " + k + "\n"
	}
	for k, _ := range b.Deletes {
		output += " - Delete " + k + "\n"
	}
	for k, m := range b.FileMoves {
		output += " = Move File " + m.Node.Path + " to " + k + "\n"
	}
	for k, m := range b.FolderMoves {
		output += " = Move Folder " + m.Node.Path + " to " + k + "\n"
	}
	return output
}

func (b *Batch) Zaps() []zapcore.Field {
	return []zapcore.Field{
		zap.Any("CreateFile", b.CreateFiles),
		zap.Any("CreateFolders", b.CreateFolders),
		zap.Any("Deletes", b.Deletes),
		zap.Any("FileMoves", b.FileMoves),
		zap.Any("FolderMoves", b.FolderMoves),
	}
}
