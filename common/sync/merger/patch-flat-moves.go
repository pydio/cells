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

const (
	maxUint = ^uint(0)
	maxInt  = int(maxUint >> 1)
)

type Move struct {
	deleteEvent *Operation
	createEvent *Operation
	dbNode      *tree.Node
}

// ByAge implements sort.Interface based on the Age field.
type bySourceDeep []*Move

func (a bySourceDeep) Len() int { return len(a) }
func (a bySourceDeep) folderDepth(m *Move) int {
	return len(strings.Split(strings.Trim(m.deleteEvent.Key, "/"), "/"))
}
func (a bySourceDeep) Less(i, j int) bool {
	return a.folderDepth(a[i]) > a.folderDepth(a[j])
}
func (a bySourceDeep) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
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
	if m.deleteEvent.Key == m.createEvent.Key {
		return maxInt
	}
	pref := mtree.CommonPrefix(sep[0], m.deleteEvent.Key, m.createEvent.Key)
	return len(strings.Split(pref, sep))
}

func (m *Move) SameBase() bool {
	return path.Base(m.deleteEvent.Key) == path.Base(m.createEvent.Key)
}

func (b *FlatPatch) detectFileMoves(ctx context.Context) {

	var possibleMoves []*Move
	for _, deleteEvent := range b.deletes {
		if dbNode, found := deleteEvent.NodeInTarget(ctx); found {
			deleteEvent.Node = dbNode
			if dbNode.IsLeaf() {
				var found bool
				// Look by UUID first
				for _, opCreate := range b.createFiles {
					if opCreate.Node != nil && opCreate.Node.Uuid != "" && opCreate.Node.Uuid == dbNode.Uuid {
						// Now remove from delete/create
						delete(b.deletes, deleteEvent.Key)
						delete(b.createFiles, opCreate.Key)
						// Enqueue in moves only if path differ
						if opCreate.Node.Path != dbNode.Path {
							log.Logger(ctx).Debug("Existing leaf node with uuid and different path: safe move to ", opCreate.Node.ZapPath())
							opCreate.Node = dbNode
							opCreate.Type = OpMoveFile
							b.fileMoves[opCreate.Key] = opCreate
						}
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
				// There was a create & remove in the same patch, on a non indexed node.
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
		// Remove from deletes/creates
		delete(b.deletes, move.deleteEvent.Key)
		delete(b.createFiles, move.createEvent.Key)
		// Enqueue in move if Paths differ
		if move.createEvent.Node.Path != move.dbNode.Path {
			move.createEvent.Node = move.dbNode
			move.createEvent.Type = OpMoveFile
			b.fileMoves[move.createEvent.Key] = move.createEvent
		}
	}

}

func (b *FlatPatch) sortClosestMoves(logCtx context.Context, possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	targets := make(map[string]bool)
	sort.Sort(bySourceDeep(possibleMoves))
	for _, m := range possibleMoves {
		source := m.deleteEvent.Key
		for _, m2 := range possibleMoves {
			byT, ok := greatestSource[source]
			source2 := m2.deleteEvent.Key
			target2 := m2.createEvent.Key
			if source2 != source {
				continue
			}
			if _, alreadyUsed := targets[target2]; alreadyUsed {
				continue
			}
			if !ok || m2.Distance() > byT.Distance() || m2.SameBase() && !byT.SameBase() {
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

func (b *FlatPatch) detectFolderMoves(ctx context.Context) {
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

		for _, opCreate := range b.createFolders {
			log.Logger(ctx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", opCreate.Node.Zap(), dbNode.Zap())
			if opCreate.Node.Uuid == dbNode.Uuid {
				log.Logger(ctx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				opCreate.Node = dbNode
				opCreate.Type = OpMoveFolder
				b.folderMoves[opCreate.Key] = opCreate
				b.pruneMovesByPath(ctx, deleteEvent.Key, opCreate.Key)
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
					Patch:     b,
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

func (b *FlatPatch) rescanMoves() {

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
