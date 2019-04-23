/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package task defines a synchronization task
package task

import (
	"context"
	"time"

	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/sync/proc"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

type Sync struct {
	Source    model.Endpoint
	Target    model.Endpoint
	Direction model.DirectionType

	SnapshotFactory model.SnapshotFactory
	EchoFilter      *filters.EchoFilter
	Processor       *proc.Processor

	batcher   *filters.EventsBatcher
	doneChans []chan bool

	watchConn chan model.WatchConnectionInfo
}

// BroadcastCloseSession forwards session id to underlying batchers
func (s *Sync) BroadcastCloseSession(sessionUuid string) {
	if s.batcher == nil {
		return
	}
	s.batcher.ForceCloseSession(sessionUuid)
}

// SetupWatcher starts watching events for sync
func (s *Sync) SetupWatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget) error {

	var err error
	watchObject, err := source.Watch("", s.watchConn)
	if err != nil {
		log.Logger(ctx).Error("Error While Setting up Watcher on source", zap.Any("source", source), zap.Error(err))
		return err
	}

	s.doneChans = append(s.doneChans, watchObject.DoneChan)

	// Now wire batches to processor
	s.batcher = filters.NewEventsBatcher(ctx, source, target)

	filterIn, filterOut := s.EchoFilter.CreateFilter()
	s.Processor.AddRequeueChannel(source, filterIn)
	go s.batcher.BatchEvents(filterOut, s.Processor.BatchesChannel, 1*time.Second)

	go func() {
		// Wait for all events.
		for {
			select {
			case event, ok := <-watchObject.Events():
				if !ok {
					<-time.After(1 * time.Second)
					continue
				}
				//log.Logger(ctx).Info("WATCH EVENT", zap.Any("e", event))
				filterIn <- event
			case err, ok := <-watchObject.Errors():
				if !ok {
					<-time.After(5 * time.Second)
					continue
				}
				if err != nil {
					log.Logger(ctx).Error("Received error from watcher", zap.Error(err))
				}
			}
		}
	}()

	return nil

}

// Shutdown closes channels
func (s *Sync) Shutdown() {
	defer func() {
		// ignore 'close on closed channel'
		recover()
	}()
	for _, channel := range s.doneChans {
		close(channel)
	}
	if s.watchConn != nil {
		close(s.watchConn)
	}
	s.Processor.Shutdown()
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context) {
	source, sOk := model.AsPathSyncSource(s.Source)
	target, tOk := model.AsPathSyncTarget(s.Target)
	if s.Direction != model.DirectionLeft && sOk && tOk {
		s.SetupWatcher(ctx, source, target)
	}
	source2, sOk2 := model.AsPathSyncSource(s.Target)
	target2, tOk2 := model.AsPathSyncTarget(s.Source)
	if s.Direction != model.DirectionRight && sOk2 && tOk2 {
		s.SetupWatcher(ctx, source2, target2)
	}
}

func (s *Sync) SetSnapshotFactory(factory model.SnapshotFactory) {
	s.SnapshotFactory = factory
}

func (s *Sync) SetSyncEventsChan(events chan interface{}) {
	// Forward internal events to sync event
	s.watchConn = make(chan model.WatchConnectionInfo)
	go func() {
		for {
			select {
			case e, ok := <-s.watchConn:
				if !ok {
					return
				}
				events <- e
			}
		}
	}()
}

func (s *Sync) Resync(ctx context.Context, dryRun bool, force bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (model.Stater, error) {
	var err error
	defer func() {
		if e := recover(); e != nil {
			if er, ok := e.(error); ok {
				err = er
				if statusChan != nil {
					statusChan <- model.BatchProcessStatus{
						IsError:      true,
						StatusString: err.Error(),
						Progress:     1,
					}
				}
			}
		}
	}()
	return s.Run(ctx, dryRun, force, statusChan, doneChan)
}

func NewSync(ctx context.Context, left model.Endpoint, right model.Endpoint, direction model.DirectionType) *Sync {

	filter := filters.NewEchoFilter()
	processor := proc.NewProcessor(ctx)
	processor.LocksChannel = filter.LockEvents
	processor.UnlocksChannel = filter.UnlockEvents
	go processor.ProcessBatches()
	go filter.ListenLocksEvents()

	return &Sync{
		Source:    left,
		Target:    right,
		Direction: direction,

		EchoFilter: filter,
		Processor:  processor,
	}

}
