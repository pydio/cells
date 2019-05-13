package task

import (
	"context"
	"time"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/model"
	"go.uber.org/zap"
)

// SetupWatcher starts watching events for sync
func (s *Sync) SetupWatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget) error {

	var err error
	watchObject, err := source.Watch("")
	if err != nil {
		log.Logger(ctx).Error("Error While Setting up Watcher on source", zap.Any("source", source), zap.Error(err))
		return err
	}

	s.doneChans = append(s.doneChans, watchObject.DoneChan)

	input := make(chan model.EventInfo)
	inputCloser := make(chan bool)
	s.doneChans = append(s.doneChans, inputCloser)

	s.processor.AddRequeueChannel(source, input)

	out := input

	// If EchoFilter is registered, pipe
	if s.echoFilter != nil {
		out = s.echoFilter.Pipe(out)
	}

	// If there are selective roots, pipe
	if len(s.Roots) > 0 {
		rootsFilter := filters.NewSelectiveRootsFilter(s.Roots)
		out = rootsFilter.Pipe(out)
	}

	// Finally Batch filtered events and register batcher for force-close session broadcast
	batcher := filters.NewEventsBatcher(ctx, source, target, s.statuses, s.runDone)
	batcher.Batch(out, s.processor.PatchChan)
	s.eventsBatchers = append(s.eventsBatchers, batcher)

	go func() {
		// Wait for all events.
		for {
			select {
			case event, ok := <-watchObject.Events():
				if !ok {
					<-time.After(1 * time.Second)
					continue
				}
				if !s.paused {
					input <- event
				}
			case err, ok := <-watchObject.Errors():
				if !ok {
					<-time.After(5 * time.Second)
					continue
				}
				if err != nil {
					log.Logger(ctx).Error("Received error from watcher", zap.Error(err))
				}
			case connInfo := <-watchObject.ConnectionInfo:
				if s.watchConn != nil {
					s.watchConn <- &model.EndpointStatus{
						WatchConnection: connInfo,
						EndpointInfo:    source.GetEndpointInfo(),
					}
				}
			case <-inputCloser:

				close(input)
				return
			}
		}
	}()

	if watchObject.ConnectionInfo == nil && s.watchConn != nil {
		// This Watcher does not send info about its connection state - so we declare it as connected
		s.watchConn <- &model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source.GetEndpointInfo(),
		}
	}

	return nil

}
