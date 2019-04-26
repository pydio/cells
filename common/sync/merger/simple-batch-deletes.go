package merger

import (
	"context"
	"strings"

	"github.com/pydio/cells/common/sync/model"
)

func (b *SimpleBatch) filterDeletes(ctx context.Context) {

	// Prune Deletes: remove children if parent is already deleted
	var deleteDelete []string
	for _, folderDeleteEvent := range b.deletes {
		deletePath := folderDeleteEvent.Node.Path + "/"
		for deleteKey, delEvent := range b.deletes {
			from := delEvent.Node.Path
			if strings.HasPrefix(from, deletePath) {
				deleteDelete = append(deleteDelete, deleteKey)
			}
		}
	}
	for _, del := range deleteDelete {
		delete(b.deletes, del)
	}

	for _, del := range b.deletes {
		if model.Ignores(b.Target(), del.Key) {
			delete(b.deletes, del.Key)
			continue
		}
	}

}
