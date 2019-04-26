package merger

import (
	"context"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common/proto/tree"

	"github.com/pydio/cells/common/sync/model"
)

func (b *SimpleBatch) filterCreateFiles(ctx context.Context) {

	checksumProvider := b.Source().(model.ChecksumProvider)

	for _, createEvent := range b.createFiles {
		if model.Ignores(b.Target(), createEvent.Key) {
			delete(b.createFiles, createEvent.Key)
			continue
		}
		node, err := createEvent.NodeFromSource(ctx)
		if err != nil {
			delete(b.createFiles, createEvent.Key)
			if _, exists := b.deletes[createEvent.Key]; exists {
				delete(b.deletes, createEvent.Key)
			}
			continue
		}
		if node.Uuid == "" && !model.IsFolderHiddenFile(node.Path) {
			b.refreshFilesUuid[createEvent.Key] = createEvent
		}
		if model.NodeRequiresChecksum(node) && checksumProvider != nil {
			checksumProvider.ComputeChecksum(node)
		}
	}

}

func (b *SimpleBatch) filterCreateFolders(ctx context.Context) {

	var existingFolders map[string][]*tree.Node
	var refresher model.UuidFoldersRefresher
	var ok bool
	if refresher, ok = b.Source().(model.UuidFoldersRefresher); ok && len(b.createFolders) > 0 {
		if c, e := refresher.ExistingFolders(ctx); e == nil {
			existingFolders = c
		}
	}

	for _, createEvent := range b.createFolders {
		if model.Ignores(b.Target(), createEvent.Key) {
			delete(b.createFiles, createEvent.Key)
			continue
		}
		if _, err := createEvent.NodeFromSource(ctx); err != nil {
			delete(b.createFolders, createEvent.Key)
			if _, exists := b.deletes[createEvent.Key]; exists {
				delete(b.deletes, createEvent.Key)
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
