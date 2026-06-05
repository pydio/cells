package bus

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"strings"
	stdsync "sync"
	"time"

	"go.uber.org/zap"

	"github.com/gobwas/glob"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints"
	"github.com/pydio/cells/v5/common/sync/endpoints/bus/events"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

const (
	pubScheme = "pub"
	subScheme = "sub"
)

var (
	_ model.PathSyncTarget   = (*PubSubEndpoint)(nil)
	_ model.PathSyncSource   = (*PubSubEndpoint)(nil)
	_ model.SessionProvider  = (*PubSubEndpoint)(nil)
	_ model.MetadataReceiver = (*PubSubEndpoint)(nil)
	_ model.MetadataProvider = (*PubSubEndpoint)(nil)
	_ model.DataSyncSource   = (*DataPubSubEndpoint)(nil)
	_ model.DataSyncTarget   = (*DataPubSubEndpoint)(nil)
)

func init() {
	// Inits a PubSubEndpoint in "pub" mode
	endpoints.Register(pubScheme, endpoints.OpenURLFunc(func(ctx context.Context, u *url.URL, compose ...*url.URL) (model.Endpoint, error) {
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

		pb := &PubSubEndpoint{
			isPub:      true,
			queueURL:   queueURL,
			AsyncQueue: aq,
		}
		if err := pb.parseSubEndpoints(ctx, snapshotURL); err != nil {
			return nil, err
		}
		if err := pb.parseMetaGlobs(ctx, u); err != nil {
			return nil, err
		}

		if len(compose) > 2 {
			dataEndpoint, err := endpoints.OpenEndpoint(ctx, compose[2].String())
			if err != nil {
				return nil, err
			}
			if tgt, ok := dataEndpoint.(model.DataSyncTarget); ok {
				return &DataPubSubEndpoint{
					PubSubEndpoint: pb,
					tgt:            tgt,
				}, nil
			} else {
				return nil, errors.New(fmt.Sprintf("third URL %s does not open a DataSyncTarget", compose[2].String()))
			}
		}

		return pb, nil
	}))

	// Inits a PubSubEndpoint in "sub" mode => will implement the Watcher
	endpoints.Register(subScheme, endpoints.OpenURLFunc(func(ctx context.Context, u *url.URL, compose ...*url.URL) (model.Endpoint, error) {
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

		em := &PubSubEndpoint{
			isPub:      false,
			queueURL:   queueURL,
			AsyncQueue: aq,
		}
		if err := em.parseSubEndpoints(ctx, snapshotURL); err != nil {
			return nil, err
		}
		if err := em.parseMetaGlobs(ctx, u); err != nil {
			return nil, err
		}

		if len(compose) > 2 {
			dataEndpoint, err := endpoints.OpenEndpoint(ctx, compose[2].String())
			if err != nil {
				return nil, err
			}
			if src, ok := dataEndpoint.(model.DataSyncSource); ok {
				return &DataPubSubEndpoint{
					PubSubEndpoint: em,
					src:            src,
				}, nil
			} else {
				return nil, errors.New(fmt.Sprintf("third URL %s does not open a DataSyncSource", compose[2].String()))
			}
		}

		return em, nil
	}))

}

type PubSubEndpoint struct {
	// Whether it's a Pub (true) or a Sub(false)
	isPub bool

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

type DataPubSubEndpoint struct {
	*PubSubEndpoint
	src model.DataSyncSource
	tgt model.DataSyncTarget
}

type writeWrapper struct {
	io.WriteCloser
	closeCallback func() error
}

func (w *writeWrapper) Close() error {
	if er := w.WriteCloser.Close(); er != nil {
		return er
	}
	return w.closeCallback()
}

type readWrapper struct {
	io.ReadCloser
	closeCallback func() error
}

func (r *readWrapper) Close() error {
	if er := r.ReadCloser.Close(); er != nil {
		r.closeCallback() // still try to trigger CreateNode even if close failed, to avoid missing events in sync
		return er
	}
	return r.closeCallback()
}

func (d *DataPubSubEndpoint) GetWriterOn(cancel context.Context, path string, targetSize int64, node tree.N) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {
	if node == nil {
		err = errors.New("node must not be nil")
		return
	}
	if d.tgt == nil {
		err = errors.New("endpoint DataSyncTarget must not be nil")
		return
	}
	// Flat storage
	out, writeDone, writeErr, err = d.tgt.GetWriterOn(cancel, node.GetUuid(), targetSize, node)
	if err != nil {

	}
	// After copy is finished, call CreateNode to trigger event and index in snapshot
	return &writeWrapper{
		WriteCloser: out,
		closeCallback: func() error {
			return d.CreateNode(cancel, node, true)
		},
	}, writeDone, writeErr, nil
}

func (d *DataPubSubEndpoint) GetReaderOn(ctx context.Context, path string, node tree.N) (out io.ReadCloser, err error) {
	if node == nil {
		err = errors.New("node must not be nil")
		return
	}
	if d.src == nil {
		err = errors.New("endpoint DataSyncSource must not be nil")
		return
	}
	// Read node by Uuid
	out, err = d.src.GetReaderOn(ctx, node.GetUuid(), node)
	if err != nil {
		return nil, err
	}
	// After copy is finished, call CreateNode to trigger event and index in snapshot
	return &readWrapper{
		ReadCloser: out,
		closeCallback: func() error {
			return d.CreateNode(ctx, node, true)
		},
	}, nil
}

func (e *PubSubEndpoint) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:            pubScheme + ":///?queue=" + e.queueURL.Scheme + "&snapshot=" + e.snapURL.Scheme,
		IsAsynchronous: true,
	}
}

func (e *PubSubEndpoint) parseMetaGlobs(ctx context.Context, u *url.URL) error {
	// Parse metadataGlobs
	for _, met := range strings.Split(u.Query().Get("metadataGlobs"), ",") {
		if g, err := glob.Compile(met); err != nil {
			return err
		} else {
			e.metaGlob = append(e.metaGlob, g)
		}
	}
	return nil
}

func (e *PubSubEndpoint) parseSubEndpoints(ctx context.Context, snapshotURL *url.URL) error {
	// Build a Snapshot to be used as internal store - type should be passed by URL
	snap, er := endpoints.OpenEndpoint(ctx, snapshotURL.String())
	if er != nil {
		return er
	}
	e.snapURL = snapshotURL
	pss, ok1 := snap.(model.PathSyncSource)
	pst, ok2 := snap.(model.PathSyncTarget)
	if !ok1 || !ok2 {
		return fmt.Errorf("invalid path endpoint type: %T", snap)
	}
	e.PathSyncSource = pss
	e.PathSyncTarget = pst

	e.sessionProvider, _ = snap.(model.SessionProvider)
	e.metaReceiver, _ = snap.(model.MetadataReceiver)

	return nil
}

// LoadNode loads a given node by its path from this endpoint
// Redeclare it to disambiguate LoadNode from PathSyncSource & PathSyncTarget
func (e *PubSubEndpoint) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {
	return e.PathSyncTarget.LoadNode(ctx, path, extendedStats...)
}

// Watch sets up an event watcher on the nodes
func (e *PubSubEndpoint) Watch(ctx context.Context, recursivePath string) (*model.WatchObject, error) {

	if e.isPub {
		return nil, errors.WithMessage(errors.StatusNotImplemented, "watch not supported in pub mode")
	}

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	wConn := make(chan model.WatchConnectionInfo)

	var cbWg stdsync.WaitGroup

	wo := &model.WatchObject{
		EventInfoChan:  eventChan,
		ErrorChan:      errorChan,
		DoneChan:       doneChan,
		ConnectionInfo: wConn,
	}

	er := e.AsyncQueue.Consume(func(ctx context.Context, messages ...broker.Message) {
		cbWg.Add(1)
		defer cbWg.Done()
		for _, msg := range messages {

			event := &sync.SyncEvent{}
			_, er := msg.Unmarshal(ctx, event)
			if er != nil {
				wo.ErrorChan <- er
			}
			if nodeEvent := event.GetNodeChangeEvent(); nodeEvent != nil {
				log.Logger(ctx).Info("node change event", zap.Any("event", nodeEvent))
				switch nodeEvent.Type {
				case tree.NodeChangeEvent_CREATE:
					if nodeEvent := event.GetNodeChangeEvent(); nodeEvent != nil {
						target := nodeEvent.GetTarget()

						// Skip if metadata not yet loaded
						if target.GetSize() == 0 && target.GetEtag() == "-1" && target.IsLeaf() {
							log.Logger(ctx).Info("Node is leaf and has 0 size and no etag", zap.String("path", target.GetPath()), zap.Any("type", target.GetType()))
							// Skip this event, wait for the UPDATE_META event
						} else {
							mm, _ := nodeEvent.Metadata["update_if_exists"]
							if er := e.PathSyncTarget.CreateNode(ctx, nodeEvent.GetTarget(), mm == "true"); er != nil {
								wo.ErrorChan <- er
								continue
							}
						}
					}

					// else {
					// <-time.After(time.Second)
					// }
				case tree.NodeChangeEvent_DELETE:
					if er := e.PathSyncTarget.DeleteNode(ctx, nodeEvent.GetSource().GetPath()); er != nil {
						wo.ErrorChan <- er
						continue
					}
				case tree.NodeChangeEvent_UPDATE_PATH:
					if nodeEvent := event.GetNodeChangeEvent(); nodeEvent != nil {
						target := nodeEvent.GetTarget()
						// Skip if metadata not yet loaded
						if target.GetSize() == 0 && target.GetEtag() == "-1" && target.IsLeaf() {
							log.Logger(ctx).Info("Node is leaf and has 0 size and no etag", zap.String("path", target.GetPath()), zap.Any("type", target.GetType()))
							// Skip this event, wait for the UPDATE_META event
						} else {
							if er := e.PathSyncTarget.MoveNode(ctx, nodeEvent.GetSource().GetPath(), nodeEvent.GetTarget().GetPath()); er != nil {
								wo.ErrorChan <- er
								continue
							}
						}
					}
				}

				// Now it stored in snapshot, send an event for further sync.
				// Transform NodeChangeEvent into modelEvents
				if modelEvent, ok := events.TreeNodeChangeToModelEvent(nodeEvent, time.Now(), nil); ok {
					eventChan <- modelEvent
				}

			} else if userMetaEvent := event.GetUserMetaEvent(); userMetaEvent != nil {

				um := userMetaEvent.UserMeta
				if um.ResolvedNode == nil {
					wo.ErrorChan <- fmt.Errorf("user metadata event not resolved")
					continue
				}
				node, err := e.PathSyncTarget.LoadNode(ctx, um.ResolvedNode.GetPath())
				if err != nil {
					wo.ErrorChan <- err
					continue
				}
				um.ResolvedNode = node.AsProto()

				if e.metaReceiver != nil {
					switch userMetaEvent.Operation {
					case idm.UpdateUserMetaEvent_PUT:
						if er := e.metaReceiver.CreateMetadata(ctx, node, um.Namespace, um.JsonValue); er != nil {
							wo.ErrorChan <- er
							continue
						}
					case idm.UpdateUserMetaEvent_DELETE:
						if er := e.metaReceiver.DeleteMetadata(ctx, node, um.Namespace); er != nil {
							wo.ErrorChan <- er
							continue
						}
					}
				}

				// Transform UserMetaEvent into modelEvents
				modelEvent, _ := events.UserMetaToModelEvent(userMetaEvent, time.Now(), nil)
				eventChan <- modelEvent

			}
		}

	})
	if er != nil {
		close(wConn)
		close(doneChan)
		close(errorChan)
		close(eventChan)
		return nil, er
	}
	go func() {
		defer func() {
			_ = e.AsyncQueue.Close(ctx) // triggers Consume goroutine to exit

			// Wait for the consume callback to actually return before closing
			// downstream channels, so we cannot panic with "send on closed channel".
			if d, ok := e.AsyncQueue.(interface{ Done() <-chan struct{} }); ok {
				select {
				case <-d.Done():
				case <-time.After(5 * time.Second):
					log.Logger(ctx).Warn("sync pubsub: consume goroutine did not exit within 5s")
				}
			}
			cbWg.Wait()

			close(wConn)
			close(errorChan)
			close(eventChan)
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case <-doneChan:
				return
			}
		}
	}()
	return wo, nil
}

func (e *PubSubEndpoint) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	// Local snapshot is authoritative — write it first.
	if err = e.PathSyncTarget.CreateNode(ctx, node, updateIfExists); err != nil {
		return err
	}
	if e.isPub {
		mm := map[string]string{}
		if updateIfExists {
			mm["update_if_exists"] = "true"
		}
		if er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
			Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
				Type:     tree.NodeChangeEvent_CREATE,
				Source:   nil,
				Target:   node.AsProto(),
				Metadata: mm,
			}},
		}); er != nil {
			log.Logger(ctx).Warn("sync pubsub: snapshot updated but queue Push failed; relying on reconcile",
				zap.Error(er))
			return er
		}
	}
	return nil
}

func (e *PubSubEndpoint) DeleteNode(ctx context.Context, path string) (err error) {
	if err = e.PathSyncTarget.DeleteNode(ctx, path); err != nil {
		return err
	}
	if e.isPub {
		if er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
			Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_DELETE,
				Source: &tree.Node{Path: path},
				Target: nil,
			}},
		}); er != nil {
			log.Logger(ctx).Warn("sync pubsub: snapshot updated but queue Push failed; relying on reconcile",
				zap.Error(er))
			return er
		}
	}
	return nil
}

func (e *PubSubEndpoint) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {
	if err = e.PathSyncTarget.MoveNode(ctx, oldPath, newPath); err != nil {
		return err
	}
	if e.isPub {
		if er := e.AsyncQueue.Push(ctx, &sync.SyncEvent{
			Message: &sync.SyncEvent_NodeChangeEvent{NodeChangeEvent: &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_UPDATE_PATH,
				Source: &tree.Node{Path: oldPath},
				Target: &tree.Node{Path: newPath},
			}},
		}); er != nil {
			log.Logger(ctx).Warn("sync pubsub: snapshot updated but queue Push failed; relying on reconcile",
				zap.Error(er))
			return er
		}
	}
	return nil
}

// ProvidesMetadataNamespaces implements model.MetadataProvider interface
func (e *PubSubEndpoint) ProvidesMetadataNamespaces() ([]glob.Glob, bool) {
	return e.metaGlob, len(e.metaGlob) > 0
}

// CreateMetadata add a metadata to the node
func (e *PubSubEndpoint) CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	if e.isPub {
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
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.CreateMetadata(ctx, node, namespace, jsonValue)
	}
	return nil
}

// UpdateMetadata updates an existing metadata value
func (e *PubSubEndpoint) UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	if e.isPub {
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
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.UpdateMetadata(ctx, node, namespace, jsonValue)
	}
	return nil

}

// DeleteMetadata deletes a metadata by namespace
func (e *PubSubEndpoint) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	if e.isPub {
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
	}
	if e.metaReceiver != nil {
		return e.metaReceiver.DeleteMetadata(ctx, node, namespace)
	}
	return nil
}

// Implement SessionProvider methods if the snapshot endpoint can handle it

func (e *PubSubEndpoint) StartSession(ctx context.Context, rootNode tree.N, silent bool) (string, error) {
	if e.sessionProvider != nil {
		return e.sessionProvider.StartSession(ctx, rootNode, silent)
	}
	return "fake-session", nil
}

func (e *PubSubEndpoint) FlushSession(ctx context.Context, sessionUuid string) error {
	if e.sessionProvider != nil {
		return e.sessionProvider.FlushSession(ctx, sessionUuid)
	}
	return nil
}

func (e *PubSubEndpoint) FinishSession(ctx context.Context, sessionUuid string) error {
	if e.sessionProvider != nil {
		return e.sessionProvider.FinishSession(ctx, sessionUuid)
	}
	return nil
}

func (e *PubSubEndpoint) Shutdown() (err error) {
	if sh, ok := e.PathSyncTarget.(model.Shutdowner); ok {
		return sh.Shutdown()
	}
	return nil
}
