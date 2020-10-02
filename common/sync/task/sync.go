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
	"fmt"
	"path/filepath"
	"runtime/debug"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"

	"github.com/gobwas/glob"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

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
	FailsafeDeletes  bool

	snapshotFactory model.SnapshotFactory
	echoFilter      *filters.EchoFilter
	eventsBatchers  []*filters.EventsBatcher
	processor       *proc.ConnectedProcessor
	patchListener   merger.PatchListener

	watch        bool
	watchersChan []chan bool
	watchConn    chan *model.EndpointStatus
	statuses     chan model.Status
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

// SetPatchListener adds a listener on the Patch channel to do something with patches
// before they are processed
func (s *Sync) SetPatchListener(listener merger.PatchListener) {
	s.patchListener = listener
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context, withWatches bool) {

	// Init processor
	s.processor = proc.NewConnectedProcessor(ctx, s.cmd)
	if s.SkipTargetChecks {
		s.processor.SkipTargetChecks = true
	}
	s.patchChan = s.processor.PatchChan
	if s.patchListener != nil {
		s.processor.PatchListener = s.patchListener
	}
	s.processor.Ignores = s.Ignores
	s.processor.Start()

	// Init EchoFilter
	if s.Direction == model.DirectionBi {
		s.echoFilter = filters.NewEchoFilter()
		s.processor.SetLocksChan(s.echoFilter.GetLocksChan())
		s.echoFilter.Start()
	}

	if withWatches {
		s.startWatchers(ctx)
	} else if s.watchConn != nil {
		go func() {
			<-time.After(2 * time.Second)
			s.watchConn <- &model.EndpointStatus{
				WatchConnection: model.WatchConnected,
				EndpointInfo:    s.Source.GetEndpointInfo(),
			}
			s.watchConn <- &model.EndpointStatus{
				WatchConnection: model.WatchConnected,
				EndpointInfo:    s.Target.GetEndpointInfo(),
			}
		}()
	}

}

// Pause should pause the sync
func (s *Sync) Pause(ctx context.Context) {
	s.stopWatchers()
}

// Resume should resume the sync
func (s *Sync) Resume(ctx context.Context) {
	s.startWatchers(ctx)
}

// Shutdown closes channels
func (s *Sync) Shutdown() {
	defer func() {
		// ignore 'close on closed channel'
		recover()
	}()
	s.stopWatchers()
	if s.watchConn != nil {
		close(s.watchConn)
		s.watchConn = nil
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
			fmt.Println("stacktrace from panic: \n" + string(debug.Stack()))
			if er, ok := e.(error); ok {
				err = er
				if s.statuses != nil {
					s.statuses <- model.NewProcessingStatus(err.Error()).SetError(err).SetProgress(1)
				}
				if s.runDone != nil {
					s.runDone <- 0
				}
			}
		}
	}()

	stater, err := s.run(ctx, dryRun, force)
	if err != nil && s.statuses != nil {
		s.statuses <- model.NewProcessingStatus(err.Error()).SetError(err).SetProgress(1)
		if s.runDone != nil {
			if stater != nil {
				s.runDone <- stater
			} else {
				s.runDone <- 0
			}
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
func (s *Sync) SetupEventsChan(statusChan chan model.Status, batchDone chan interface{}, events chan interface{}) {
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

func (s *Sync) Capture(ctx context.Context, targetFolder string) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	if s.Direction == model.DirectionBi && s.snapshotFactory != nil {

		leftSnap, err := s.snapshotFactory.Load(source)
		if err != nil {
			return err
		}
		if e := s.walkToJSON(ctx, leftSnap, filepath.Join(targetFolder, "snap-source.json")); e != nil {
			return e
		}

		rightSnap, err := s.snapshotFactory.Load(targetAsSource)
		if err != nil {
			return err
		}
		if e := s.walkToJSON(ctx, rightSnap, filepath.Join(targetFolder, "snap-target.json")); e != nil {
			return e
		}

	}

	if e := s.walkToJSON(ctx, source, filepath.Join(targetFolder, "source.json")); e != nil {
		return e
	}

	if e := s.walkToJSON(ctx, targetAsSource, filepath.Join(targetFolder, "target.json")); e != nil {
		return e
	}

	return nil

}

func (s *Sync) RootStats(ctx context.Context, useSnapshots bool) (map[string]*model.EndpointRootStat, error) {

	endpoints := map[string]model.Endpoint{
		s.Source.GetEndpointInfo().URI: s.Source,
		s.Target.GetEndpointInfo().URI: s.Target,
	}
	if useSnapshots && s.Direction == model.DirectionBi && s.snapshotFactory != nil {
		source, _ := model.AsPathSyncSource(s.Source)
		targetAsSource, _ := model.AsPathSyncSource(s.Target)
		if leftSnap, err := s.snapshotFactory.Load(source); err == nil {
			endpoints[source.GetEndpointInfo().URI] = leftSnap
		}
		if rightSnap, err := s.snapshotFactory.Load(targetAsSource); err == nil {
			endpoints[s.Target.GetEndpointInfo().URI] = rightSnap
		}
	}
	lock := sync.Mutex{}
	result := make(map[string]*model.EndpointRootStat, len(endpoints))

	wg := &sync.WaitGroup{}
	wg.Add(len(endpoints))
	var errs []error
	for key, ep := range endpoints {
		epCopy := ep
		keyCopy := key
		go func() {
			defer wg.Done()
			if sourceRoots, e := s.statRoots(ctx, epCopy); e == nil {
				lock.Lock()
				log.Logger(ctx).Info("Got Stats for "+keyCopy, zap.Any("stats", sourceRoots))
				result[keyCopy] = sourceRoots
				lock.Unlock()
				if !useSnapshots && s.watchConn != nil {
					go func() {
						s.watchConn <- &model.EndpointStatus{
							WatchConnection: model.WatchStats,
							EndpointInfo:    epCopy.GetEndpointInfo(),
							Stats:           sourceRoots,
						}
					}()
				}
			} else {
				errs = append(errs, e)
				if !useSnapshots && s.watchConn != nil {
					go func() {
						s.watchConn <- &model.EndpointStatus{
							WatchConnection: model.WatchDisconnected,
							EndpointInfo:    epCopy.GetEndpointInfo(),
						}
					}()
				}
			}
		}()
	}
	wg.Wait()
	if len(errs) > 0 {
		return nil, errs[0]
	}
	return result, nil

}

func (s *Sync) walkToJSON(ctx context.Context, source model.PathSyncSource, jsonFile string) error {

	db := memory.NewMemDB()
	source.Walk(func(path string, node *tree.Node, err error) {
		db.CreateNode(ctx, node, false)
	}, "/", true)

	return db.ToJSON(jsonFile)

}

func (s *Sync) statRoots(ctx context.Context, source model.Endpoint) (stat *model.EndpointRootStat, e error) {
	stat = &model.EndpointRootStat{}
	var roots []string
	for _, r := range s.Roots {
		roots = append(roots, r)
	}
	if len(roots) == 0 {
		roots = append(roots, "/")
	}
	for _, r := range roots {
		node, err := source.LoadNode(ctx, r, true)
		if err != nil {
			return stat, errors.WithMessage(err, "Cannot Stat Root")
		}
		if node.HasMetaKey("RecursiveChildrenSize") {
			stat.HasSizeInfo = true
			var s int64
			if e := node.GetMeta("RecursiveChildrenSize", &s); e == nil {
				stat.Size += s
			}
		}
		if node.HasMetaKey("RecursiveChildrenFolders") && node.HasMetaKey("RecursiveChildrenFiles") {
			stat.HasChildrenInfo = true
			var folders, files int64
			if e := node.GetMeta("RecursiveChildrenFolders", &folders); e == nil {
				stat.Folders += folders
			}
			if e := node.GetMeta("RecursiveChildrenFiles", &files); e == nil {
				stat.Files += files
			}
		}
	}
	return
}
