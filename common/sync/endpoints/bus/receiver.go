package bus

import (
	"context"
	"time"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/sync/endpoints/bus/events"
	"github.com/pydio/cells/v5/common/sync/model"
)

type Receiver struct {
	broker.AsyncQueue
	topic string

	uuidProvider model.UuidProvider
}

// Watch sets up an event watcher on the nodes
func (r *Receiver) Watch(ctx context.Context, recursivePath string) (*model.WatchObject, error) {

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

	er := r.AsyncQueue.Consume(func(ctx context.Context, messages ...broker.Message) {

		for _, msg := range messages {

			event := &sync.SyncEvent{}
			_, er := msg.Unmarshal(ctx, event)
			if er != nil {
				wo.ErrorChan <- er
			}
			if nodeEvent := event.GetNodeChangeEvent(); nodeEvent != nil {

				// Transform NodeChangeEvent into modelEvents
				if modelEvent, ok := events.TreeNodeChangeToModelEvent(nodeEvent, time.Now(), nil); ok {
					eventChan <- modelEvent
				}

			} else if userMetaEvent := event.GetUserMetaEvent(); userMetaEvent != nil {

				// Transform UserMetaEvent into modelEvents
				um := userMetaEvent.UserMeta
				node, err := r.uuidProvider.LoadNodeByUuid(ctx, um.Uuid)
				if err != nil {
					wo.ErrorChan <- err
					continue
				}
				um.ResolvedNode = node.AsProto()
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
			_ = r.AsyncQueue.Close(ctx)
			close(wConn)
			close(doneChan)
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
