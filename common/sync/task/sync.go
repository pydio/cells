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

	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/sync/proc"
)

type Sync struct {
	Source    model.Endpoint
	Target    model.Endpoint
	Direction model.DirectionType
	Roots     []string
	watch     bool

	snapshotFactory model.SnapshotFactory
	echoFilter      *filters.EchoFilter
	eventsBatchers  []*filters.EventsBatcher
	processor       *proc.ConnectedProcessor

	watchersChan []chan bool
	watchConn    chan *model.EndpointStatus
	statuses     chan merger.ProcessStatus
	runDone      chan interface{}
}

func NewSync(left model.Endpoint, right model.Endpoint, direction model.DirectionType, roots ...string) *Sync {
	return &Sync{
		Source:    left,
		Target:    right,
		Direction: direction,
		Roots:     roots,
	}
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context, withWatches bool) {

	// Init processor
	s.processor = proc.NewConnectedProcessor(ctx)
	s.processor.Start()

	// Init EchoFilter
	if s.Direction == model.DirectionBi {
		s.echoFilter = filters.NewEchoFilter()
		s.processor.SetLocksChan(s.echoFilter.GetLocksChan())
		s.echoFilter.Start()
	}

	s.watch = withWatches
	if withWatches {
		s.startWatchers(ctx)
	} else if s.watchConn != nil {

		s.watchConn <- &model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    s.Source.GetEndpointInfo(),
		}
		s.watchConn <- &model.EndpointStatus{
			WatchConnection: model.WatchConnected,
			EndpointInfo:    s.Target.GetEndpointInfo(),
		}
	}

}

// Pause should pause the sync
func (s *Sync) Pause(ctx context.Context) {
	if s.watch {
		s.stopWatchers()
	}
}

// Resume should resume the sync
func (s *Sync) Resume(ctx context.Context) {
	if s.watch {
		s.startWatchers(ctx)
	}
}

// Shutdown closes channels
func (s *Sync) Shutdown() {
	defer func() {
		// ignore 'close on closed channel'
		recover()
	}()
	if s.watch {
		s.stopWatchers()
	}
	if s.watchConn != nil {
		close(s.watchConn)
	}
	s.processor.Stop()
	if s.echoFilter != nil {
		s.echoFilter.Stop()
	}
}

// Run runs the sync with panic recovery
func (s *Sync) Run(ctx context.Context, dryRun bool, force bool) (model.Stater, error) {
	var err error
	defer func() {
		if e := recover(); e != nil {
			if er, ok := e.(error); ok {
				err = er
				if s.statuses != nil {
					s.statuses <- merger.ProcessStatus{
						IsError:      true,
						StatusString: err.Error(),
						Progress:     1,
					}
				}
			}
		}
	}()
	return s.run(ctx, dryRun, force)
}

func (s *Sync) ReApplyPatch(ctx context.Context, patch merger.Patch) {
	s.processor.PatchChan <- patch
}

// SetSnapshotFactory set up a factory for loading/saving snapshots
func (s *Sync) SetSnapshotFactory(factory model.SnapshotFactory) {
	s.snapshotFactory = factory
}

// SetSyncEventsChan wires internal sync event to external status channels
func (s *Sync) SetSyncEventsChan(statusChan chan merger.ProcessStatus, batchDone chan interface{}, events chan interface{}) {
	s.statuses = statusChan
	s.runDone = batchDone
	if events != nil {
		// Forward internal events to sync event
		s.watchConn = make(chan *model.EndpointStatus)
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
}

// BroadcastCloseSession forwards session id to underlying batchers
func (s *Sync) BroadcastCloseSession(sessionUuid string) {
	for _, b := range s.eventsBatchers {
		b.ForceCloseSession(sessionUuid)
	}
}
