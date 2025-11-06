package bus

import (
	"context"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
)

//var _ model.PathSyncTarget = (*Emitter)(nil)

type Emitter struct {
	broker.AsyncQueue
	topic string
}

func (e *Emitter) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	mm := map[string]string{}
	if updateIfExists {
		mm["update_if_exists"] = "true"
	}
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:     tree.NodeChangeEvent_CREATE,
			Source:   nil,
			Target:   node.AsProto(),
			Metadata: mm,
		}},
	})
}

func (e *Emitter) DeleteNode(ctx context.Context, path string) (err error) {
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_DELETE,
			Source: &tree.Node{Path: path},
			Target: nil,
		}},
	})
}

func (e *Emitter) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_UPDATE_PATH,
			Source: &tree.Node{Path: oldPath},
			Target: &tree.Node{Path: newPath},
		}},
	})
}

// CreateMetadata add a metadata to the node
func (e *Emitter) CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_UserMetaEvent{UserMetaEvent: &idm.UpdateUserMetaEvent{
			EventMetadata: nil,
			Operation:     idm.UpdateUserMetaEvent_PUT,
			UserMeta: &idm.UserMeta{
				NodeUuid:     node.GetUuid(),
				Namespace:    namespace,
				JsonValue:    jsonValue,
				ResolvedNode: node.AsProto(),
			},
		}},
	})
}

// UpdateMetadata updates an existing metadata value
func (e *Emitter) UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_UserMetaEvent{UserMetaEvent: &idm.UpdateUserMetaEvent{
			EventMetadata: nil,
			Operation:     idm.UpdateUserMetaEvent_PUT,
			UserMeta: &idm.UserMeta{
				NodeUuid:     node.GetUuid(),
				Namespace:    namespace,
				JsonValue:    jsonValue,
				ResolvedNode: node.AsProto(),
			},
		}},
	})
}

// DeleteMetadata deletes a metadata by namespace
func (e *Emitter) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	return e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_UserMetaEvent{UserMetaEvent: &idm.UpdateUserMetaEvent{
			EventMetadata: nil,
			Operation:     idm.UpdateUserMetaEvent_DELETE,
			UserMeta: &idm.UserMeta{
				NodeUuid:     node.GetUuid(),
				Namespace:    namespace,
				ResolvedNode: node.AsProto(),
			},
		}},
	})
}
