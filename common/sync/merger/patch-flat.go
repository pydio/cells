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
	"sort"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

type FlatPatch struct {
	AbstractPatch

	createFiles      map[string]*Operation
	updateFiles      map[string]*Operation
	createFolders    map[string]*Operation
	deletes          map[string]*Operation
	fileMoves        map[string]*Operation
	folderMoves      map[string]*Operation
	refreshFilesUuid map[string]*Operation
}

func newFlatPatch(source model.PathSyncSource, target model.PathSyncTarget) (patch *FlatPatch) {
	patch = &FlatPatch{
		AbstractPatch: AbstractPatch{
			source: source,
			target: target,
		},
		createFiles:      make(map[string]*Operation),
		updateFiles:      make(map[string]*Operation),
		createFolders:    make(map[string]*Operation),
		deletes:          make(map[string]*Operation),
		fileMoves:        make(map[string]*Operation),
		folderMoves:      make(map[string]*Operation),
		refreshFilesUuid: make(map[string]*Operation),
	}
	return patch
}

func (b *FlatPatch) Enqueue(event *Operation, key ...string) {
	k := event.Key
	if len(key) > 0 {
		k = key[0]
	}
	switch event.Type {
	case OpCreateFile:
		b.createFiles[k] = event
	case OpUpdateFile:
		b.updateFiles[k] = event
	case OpCreateFolder:
		b.createFolders[k] = event
	case OpDelete:
		b.deletes[k] = event
	case OpMoveFile:
		b.fileMoves[k] = event
	case OpMoveFolder:
		b.folderMoves[k] = event
	case OpRefreshUuid:
		b.refreshFilesUuid[k] = event
	}
}

// OperationsByType returns operations, eventually filtered by one or more types.
// If types is empty, all operations are returned. If sorted is true, operations are sorted by key.
func (b *FlatPatch) OperationsByType(types []OperationType, sorted ...bool) (events []*Operation) {
	if len(types) == 0 {
		// Return all types
		for _, ops := range []map[string]*Operation{b.createFiles, b.updateFiles, b.createFolders, b.deletes, b.fileMoves, b.folderMoves, b.refreshFilesUuid} {
			if len(sorted) > 0 && sorted[0] {
				for _, key := range b.sortedKeys(ops) {
					events = append(events, ops[key])
				}
			} else {
				for _, op := range ops {
					events = append(events, op)
				}
			}
		}
		return
	}
	var data map[string]*Operation
	for _, t := range types {
		switch t {
		case OpCreateFile:
			data = b.createFiles
		case OpUpdateFile:
			data = b.updateFiles
		case OpCreateFolder:
			data = b.createFolders
		case OpDelete:
			data = b.deletes
		case OpMoveFile:
			data = b.fileMoves
		case OpMoveFolder:
			data = b.folderMoves
		case OpRefreshUuid:
			data = b.refreshFilesUuid
		default:
			panic("unknown event type")
		}
		if len(sorted) > 0 && sorted[0] {
			for _, key := range b.sortedKeys(data) {
				events = append(events, data[key])
			}
		} else {
			for _, event := range data {
				events = append(events, event)
			}
		}
	}
	return
}

func (b *FlatPatch) Filter(ctx context.Context) {

	b.filterCreateFiles(ctx)

	b.filterCreateFolders(ctx)

	b.detectFolderMoves(ctx)

	b.detectFileMoves(ctx)

	b.filterDeletes(ctx)

}

func (b *FlatPatch) FilterToTarget(ctx context.Context) {

	for p, e := range b.createFiles {
		// Check it's not already on target
		if node, err := e.Target().LoadNode(ctx, p); err == nil && node.Etag == e.Node.Etag {
			log.Logger(ctx).Debug("Skipping Create File", node.Zap())
			delete(b.createFiles, p)
		}
	}

	for p, e := range b.updateFiles {
		// Check it's not already on target
		if node, err := e.Target().LoadNode(ctx, p); err == nil && node.Etag == e.Node.Etag {
			log.Logger(ctx).Debug("Skipping Update File", node.Zap())
			delete(b.updateFiles, p)
		}
	}

	for p, e := range b.createFolders {
		// Check it's not already on target
		if node, err := e.Target().LoadNode(ctx, p); err == nil {
			log.Logger(ctx).Debug("Skipping Create Folder", node.Zap())
			delete(b.createFolders, p)
		}
	}
	/*
		// Check it's not already deleted on target
		// TODO Problem is if delete is inside a move, it will be a false positive
		for p, e := range b.deletes {
				if _, err := e.Target().LoadNode(ctx, p); err != nil && errors.Parse(err.Error()).Code == 404 {
					log.Logger(ctx).Debug("Skipping Delete for path " + p)
					delete(b.deletes, p)
				}
		}
	*/
	for p, e := range b.folderMoves {
		// Check it's not already on target
		if n, err := e.Target().LoadNode(ctx, p); err == nil {
			log.Logger(ctx).Debug("Skipping Folder move", n.Zap())
			delete(b.folderMoves, p)
		}
	}
	for p, e := range b.fileMoves {
		// Check it's not already on target
		if n, err := e.Target().LoadNode(ctx, p); err == nil && n.Etag == e.Node.Etag {
			log.Logger(ctx).Debug("Skipping File move for path " + p)
			delete(b.fileMoves, p)
		}
	}

}

func (b *FlatPatch) Size() int {
	all := b.OperationsByType([]OperationType{})
	return len(all)
}

func (b *FlatPatch) ProgressTotal() int64 {
	if b.HasTransfers() {
		var total int64
		for _, c := range b.createFiles {
			total += c.Node.Size
		}
		for _, c := range b.updateFiles {
			total += c.Node.Size
		}
		total += int64(len(b.createFolders) + len(b.folderMoves) + len(b.fileMoves) + len(b.deletes))
		return total
	} else {
		return int64(b.Size())
	}
}

func (b *FlatPatch) Stats() map[string]interface{} {
	return map[string]interface{}{
		"Source":        b.Source().GetEndpointInfo().URI,
		"Target":        b.Target().GetEndpointInfo().URI,
		"createFiles":   len(b.createFiles),
		"updateFiles":   len(b.updateFiles),
		"createFolders": len(b.createFolders),
		"moveFiles":     len(b.fileMoves),
		"moveFolders":   len(b.folderMoves),
		"deletes":       len(b.deletes),
	}
}

func (b *FlatPatch) String() string {
	if len(b.createFiles)+len(b.createFolders)+len(b.deletes)+len(b.folderMoves)+len(b.fileMoves) == 0 {
		return ""
	}
	output := "Patch on Target " + b.Target().GetEndpointInfo().URI + "\n"
	for k, _ := range b.createFiles {
		output += " + File " + k + "\n"
	}
	for k, _ := range b.updateFiles {
		output += " => Update File " + k + "\n"
	}
	for k, _ := range b.createFolders {
		output += " + Folder " + k + "\n"
	}
	for k, _ := range b.deletes {
		output += " - Delete " + k + "\n"
	}
	for k, m := range b.fileMoves {
		output += " = Move File " + m.Node.Path + " to " + k + "\n"
	}
	for k, m := range b.folderMoves {
		output += " = Move Folder " + m.Node.Path + " to " + k + "\n"
	}
	return output
}

func (b *FlatPatch) sortedKeys(events map[string]*Operation) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
