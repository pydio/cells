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

	snapshotFactory model.SnapshotFactory
	echoFilter      *filters.EchoFilter
	eventsBatchers  []*filters.EventsBatcher
	processor       *proc.ConnectedProcessor

	paused    bool
	doneChans []chan bool
	watchConn chan model.WatchConnectionInfo
	statuses  chan merger.ProcessStatus
	runDone   chan interface{}
}

func NewSync(ctx context.Context, left model.Endpoint, right model.Endpoint, direction model.DirectionType, roots ...string) *Sync {

	s := &Sync{
		Source:    left,
		Target:    right,
		Direction: direction,
		Roots:     roots,
	}

	// Init processor
	s.processor = proc.NewConnectedProcessor(ctx)

	// Init EchoFilter
	if direction == model.DirectionBi {
		s.echoFilter = filters.NewEchoFilter()
		s.processor.SetLocksChan(s.echoFilter.GetLocksChan())
	}

	return s
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context) {

	s.processor.Start()
	if s.echoFilter != nil {
		s.echoFilter.Start()
	}

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

// Pause should pause the sync
func (s *Sync) Pause() {
	s.paused = true
}

// Resume should resume the sync
func (s *Sync) Resume() {
	s.paused = false
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
	s.processor.Stop()
	if s.echoFilter != nil {
		s.echoFilter.Stop()
	}
}

// Run runs the sync with panic recovery
func (s *Sync) Run(ctx context.Context, dryRun bool, force bool) (model.Stater, error) {
	if s.paused {
		return &merger.TreeDiff{}, nil
	}
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
		s.watchConn = make(chan model.WatchConnectionInfo)
		go func() {
			for {
				select {
				case e, ok := <-s.watchConn:
					if !ok {
						return
					}
					if !s.paused {
						events <- e
					}
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
