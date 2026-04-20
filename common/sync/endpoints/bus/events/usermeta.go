package events

import (
	"path"
	"time"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// UserMetaToModelEvent transforms an idm.UpdateUserMetaEvent to model.EventInfo
func UserMetaToModelEvent(change *idm.UpdateUserMetaEvent, eventTime time.Time, source model.PathSyncSource) (model.EventInfo, error) {
	m := change.GetUserMeta()
	op := change.GetOperation()

	if m.GetResolvedNode() == nil {
		return model.EventInfo{}, errors.New("no resolved node in meta diff")
	}

	metaNode := &tree.Node{
		Uuid: m.GetUuid(),
		Type: merger.NodeType_METADATA,
		Path: path.Join(m.GetResolvedNode().GetPath(), m.GetNamespace()),
		Size: int64(len(m.GetJsonValue())),
		Etag: m.GetJsonValue(),
		MetaStore: map[string]string{
			merger.MetaNodeParentPathMeta: `"` + m.GetResolvedNode().GetPath() + `"`,
			merger.MetaNodeParentUUIDMeta: `"` + m.GetResolvedNode().GetUuid() + `"`,
		},
	}

	var ty model.EventType
	if op == idm.UpdateUserMetaEvent_PUT {
		ty = model.EventMetaPut
	} else if op == idm.UpdateUserMetaEvent_DELETE {
		ty = model.EventMetaDel
	}

	return model.EventInfo{
		Type:       ty,
		Time:       eventTime.UTC().Format(model.EventInfoTimeFormatFS),
		Etag:       metaNode.Etag,
		Size:       metaNode.Size,
		Path:       metaNode.Path,
		Source:     source,
		Metadata:   make(map[string]string), // retrieve from event headers?
		MoveTarget: metaNode,
	}, nil

}
