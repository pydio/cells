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

	"github.com/pborman/uuid"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

func (b *FlatPatch) filterCreateFiles(ctx context.Context) {

	checksumProvider := b.Source().(model.ChecksumProvider)

	for _, createEvent := range b.createFiles {
		if model.Ignores(b.Target(), createEvent.GetRefPath()) {
			delete(b.createFiles, createEvent.GetRefPath())
			continue
		}
		node, err := createEvent.NodeFromSource(ctx)
		if err != nil {
			delete(b.createFiles, createEvent.GetRefPath())
			if _, exists := b.deletes[createEvent.GetRefPath()]; exists {
				delete(b.deletes, createEvent.GetRefPath())
			}
			continue
		}
		if node.Uuid == "" && !model.IsFolderHiddenFile(node.Path) {
			b.refreshFilesUuid[createEvent.GetRefPath()] = createEvent
		}
		if model.NodeRequiresChecksum(node) && checksumProvider != nil {
			checksumProvider.ComputeChecksum(node)
		}
	}

	for _, updateEvent := range b.updateFiles {
		if model.Ignores(b.Target(), updateEvent.GetRefPath()) {
			delete(b.updateFiles, updateEvent.GetRefPath())
			continue
		}
	}

}

func (b *FlatPatch) filterCreateFolders(ctx context.Context) {

	var existingFolders map[string][]*tree.Node
	var refresher model.UuidFoldersRefresher
	var ok bool
	if refresher, ok = b.Source().(model.UuidFoldersRefresher); ok && len(b.createFolders) > 0 {
		if c, e := refresher.ExistingFolders(ctx); e == nil {
			existingFolders = c
		}
	}

	for _, createOp := range b.createFolders {
		if model.Ignores(b.Target(), createOp.GetRefPath()) {
			delete(b.createFiles, createOp.GetRefPath())
			continue
		}
		if _, err := createOp.NodeFromSource(ctx); err != nil {
			delete(b.createFolders, createOp.GetRefPath())
			if _, exists := b.deletes[createOp.GetRefPath()]; exists {
				delete(b.deletes, createOp.GetRefPath())
			}
			continue
		}
		if refresher != nil && existingFolders != nil {
			n := createOp.GetNode()
			if _, ok := existingFolders[n.Uuid]; ok {
				// There is a duplicate - update Uuid
				refreshNode := n.Clone()
				refreshNode.Uuid = uuid.New()
				if newNode, err := refresher.UpdateFolderUuid(ctx, refreshNode); err == nil {
					createOp.SetNode(newNode)
				}
			}
		}
	}

}
