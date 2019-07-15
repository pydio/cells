package task

import (
	"context"
	"time"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/model"
	"go.uber.org/zap"
)

// startWatchers starts events watchers as required on source and target endpoints
func (s *Sync) startWatchers(ctx context.Context) {

	source, sOk := model.AsPathSyncSource(s.Source)
	target, tOk := model.AsPathSyncTarget(s.Target)
	if s.Direction != model.DirectionLeft && sOk && tOk {
		if stop, err := s.setupWatcher(ctx, source, target); err == nil {
			s.watchersChan = append(s.watchersChan, stop)
		} else {
			log.Logger(ctx).Error("Could not setup watcher on "+s.Source.GetEndpointInfo().URI, zap.Error(err))
		}
	} else if s.watchConn != nil {
		// No need to setup watcher, assume connected
		s.watchConn <- &model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source.GetEndpointInfo(),
		}
	}
	source2, sOk2 := model.AsPathSyncSource(s.Target)
	target2, tOk2 := model.AsPathSyncTarget(s.Source)
	if s.Direction != model.DirectionRight && sOk2 && tOk2 {
		if stop, err := s.setupWatcher(ctx, source2, target2); err == nil {
			s.watchersChan = append(s.watchersChan, stop)
		} else {
			log.Logger(ctx).Error("Could not setup watcher on "+s.Target.GetEndpointInfo().URI, zap.Error(err))
		}
	} else if s.watchConn != nil {
		// No need to setup watcher, assume connected
		s.watchConn <- &model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source2.GetEndpointInfo(),
		}
	}

}

// stopWatchers sends stop instruction to events watchers
func (s *Sync) stopWatchers() {
	for _, stop := range s.watchersChan {
		close(stop)
	}
	s.watchersChan = []chan bool{}
}

// setupWatcher starts watching events for sync
func (s *Sync) setupWatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget) (chan bool, error) {

	var err error
	watchObject, err := source.Watch("")
	if err != nil {
		log.Logger(ctx).Error("Error While Setting up Watcher on source", zap.Any("source", source), zap.Error(err))
		return nil, err
	}

	//s.doneChans = append(s.doneChans, watchObject.DoneChan)

	var inputClosed bool
	input := make(chan model.EventInfo)
	inputCloser := make(chan bool)

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
	batcher := filters.NewEventsBatcher(ctx, source, target, s.Ignores)
	batcher.SetupChannels(s.statuses, s.runDone, s.cmd)
	if s.watchConn != nil {
		batcher.SetEndpointStatusChan(s.watchConn)
	}
	batcher.Batch(out, s.patchChan)
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
				if !inputClosed {
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
				inputClosed = true
				watchObject.DoneChan <- true
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

	return inputCloser, nil

}
