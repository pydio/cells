package merger

import (
	"context"
	"strings"

	"github.com/pydio/cells/common/sync/model"
)

func (b *FlatPatch) filterDeletes(ctx context.Context) {

	// Prune Deletes: remove children if parent is already deleted
	var deleteDelete []string
	for _, folderDeleteOp := range b.deletes {
		deletePath := folderDeleteOp.GetRefPath() + "/"
		for deleteKey, delOp := range b.deletes {
			from := delOp.GetRefPath()
			if strings.HasPrefix(from, deletePath) {
				deleteDelete = append(deleteDelete, deleteKey)
			}
		}
	}
	for _, del := range deleteDelete {
		delete(b.deletes, del)
	}

	for _, del := range b.deletes {
		if model.Ignores(b.Target(), del.GetRefPath()) {
			delete(b.deletes, del.GetRefPath())
			continue
		}
	}

}
