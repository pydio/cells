package events

import (
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"
)

// TreeNodeChangeToModelEvent transforms a tree.NodeChangeEvent to model.EventInfo
func TreeNodeChangeToModelEvent(change *tree.NodeChangeEvent, eventTime time.Time, source model.PathSyncSource) (model.EventInfo, bool) {
	now := eventTime.UTC().Format(model.EventInfoTimeFormatFS)

	switch change.Type {
	case tree.NodeChangeEvent_CREATE, tree.NodeChangeEvent_UPDATE_CONTENT:
		return model.EventInfo{
			Type:     model.EventCreate,
			Path:     change.Target.Path,
			Etag:     change.Target.Etag,
			Time:     now,
			Folder:   !change.Target.IsLeaf(),
			Size:     change.Target.Size,
			Metadata: change.Metadata,
			Source:   source,
		}, true
	case tree.NodeChangeEvent_DELETE:
		return model.EventInfo{
			Type:     model.EventRemove,
			Path:     change.Source.Path,
			Time:     now,
			Metadata: change.Metadata,
			Source:   source,
		}, true
	case tree.NodeChangeEvent_UPDATE_PATH:
		return model.EventInfo{
			Type:       model.EventSureMove,
			Path:       change.Target.Path,
			Folder:     !change.Target.IsLeaf(),
			Size:       change.Target.Size,
			Etag:       change.Target.Etag,
			MoveSource: change.Source,
			MoveTarget: change.Target,
			Metadata:   change.Metadata,
			Source:     source,
		}, true
	default:
		return model.EventInfo{}, false
	}

}
