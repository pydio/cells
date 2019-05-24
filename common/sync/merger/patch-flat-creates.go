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
