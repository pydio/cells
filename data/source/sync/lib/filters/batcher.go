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

package filters

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"go.uber.org/zap"
)

type EventsBatcher struct {
	Source        common.PathSyncSource
	Target        common.PathSyncTarget
	globalContext context.Context

	batchCacheMutex *sync.Mutex
	batchCache      map[string][]common.EventInfo

	batchOut      chan *Batch
	eventChannels []chan common.ProcessorEvent
}

func (ev *EventsBatcher) RegisterEventChannel(out chan common.ProcessorEvent) {
	ev.eventChannels = append(ev.eventChannels, out)
}

func (ev *EventsBatcher) sendEvent(event common.ProcessorEvent) {
	for _, channel := range ev.eventChannels {
		channel <- event
	}
}

func (ev *EventsBatcher) FilterBatch(batch *Batch) {

	ev.sendEvent(common.ProcessorEvent{
		Type: "filter:start",
		Data: batch,
	})
	var createEvent *BatchedEvent
	for _, createEvent = range batch.CreateFiles {
		var node *tree.Node
		var err error
		if createEvent.EventInfo.ScanEvent && createEvent.EventInfo.ScanSourceNode != nil {
			node = createEvent.EventInfo.ScanSourceNode
			log.Logger(ev.globalContext).Debug("Create File", zap.Any("node", node))
		} else {
			// Todo : Feed node from event instead of calling LoadNode() again?
			node, err = ev.Source.LoadNode(createEvent.EventInfo.CreateContext(ev.globalContext), createEvent.EventInfo.Path)
			log.Logger(ev.globalContext).Debug("Load File", zap.Any("node", node))
		}
		if err != nil {
			delete(batch.CreateFiles, createEvent.Key)
			if _, exists := batch.Deletes[createEvent.Key]; exists {
				delete(batch.Deletes, createEvent.Key)
			}
		} else {
			createEvent.Node = node
		}
	}

	for _, createEvent = range batch.CreateFolders {
		var node *tree.Node
		var err error
		if createEvent.EventInfo.ScanEvent && createEvent.EventInfo.ScanSourceNode != nil {
			node = createEvent.EventInfo.ScanSourceNode
		} else {
			node, err = ev.Source.LoadNode(createEvent.EventInfo.CreateContext(ev.globalContext), createEvent.EventInfo.Path, false)
		}
		if err != nil {
			delete(batch.CreateFolders, createEvent.Key)
			if _, exists := batch.Deletes[createEvent.Key]; exists {
				delete(batch.Deletes, createEvent.Key)
			}
		} else {
			createEvent.Node = node
		}
		log.Logger(ev.globalContext).Debug("Create Folder", zap.Any("node", createEvent.Node))
	}

	for _, deleteEvent := range batch.Deletes {
		localPath := deleteEvent.EventInfo.Path
		dbNode, _ := ev.Target.LoadNode(deleteEvent.EventInfo.CreateContext(ev.globalContext), localPath)
		log.Logger(ev.globalContext).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		if dbNode != nil {
			deleteEvent.Node = dbNode
			if dbNode.IsLeaf() {
				for _, createEvent = range batch.CreateFiles {
					if createEvent.Node != nil && (createEvent.Node.Etag == dbNode.Etag || createEvent.Node.Uuid == dbNode.Uuid) {
						log.Logger(ev.globalContext).Debug("Existing leaf node with same hash or Uuid: this is a move", zap.String("etag", dbNode.Etag), zap.String("path", dbNode.Path))
						createEvent.Node = dbNode
						batch.FileMoves[createEvent.Key] = createEvent
						delete(batch.Deletes, deleteEvent.Key)
						delete(batch.CreateFiles, createEvent.Key)
						break
					}
				}

			} else {
				for _, createEvent = range batch.CreateFolders {
					log.Logger(ev.globalContext).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", createEvent.Node.Zap(), dbNode.Zap())
					if createEvent.Node.Uuid == dbNode.Uuid {
						log.Logger(ev.globalContext).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
						createEvent.Node = dbNode
						batch.FolderMoves[createEvent.Key] = createEvent
						delete(batch.Deletes, deleteEvent.Key)
						delete(batch.CreateFolders, createEvent.Key)
						break
					}
				}
			}
		} else {
			_, createFileExists := batch.CreateFiles[deleteEvent.Key]
			_, createFolderExists := batch.CreateFolders[deleteEvent.Key]
			if createFileExists || createFolderExists {
				// There was a create & remove in the same batch, on a non indexed node.
				// We are not sure of the order, Stat the file.
				var testLeaf bool
				if createFileExists {
					testLeaf = true
				} else {
					testLeaf = false
				}
				existNode, _ := ev.Source.LoadNode(deleteEvent.EventInfo.CreateContext(ev.globalContext), deleteEvent.EventInfo.Path, testLeaf)
				if existNode == nil {
					// File does not exist finally, ignore totally
					if createFileExists {
						delete(batch.CreateFiles, deleteEvent.Key)
					}
					if createFolderExists {
						delete(batch.CreateFolders, deleteEvent.Key)
					}
				}
			}
			// Remove from delete anyway : node is not in the index
			delete(batch.Deletes, deleteEvent.Key)
		}
	}

	// Prune Moves: remove MoveFiles if MoveFolder is associated
	deleteFileMoves := []string{}
	deleteFolderMoves := []string{}
	for _, folderMoveEvent := range batch.FolderMoves {
		folderFrom := folderMoveEvent.Node.Path
		folderTo := folderMoveEvent.EventInfo.Path
		for fMoveKey, moveEvent := range batch.FileMoves {
			from := moveEvent.Node.Path
			to := moveEvent.EventInfo.Path
			if strings.HasPrefix(from, folderFrom) && strings.HasPrefix(to, folderTo) {
				deleteFileMoves = append(deleteFileMoves, fMoveKey)
			}
		}
		for folderMoveKey, moveEvent := range batch.FolderMoves {
			from := moveEvent.Node.Path
			to := moveEvent.EventInfo.Path
			if len(from) > len(folderFrom) && len(to) > len(folderTo) && strings.HasPrefix(from, folderFrom) && strings.HasPrefix(to, folderTo) {
				deleteFolderMoves = append(deleteFolderMoves, folderMoveKey)
			}
		}
	}
	for _, del := range deleteFileMoves {
		log.Logger(ev.globalContext).Debug("Ignoring Move for file " + del + " as folder is already moved")
		delete(batch.FileMoves, del)
	}
	for _, del := range deleteFolderMoves {
		log.Logger(ev.globalContext).Debug("Ignoring Move for folder " + del + " as folder is already moved")
		delete(batch.FolderMoves, del)
	}

	// Prune Deletes: remove children if parent is already deleted
	deleteDelete := []string{}
	for _, folderDeleteEvent := range batch.Deletes {
		deletePath := folderDeleteEvent.Node.Path
		for deleteKey, delEvent := range batch.Deletes {
			from := delEvent.Node.Path
			if len(from) > len(deletePath) && strings.HasPrefix(from, deletePath) {
				deleteDelete = append(deleteDelete, deleteKey)
			}
		}
	}
	for _, del := range deleteDelete {
		log.Logger(ev.globalContext).Debug("Ignoring Delete for key " + del + " as parent is already delete")
		delete(batch.Deletes, del)
	}

	ev.sendEvent(common.ProcessorEvent{
		Type: "filter:end",
		Data: batch,
	})
}

func (ev *EventsBatcher) ProcessEvents(events []common.EventInfo) {

	log.Logger(ev.globalContext).Debug("Processing Events Now", zap.Int("count", len(events)))
	batch := NewBatch()

	for _, event := range events {
		key := event.Path
		var bEvent = &BatchedEvent{
			Source:    ev.Source,
			Target:    ev.Target,
			Key:       key,
			EventInfo: event,
		}
		if event.Type == common.EventCreate || event.Type == common.EventRename {
			if event.Folder {
				batch.CreateFolders[key] = bEvent
			} else {
				batch.CreateFiles[key] = bEvent
			}
		} else {
			batch.Deletes[key] = bEvent
		}
	}
	log.Logger(ev.globalContext).Debug("Batch Before Filtering", zap.Any("batch", batch))
	ev.FilterBatch(batch)
	log.Logger(ev.globalContext).Debug("Batch After Filtering", zap.Any("batch", batch))
	ev.batchOut <- batch

}

func (ev *EventsBatcher) BatchEvents(in chan common.EventInfo, out chan *Batch, duration time.Duration) {

	ev.batchOut = out
	var batch []common.EventInfo

	for {
		select {
		case event := <-in:
			// Add to queue
			if session := event.Metadata["X-Pydio-Session"]; session != "" {
				if strings.HasPrefix(session, "close-") {
					session = strings.TrimPrefix(session, "close-")

					ev.batchCacheMutex.Lock()
					ev.batchCache[session] = append(ev.batchCache[session], event)
					go ev.ProcessEvents(ev.batchCache[session])
					delete(ev.batchCache, session)
					ev.batchCacheMutex.Unlock()
				} else {
					ev.batchCacheMutex.Lock()
					ev.batchCache[session] = append(ev.batchCache[session], event)
					ev.batchCacheMutex.Unlock()
				}
			} else if event.ScanEvent || event.OperationId == "" {
				batch = append(batch, event)
			}
		case <-time.After(duration):
			// Process Queue
			if len(batch) > 0 {
				go ev.ProcessEvents(batch)
				batch = nil
			}
		}

	}

}

func NewEventsBatcher(ctx context.Context, source common.PathSyncSource, target common.PathSyncTarget) *EventsBatcher {

	return &EventsBatcher{
		Source:          source,
		Target:          target,
		globalContext:   ctx,
		batchCache:      make(map[string][]common.EventInfo),
		batchCacheMutex: &sync.Mutex{},
	}

}
