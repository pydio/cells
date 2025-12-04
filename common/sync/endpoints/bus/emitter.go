package bus

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

const scheme = "pub"

var (
	_ model.PathSyncTarget   = (*Emitter)(nil)
	_ model.PathSyncSource   = (*Emitter)(nil)
	_ model.SessionProvider  = (*Emitter)(nil)
	_ model.MetadataReceiver = (*Emitter)(nil)
	_ model.MetadataProvider = (*Emitter)(nil)
)

func init() {
	endpoints.Register(scheme, endpoints.OpenURLFunc(func(ctx context.Context, u *url.URL, compose ...*url.URL) (model.Endpoint, error) {
		if len(compose) < 2 {
			return nil, errors.WithMessage(errors.InvalidParameters, "expect at least two additional urls, first for Queue and second for Snapshot")
		}
		queueURL := compose[0]
		snapshotURL := compose[1]

		// Open AsyncQueue
		aq, er := broker.OpenAsyncQueue(ctx, queueURL.String())
		if er != nil {
			return nil, er
		}
		// Hacky - create a consumer right away to read message contents
		_ = aq.Consume(func(ct context.Context, mm ...broker.Message) {
			for _, m := range mm {
				nE := &sync.SyncEvent{}
				if ct, er = m.Unmarshal(ct, nE); er == nil {
					log.Logger(ctx).Info("Received SyncEvent", zap.Any("event", nE))
				}
			}
		})

		// Build a Snapshot to be used as internal store - type should be passed by URL
		snap, er := endpoints.OpenEndpoint(ctx, snapshotURL.String())
		if er != nil {
			return nil, er
		}
		pss, ok1 := snap.(model.PathSyncSource)
		pst, ok2 := snap.(model.PathSyncTarget)
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("invalid path endpoint type: %T", snap)
		}
		sp, _ := snap.(model.SessionProvider)
		mr, _ := snap.(model.MetadataReceiver)

		// Parse metadataGlobs
		var metaGlob []glob.Glob
		for _, met := range strings.Split(u.Query().Get("metadataGlobs"), ",") {
			if g, err := glob.Compile(met); err != nil {
				return nil, err
			} else {
				metaGlob = append(metaGlob, g)
			}
		}

		return &Emitter{
			queueURL:        queueURL,
			snapURL:         snapshotURL,
			AsyncQueue:      aq,
			PathSyncSource:  pss,
			PathSyncTarget:  pst,
			sessionProvider: sp, // may be nil
			metaReceiver:    mr, // may be nil
		}, nil
	}))
}

type Emitter struct {
	// Queue
	queueURL *url.URL
	broker.AsyncQueue

	// Snapshot
	snapURL *url.URL
	model.PathSyncSource
	model.PathSyncTarget

	// Optional
	sessionProvider model.SessionProvider
	metaReceiver    model.MetadataReceiver
	metaGlob        []glob.Glob
}

func (e *Emitter) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:            scheme + ":///?queue=" + e.queueURL.Scheme + "&snapshot=" + e.snapURL.Scheme,
		IsAsynchronous: true,
	}
}

// LoadNode loads a given node by its path from this endpoint
// Redeclare it to disambiguate LoadNode from PathSyncSource & PathSyncTarget
func (e *Emitter) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {
	return e.PathSyncTarget.LoadNode(ctx, path, extendedStats...)
}

func (e *Emitter) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	mm := map[string]string{}
	if updateIfExists {
		mm["update_if_exists"] = "true"
	}
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:     tree.NodeChangeEvent_CREATE,
			Source:   nil,
			Target:   node.AsProto(),
			Metadata: mm,
		}},
	})
	if er != nil {
		return er
	}
	return e.PathSyncTarget.CreateNode(ctx, node, updateIfExists)
}

func (e *Emitter) DeleteNode(ctx context.Context, path string) (err error) {
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_DELETE,
			Source: &tree.Node{Path: path},
			Target: nil,
		}},
	})
	if er != nil {
		return er
	}
	return e.PathSyncTarget.DeleteNode(ctx, path)
}

func (e *Emitter) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
		Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_UPDATE_PATH,
			Source: &tree.Node{Path: oldPath},
			Target: &tree.Node{Path: newPath},
		}},
	})
	if er != nil {
		return er
	}
	return e.PathSyncTarget.MoveNode(ctx, oldPath, newPath)
}

// ProvidesMetadataNamespaces implements model.MetadataProvider interface
func (e *Emitter) ProvidesMetadataNamespaces() ([]glob.Glob, bool) {
	return e.metaGlob, len(e.metaGlob) > 0
}

// CreateMetadata add a metadata to the node
func (e *Emitter) CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
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
	if er != nil {
		return er
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.CreateMetadata(ctx, node, namespace, jsonValue)
	}
	return nil
}

// UpdateMetadata updates an existing metadata value
func (e *Emitter) UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
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
	if er != nil {
		return er
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.UpdateMetadata(ctx, node, namespace, jsonValue)
	}
	return nil

}

// DeleteMetadata deletes a metadata by namespace
func (e *Emitter) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
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
	if er != nil {
		return er
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.DeleteMetadata(ctx, node, namespace)
	}
	return nil
}

// Implement SessionProvider methods if the snapshot endpoint can handle it

func (e *Emitter) StartSession(ctx context.Context, rootNode tree.N, silent bool) (string, error) {
	if e.sessionProvider != nil {
		return e.sessionProvider.StartSession(ctx, rootNode, silent)
	}
	return "fake-session", nil
}

func (e *Emitter) FlushSession(ctx context.Context, sessionUuid string) error {
	if e.sessionProvider != nil {
		return e.sessionProvider.FlushSession(ctx, sessionUuid)
	}
	return nil
}

func (e *Emitter) FinishSession(ctx context.Context, sessionUuid string) error {
	if e.sessionProvider != nil {
		return e.sessionProvider.FinishSession(ctx, sessionUuid)
	}
	return nil
}

func (e *Emitter) Shutdown() (err error) {
	if sh, ok := e.PathSyncTarget.(model.Shutdowner); ok {
		return sh.Shutdown()
	}
	return nil
}
