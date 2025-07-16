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
	"fmt"
	"math"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

func (s *Sync) run(ctx context.Context, dryRun bool, force bool) (model.Stater, error) {

	// Check that both endpoints are available and get total stats to be used for progress
	rootsInfo, e := s.RootStats(ctx, false)
	if e != nil {
		return nil, e
	}

	// Create a background-based context as sessionContext will be used inside the patch processor.
	sessionCtx := context.WithoutCancel(ctx)
	if mm, ok := propagator.FromContextCopy(ctx); ok {
		sessionCtx = propagator.NewContext(sessionCtx, mm)
	}

	if s.Direction == model.DirectionBi {

		// INIT BI PATCH
		bb := merger.NewBidirectionalPatch(ctx, s.Source, s.Target)
		bb.SetSessionData(sessionCtx, false)
		bb.SetupChannels(s.statuses, s.runDone, s.cmd)

		if e := s.runBi(ctx, bb, dryRun, force, rootsInfo); e != nil || dryRun {
			bb.Done(bb)

			return bb, e
		} else if s.patchChan != nil {
			s.patchChan <- bb
		}

		return bb, e

	} else {

		// INIT UNIDIRECTIONAL PATCH
		var patch merger.Patch
		if s.Direction == model.DirectionRight {
			patch = merger.NewPatch(s.Source.(model.PathSyncSource), s.Target.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
		} else {
			patch = merger.NewPatch(s.Target.(model.PathSyncSource), s.Source.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
		}
		patch.SkipFilterToTarget(true)
		patch.SetupChannels(s.statuses, s.runDone, s.cmd)
		patch.SetSessionData(sessionCtx, true)

		// RUN SYNC ON SELECTED ROOTS
		if len(s.Roots) == 0 {
			s.Roots = append(s.Roots, "/")
		}
		for _, p := range s.Roots {
			s.runUni(ctx, patch, p, force, rootsInfo)
		}
		if errs, ok := patch.HasErrors(); ok {
			//patch.Done(patch)
			return patch, errs[0]
		} else if dryRun {
			patch.Done(patch)
			return patch, nil
		} else if s.patchChan != nil {
			s.patchChan <- patch
		}
		return patch, nil
	}

}

func (s *Sync) runUni(ctx context.Context, patch merger.Patch, rootPath string, force bool, rootsInfo map[string]*model.EndpointRootStat) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	defer func() {
		debug.FreeOSMemory()
		//printMem("UNI - Mem - finished ")
	}()

	//printMem("UNI - Mem - starting ")

	// Compute Diff
	diff := merger.NewDiff(source, targetAsSource)
	lock := s.monitorDiff(ctx, diff, rootsInfo)
	if e := diff.Compute(ctx, rootPath, lock, rootsInfo, s.Ignores...); e != nil {
		return patch.SetPatchError(errors.Wrap(e, "error happened during diff.Compute"))
	}

	//printMem("UNI - Mem - diff loaded ")

	// Feed Patch from Diff
	err := diff.ToUnidirectionalPatch(ctx, s.Direction, patch)
	if err != nil {
		return err
	}

	// Additional failsafe filter for massive deletions
	if s.FailsafeDeletes {
		patch.PostFilter(func() error {
			var ops []merger.Operation
			patch.WalkOperations([]merger.OperationType{merger.OpDelete}, func(operation merger.Operation) {
				if operation.GetNode() != nil && !operation.GetNode().IsLeaf() {
					ops = append(ops, operation)
				}
			})
			if len(ops) > 50 {
				// Recheck deleted resources
				for _, op := range ops {
					log.Logger(ctx).Debug("Failsafe : rechecking deletion operation is real on " + op.GetRefPath())
					ep := op.Source()
					if s.Direction == model.DirectionLeft {
						ep = op.Target().(model.PathSyncSource)
					}
					n, er := ep.LoadNode(ctx, op.GetRefPath())
					if er == nil || n != nil {
						// This is not normal - this node should not exist
						return errors.New("detected delete of existing node " + op.GetRefPath())
					}
				}
			}
			return nil
		})
	}

	return nil
}

func (s *Sync) runBi(ctx context.Context, bb *merger.BidirectionalPatch, dryRun bool, force bool, rootsInfo map[string]*model.EndpointRootStat) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	var useSnapshots, captureSnapshots bool
	var leftSnap, rightSnap model.Snapshoter
	var leftPatches, rightPatches map[string]merger.Patch

	var roots []string
	roots = append(roots, s.Roots...)

	if len(roots) == 0 {
		roots = append(roots, "/")
	}

	if s.snapshotFactory != nil && !force {
		var er1, er2 error
		wg := &sync.WaitGroup{}
		wg.Add(2)
		go func() {
			defer wg.Done()
			leftSnap, leftPatches, er1 = s.patchesFromSnapshot(ctx, "left", source, roots, rootsInfo)
		}()
		go func() {
			defer wg.Done()
			rightSnap, rightPatches, er2 = s.patchesFromSnapshot(ctx, "right", targetAsSource, roots, rootsInfo)
		}()
		wg.Wait()
		if er1 == nil && er2 == nil {
			if leftSnap.IsEmpty() || rightSnap.IsEmpty() {
				captureSnapshots = true
			} else {
				useSnapshots = true
			}
		}
	}

	if useSnapshots {

		log.Logger(ctx).Info("Computing patches from Snapshots")
		for _, r := range roots {
			b, e := merger.ComputeBidirectionalPatch(ctx, leftPatches[r], rightPatches[r])
			if b != nil {
				bb.AppendBranch(ctx, b)
			}
			if e != nil {
				return bb.SetPatchError(e)
			}
		}

	} else {

		bb.SkipFilterToTarget(true)

		log.Logger(ctx).Info("Computing patches from Sources")
		for _, r := range roots {
			diff := merger.NewDiff(source, targetAsSource)
			if e := diff.Compute(ctx, r, s.monitorDiff(ctx, diff, rootsInfo), rootsInfo, s.Ignores...); e != nil {
				return bb.SetPatchError(errors.Wrap(e, "error happened during diff.Compute"))
			}
			if dryRun {
				return nil
			}

			sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
			target, _ := model.AsPathSyncTarget(s.Target)
			if err := diff.ToBidirectionalPatch(ctx, sourceAsTarget, target, bb); err != nil {
				return bb.SetPatchError(err)
			}

		}

		if captureSnapshots {
			log.Logger(ctx).Info("Capturing first snapshots now")
			leftSnap.Capture(ctx, source, roots...)
			rightSnap.Capture(ctx, targetAsSource, roots...)
			log.Logger(ctx).Info("Hooking Snapshots to clients")
			if updater, ok := source.(model.SnapshotUpdater); ok {
				if pst, ok2 := leftSnap.(model.PathSyncTarget); ok2 {
					updater.SetUpdateSnapshot(pst)
				}
			}
			if updater, ok := targetAsSource.(model.SnapshotUpdater); ok {
				if pst, ok2 := rightSnap.(model.PathSyncTarget); ok2 {
					updater.SetUpdateSnapshot(pst)
				}
			}
		}

	}

	return nil
}

func (s *Sync) patchesFromSnapshot(ctx context.Context, name string, source model.PathSyncSource, roots []string, rootsInfo map[string]*model.EndpointRootStat) (model.Snapshoter, map[string]merger.Patch, error) {

	snapUpdater, ok2 := source.(model.SnapshotUpdater)
	hashStoreReader, ok3 := source.(model.HashStoreReader)
	snap, er := s.snapshotFactory.Load(source)
	if er != nil {
		if ok2 {
			snapUpdater.SetUpdateSnapshot(nil)
		}
		return nil, nil, er
	}
	if snap.IsEmpty() {
		// Do not capture now
		if ok2 {
			snapUpdater.SetUpdateSnapshot(nil)
		}
		return snap, nil, nil
	}
	if ok3 {
		hashStoreReader.SetRefHashStore(snap)
	}
	patches := make(map[string]merger.Patch, len(roots))
	for _, r := range roots {
		diff := merger.NewDiff(source, snap)
		er = diff.Compute(ctx, r, s.monitorDiff(ctx, diff, rootsInfo), rootsInfo, s.Ignores...)
		if er != nil {
			return nil, nil, er
		}
		// We want to apply changes from source onto snapshot
		patch := merger.NewPatch(source, snap.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
		er := diff.ToUnidirectionalPatch(ctx, model.DirectionRight, patch)
		if er != nil {
			return nil, nil, er
		}
		patches[r] = patch
	}
	if e := snap.Capture(ctx, source, roots...); e != nil {
		log.Logger(ctx).Error("Error while capturing snapshot!", zap.Error(e))
	}
	updatable, ok1 := snap.(model.PathSyncTarget)
	if ok1 && ok2 {
		snapUpdater.SetUpdateSnapshot(updatable)
	}

	return snap, patches, nil

}

func (s *Sync) monitorDiff(ctx context.Context, diff merger.Diff, rootsInfo map[string]*model.EndpointRootStat) chan bool {
	indexStatus := make(chan model.Status)
	done := make(chan interface{})
	finished := make(chan bool, 1)
	diff.SetupChannels(indexStatus, done, s.cmd)
	go func() {
		defer close(finished)
		for {
			select {
			case status := <-indexStatus:
				if root, ok := rootsInfo[status.EndpointURI()]; ok {
					if pgStatus, ok := s.computeIndexProgress(status, root); ok && pgStatus != nil {
						log.Logger(ctx).Info(pgStatus.String())
						if s.statuses != nil {
							s.statuses <- pgStatus
						}
					}
				}
			case <-done:
				var totalStrings []string
				var total int64
				for uri, root := range rootsInfo {
					total += root.PgChildren
					totalStrings = append(totalStrings, fmt.Sprintf("%d on %s", root.PgChildren, uri))
				}
				tString := strings.Join(totalStrings, ", ")
				log.Logger(ctx).Info(fmt.Sprintf("Finished analyze : %d nodes (%s)", total, tString), zap.Any("i", total))
				if s.statuses != nil {
					for u := range rootsInfo {
						s.statuses <- model.NewProcessingStatus("").SetEndpoint(u).SetProgress(0)
					}
					s.statuses <- model.NewProcessingStatus(fmt.Sprintf("Analyzed %d nodes (%s)", total, tString))
				}
				close(done)
				close(indexStatus)
				return
			}
		}
	}()
	return finished
}

func (s *Sync) computeIndexProgress(input model.Status, rootInfo *model.EndpointRootStat) (out model.Status, emit bool) {
	if input.Node() == nil {
		rootInfo.PgChildren++
	} else if input.Node().IsLeaf() {
		rootInfo.PgChildren++
		rootInfo.PgFiles++
		rootInfo.PgSize += input.Node().GetSize()
	} else {
		rootInfo.PgChildren++
		rootInfo.PgFolders++
		rootInfo.PgSize += 36
	}
	if !rootInfo.HasSizeInfo && !rootInfo.HasChildrenInfo {
		// Publish every 100 nodes
		if rootInfo.PgChildren%500 != 0 {
			return // false
		} else {
			return model.NewProcessingStatus(fmt.Sprintf("[%s] Analyzed %d nodes", input.EndpointURI(), rootInfo.PgChildren)).SetEndpoint(input.EndpointURI()), true
		}
	}
	var pg float64
	if rootInfo.HasSizeInfo && rootInfo.Size > 0 {
		// Compute progress based on SizeInfo
		pg = float64(rootInfo.PgSize) / float64(rootInfo.Size)
	} else {
		// Compute progress based on ChildrenInfo
		pg = float64(rootInfo.PgChildren) / float64(rootInfo.Children())
	}
	if pg-rootInfo.LastPg > 0.05 {
		emit = true
		rootInfo.LastPg = pg
		output := model.NewProcessingStatus(fmt.Sprintf("[%s] Analyzed %d nodes (%d%%)", input.EndpointURI(), rootInfo.PgChildren, int(math.Floor(pg*100))))
		output.SetProgress(float32(pg), true)
		output.SetEndpoint(input.EndpointURI())
		return output, true
	}
	return
}

func printMem(s string) {
	fmt.Println(s)
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	// For info on each, see: https://golang.org/pkg/runtime/#MemStats
	fmt.Printf("Alloc = %v kB", m.Alloc/1024)
	fmt.Printf("\tTotalAlloc = %v kB", m.TotalAlloc/1024)
	fmt.Printf("\tSys = %v kB", m.Sys/1024)
	fmt.Printf("\tNumGC = %v\n", m.NumGC)
}
