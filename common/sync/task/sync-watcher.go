/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package task

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/sync/filters"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// startWatchers starts events watchers as required on source and target endpoints
func (s *Sync) startWatchers(ctx context.Context) {

	source, sOk := model.AsPathSyncSource(s.Source)
	target, tOk := model.AsPathSyncTarget(s.Target)
	if s.Direction != model.DirectionLeft && sOk && tOk {
		if stop, err := s.setupWatcher(ctx, source, target); err == nil {
			s.addWatcher(stop)
		} else {
			log.Logger(ctx).Error("Could not setup watcher on "+s.Source.GetEndpointInfo().URI, zap.Error(err))
		}
	} else {
		// No need to setup watcher, assume connected
		s.watchStatus(&model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source.GetEndpointInfo(),
		})
	}
	source2, sOk2 := model.AsPathSyncSource(s.Target)
	target2, tOk2 := model.AsPathSyncTarget(s.Source)
	if s.Direction != model.DirectionRight && sOk2 && tOk2 {
		if stop, err := s.setupWatcher(ctx, source2, target2); err == nil {
			s.addWatcher(stop)
		} else {
			log.Logger(ctx).Error("Could not setup watcher on "+s.Target.GetEndpointInfo().URI, zap.Error(err))
		}
	} else {
		// No need to setup watcher, assume connected
		s.watchStatus(&model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source2.GetEndpointInfo(),
		})
	}

}

// stopWatchers sends stop instruction to events watchers
func (s *Sync) stopWatchers() {
	s.watchersLock.Lock()
	defer s.watchersLock.Unlock()
	for _, stop := range s.watchersChan {
		close(stop)
	}
	s.watchersChan = []chan bool{}
	s.eventsBatchers = []*filters.EventsBatcher{} // reset batchers as well
}

// setupWatcher starts watching events for sync
func (s *Sync) setupWatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget) (chan bool, error) {

	var err error
	watchObject, err := source.Watch(ctx, "")
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
	if filters.NeedsSelectiveRootsFilter(s.Roots) {
		out = filters.NewSelectiveRootsFilter(s.Roots).Pipe(out)
	}

	// Finally Batch filtered events and register batcher for force-close session broadcast
	batcher := filters.NewEventsBatcher(ctx, source, target, s.Ignores)
	batcher.SetupChannels(s.statuses, s.runDone, s.cmd)
	batcher.SetEndpointStatusSender(func(st *model.EndpointStatus) { s.watchStatus(st) })
	batcher.Batch(out, s.patchChan)
	s.watchersLock.Lock()
	s.eventsBatchers = append(s.eventsBatchers, batcher)
	s.watchersLock.Unlock()

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
					if err.Error() == "API Not Supported" {
						// Special case for S3 Client => Send Disconnected Status if API does not support events watch
						log.Logger(ctx).Error("Endpoint does not support watching with this config", zap.Error(err))
						s.watchStatus(&model.EndpointStatus{
							WatchConnection: model.WatchDisconnected,
							EndpointInfo:    source.GetEndpointInfo(),
						})
						close(input)
						return
					}
				}
			case connInfo := <-watchObject.ConnectionInfo:
				s.watchStatus(&model.EndpointStatus{
					WatchConnection: connInfo,
					EndpointInfo:    source.GetEndpointInfo(),
				})
			case <-inputCloser:
				inputClosed = true
				watchObject.DoneChan <- true
				close(input)
				return
			}
		}
	}()

	if watchObject.ConnectionInfo == nil {
		// This Watcher does not send info about its connection state - so we declare it as connected
		s.watchStatus(&model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    source.GetEndpointInfo(),
		})
	}

	return inputCloser, nil

}

// addWatcher registers a watcher stop chan, or stops the watcher if Shutdown has started
func (s *Sync) addWatcher(stop chan bool) {
	s.watchersLock.Lock()
	defer s.watchersLock.Unlock()
	if s.watchersShutdown {
		close(stop)
		return
	}
	s.watchersChan = append(s.watchersChan, stop)
}

// watchStatus sends a status on watchConn, if any, unless Shutdown has started (see sendWatchConn)
func (s *Sync) watchStatus(status *model.EndpointStatus) {
	s.connLock.Lock()
	wc := s.watchConn
	s.connLock.Unlock()
	if wc != nil {
		s.sendWatchConn(wc, status)
	}
}
