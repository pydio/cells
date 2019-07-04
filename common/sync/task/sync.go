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

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/sync/proc"
)

type Sync struct {
	Source           model.Endpoint
	Target           model.Endpoint
	Direction        model.DirectionType
	Roots            []string
	Ignores          []glob.Glob
	SkipTargetChecks bool

	snapshotFactory model.SnapshotFactory
	echoFilter      *filters.EchoFilter
	eventsBatchers  []*filters.EventsBatcher
	processor       *proc.ConnectedProcessor
	patchPiper      merger.PatchPiper

	watch        bool
	watchersChan []chan bool
	watchConn    chan *model.EndpointStatus
	statuses     chan model.ProcessStatus
	runDone      chan interface{}
	cmd          *model.Command
	patchChan    chan merger.Patch
}

// NewSync creates a new sync task
func NewSync(left model.Endpoint, right model.Endpoint, direction model.DirectionType) *Sync {
	return &Sync{
		Source:    left,
		Target:    right,
		Direction: direction,
	}
}

// SetFilters allows passing selective roots (includes) and ignores (excludes).
// Ignores are a list of patterns conforming to the glob standard, with support for double star
func (s *Sync) SetFilters(roots []string, excludes []string) {
	if roots != nil {
		s.Roots = roots
	}
	for _, i := range excludes {
		if g, e := glob.Compile(i, '/'); e == nil {
			s.Ignores = append(s.Ignores, g)
		} else {
			log.Logger(context.Background()).Error("Unsupported glob pattern format!", zap.Error(e))
		}
	}
}

// SetPatchPiper adds a filter on the Patch channel to do something with patches
// before they are processed
func (s *Sync) SetPatchPiper(piper merger.PatchPiper) {
	s.patchPiper = piper
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context, withWatches bool) {

	// Init processor
	s.processor = proc.NewConnectedProcessor(ctx, s.cmd)
	if s.SkipTargetChecks {
		s.processor.SkipTargetChecks = true
	}
	s.patchChan = s.processor.PatchChan
	if s.patchPiper != nil {
		s.patchChan = s.patchPiper.Pipe(s.patchChan)
	}
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
					s.statuses <- model.ProcessStatus{
						IsError:      true,
						StatusString: err.Error(),
						Progress:     1,
					}
				}
			}
		}
	}()
	stater, err := s.run(ctx, dryRun, force)
	if err != nil && s.statuses != nil {
		s.statuses <- model.ProcessStatus{
			IsError:      true,
			StatusString: err.Error(),
			Progress:     1,
		}
	}
	return stater, err
}

func (s *Sync) ReApplyPatch(ctx context.Context, patch merger.Patch) {
	patch.SkipFilterToTarget(false)
	patch.CleanErrors()
	patch.SetupChannels(s.statuses, s.runDone, s.cmd)
	s.patchChan <- patch
}

// SetSnapshotFactory set up a factory for loading/saving snapshots
func (s *Sync) SetSnapshotFactory(factory model.SnapshotFactory) {
	s.snapshotFactory = factory
}

// SetupEventsChan wires internal sync event to external status channels
func (s *Sync) SetupEventsChan(statusChan chan model.ProcessStatus, batchDone chan interface{}, events chan interface{}) {
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

func (s *Sync) SetupCmd(cmd *model.Command) {
	s.cmd = cmd
}

// BroadcastCloseSession forwards session id to underlying batchers
func (s *Sync) BroadcastCloseSession(sessionUuid string) {
	for _, b := range s.eventsBatchers {
		b.ForceCloseSession(sessionUuid)
	}
}
