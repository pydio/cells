package chanwatcher

import (
	"context"
	"path"
	"strings"
	"time"

	servicescommon "github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
)

type Watcher struct {
	model.PathSyncSource
	Context     context.Context
	NodeChanges chan *tree.NodeChangeEvent
	Prefix      string
}

func NewWatcher(ctx context.Context, src model.PathSyncSource, prefix string) *Watcher {
	return &Watcher{
		PathSyncSource: src,
		NodeChanges:    make(chan *tree.NodeChangeEvent, 1000),
		Prefix:         prefix,
		Context:        ctx,
	}
}

func (w *Watcher) Watch(recursivePath string) (*model.WatchObject, error) {

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	wConn := make(chan model.WatchConnectionInfo)

	wo := &model.WatchObject{
		EventInfoChan:  eventChan,
		ErrorChan:      errorChan,
		DoneChan:       doneChan,
		ConnectionInfo: wConn,
	}

	go func() {
		for {
			select {
			case event := <-w.NodeChanges:
				var node *tree.Node
				var eType model.EventType
				switch event.Type {
				case tree.NodeChangeEvent_CREATE:
					eType = model.EventCreate
					node = event.GetTarget()
				case tree.NodeChangeEvent_DELETE:
					eType = model.EventRemove
					node = event.GetSource()
				default:
					break
				}
				if node != nil {
					meta := event.Metadata
					if meta == nil {
						meta = make(map[string]string)
					}
					cleanMeta := make(map[string]string)
					for k, v := range meta {
						if k == servicescommon.XPydioSessionUuid && strings.HasPrefix(v, servicescommon.SyncSessionClose_) {
							cleanMeta[k] = strings.TrimPrefix(v, servicescommon.SyncSessionClose_)
						} else {
							cleanMeta[k] = v
						}
					}
					objectPath := strings.TrimPrefix(node.GetPath(), w.Prefix)
					log.Logger(w.Context).Debug("Got Event", event.Zap())
					// If file is .pydio, also send an event on corresponding folder
					if strings.HasSuffix(objectPath, servicescommon.PydioSyncHiddenFile) {
						eventChan <- model.EventInfo{
							Type:     eType,
							Time:     time.Now().Format(time.RFC822),
							Path:     path.Dir(objectPath),
							Etag:     node.GetEtag(),
							Folder:   true,
							Size:     node.GetSize(),
							Source:   w.PathSyncSource,
							Metadata: cleanMeta,
						}
					}
					eventChan <- model.EventInfo{
						Type:     eType,
						Time:     time.Now().Format(time.RFC822),
						Path:     objectPath,
						Etag:     node.GetEtag(),
						Folder:   !node.IsLeaf(),
						Size:     node.GetSize(),
						Source:   w.PathSyncSource,
						Metadata: meta,
					}
				}

			case <-w.Context.Done():
				break
			}
		}
	}()

	return wo, nil
}

func (w *Watcher) ComputeChecksum(ctx context.Context, node model.Node) error {
	if cs, ok := w.PathSyncSource.(model.ChecksumProvider); ok {
		return cs.ComputeChecksum(ctx, node)
	} else {
		return nil
	}
}
