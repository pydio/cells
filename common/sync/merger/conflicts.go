package merger

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type ConflictType int

const (
	ConflictFolderUUID ConflictType = iota
)

type Conflict struct {
	Type      ConflictType
	NodeLeft  *tree.Node
	NodeRight *tree.Node
}

func SolveConflicts(ctx context.Context, conflicts []*Conflict, left model.Endpoint, right model.Endpoint) (errs []error) {

	// Try to refresh UUIDs on target
	var refresher model.UuidFoldersRefresher
	var ok, refresherRight, refresherLeft bool
	if refresher, ok = right.(model.UuidFoldersRefresher); ok {
		refresherRight = true
	} else if refresher, ok = left.(model.UuidFoldersRefresher); ok {
		refresherLeft = true
	}
	for _, c := range conflicts {
		if c.Type == ConflictFolderUUID && ok {
			var srcUuid *tree.Node
			if refresherRight {
				srcUuid = c.NodeLeft
			} else if refresherLeft {
				srcUuid = c.NodeRight
			}
			if _, e := refresher.UpdateFolderUuid(ctx, srcUuid); e != nil {
				errs = append(errs, e)
			}
		}
	}

	return
}
