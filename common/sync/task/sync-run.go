/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"path/filepath"
	"sync"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

type EndpointRootStat struct {
	HasChildrenInfo bool
	HasSizeInfo     bool

	Size     int64
	Children int64
	Folders  int64
	Files    int64

	PgSize     int64
	PgChildren int64
	PgFolders  int64
	PgFiles    int64

	LastPg float64
}

func (s *Sync) run(ctx context.Context, dryRun bool, force bool) (model.Stater, error) {

	// Check that both endpoints are available
	sourceRoots, e := s.statRoots(ctx, s.Source)
	if e != nil {
		return nil, e
	}
	targetRoots, e := s.statRoots(ctx, s.Target)
	if e != nil {
		return nil, e
	}
	rootsInfo := map[string]*EndpointRootStat{
		s.Source.GetEndpointInfo().URI: sourceRoots,
		s.Target.GetEndpointInfo().URI: targetRoots,
	}
	log.Logger(ctx).Info("Got ExtendedStats for Root", zap.Any("infos", rootsInfo))

	if s.Direction == model.DirectionBi {

		// INIT BI PATCH
		bb := merger.NewBidirectionalPatch(ctx, s.Source, s.Target)
		// TODO : BI-DIRECTIONAL PATCH SHOULD HANDLE SESSION PROVIDER PER TARGET
		if provider, ok := model.AsSessionProvider(s.Target); ok {
			bb.SetSessionProvider(ctx, provider, false)
		}
		bb.SetupChannels(s.statuses, s.runDone, s.cmd)

		if e := s.runBi(ctx, bb, dryRun, force, rootsInfo); e != nil || dryRun {
			bb.Done(bb)
			return bb, e
		} else {
			s.patchChan <- bb
		}
		return bb, e

	} else {

		// INIT UNIDIRECTIONAL PATCH
		var patch merger.Patch
		var asProvider model.Endpoint
		if s.Direction == model.DirectionRight {
			patch = merger.NewPatch(s.Source.(model.PathSyncSource), s.Target.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
			asProvider = s.Target
		} else {
			patch = merger.NewPatch(s.Target.(model.PathSyncSource), s.Source.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
			asProvider = s.Source
		}
		patch.SkipFilterToTarget(true)
		patch.SetupChannels(s.statuses, s.runDone, s.cmd)
		if provider, ok := model.AsSessionProvider(asProvider); ok {
			patch.SetSessionProvider(ctx, provider, true)
		}

		// RUN SYNC ON SELECTED ROOTS
		if len(s.Roots) == 0 {
			s.Roots = append(s.Roots, "/")
		}
		for _, p := range s.Roots {
			s.runUni(ctx, patch, p, force, rootsInfo)
		}
		if errs, ok := patch.HasErrors(); ok {
			patch.Done(patch)
			return patch, errs[0]
		} else if dryRun {
			patch.Done(patch)
			return patch, nil
		} else {
			s.patchChan <- patch
		}
		return patch, nil
	}

}

func (s *Sync) runUni(ctx context.Context, patch merger.Patch, rootPath string, force bool, rootsInfo map[string]*EndpointRootStat) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	// Compute Diff
	diff := merger.NewDiff(ctx, source, targetAsSource)
	lock := s.monitorDiff(ctx, diff, rootsInfo)
	if e := diff.Compute(rootPath, lock, s.Ignores...); e != nil {
		return patch.SetPatchError(e)
	}

	// Feed Patch from Diff
	err := diff.ToUnidirectionalPatch(s.Direction, patch)
	if err != nil {
		return err
	}
	patch.Filter(ctx)
	return nil
}

func (s *Sync) runBi(ctx context.Context, bb *merger.BidirectionalPatch, dryRun bool, force bool, rootsInfo map[string]*EndpointRootStat) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	var useSnapshots, captureSnapshots bool
	var leftSnap, rightSnap model.Snapshoter
	var leftPatches, rightPatches map[string]merger.Patch

	var roots []string
	for _, r := range s.Roots {
		roots = append(roots, r)
	}
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
			diff := merger.NewDiff(ctx, source, targetAsSource)
			if e := diff.Compute(r, s.monitorDiff(ctx, diff, rootsInfo), s.Ignores...); e != nil {
				return bb.SetPatchError(e)
			}
			if dryRun {
				return nil
			}

			sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
			target, _ := model.AsPathSyncTarget(s.Target)
			if err := diff.ToBidirectionalPatch(sourceAsTarget, target, bb); err != nil {
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

func (s *Sync) patchesFromSnapshot(ctx context.Context, name string, source model.PathSyncSource, roots []string, rootsInfo map[string]*EndpointRootStat) (model.Snapshoter, map[string]merger.Patch, error) {

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
		diff := merger.NewDiff(ctx, source, snap)
		er = diff.Compute(r, s.monitorDiff(ctx, diff, rootsInfo), s.Ignores...)
		if er != nil {
			return nil, nil, er
		}
		// We want to apply changes from source onto snapshot
		patch := merger.NewPatch(source, snap.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
		er := diff.ToUnidirectionalPatch(model.DirectionRight, patch)
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

func (s *Sync) walkToJSON(ctx context.Context, source model.PathSyncSource, jsonFile string) error {

	db := memory.NewMemDB()
	source.Walk(func(path string, node *tree.Node, err error) {
		db.CreateNode(ctx, node, false)
	}, "/", true)

	return db.ToJSON(jsonFile)

}

func (s *Sync) statRoots(ctx context.Context, source model.Endpoint) (stat *EndpointRootStat, e error) {
	stat = &EndpointRootStat{}
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

func (s *Sync) monitorDiff(ctx context.Context, diff merger.Diff, rootsInfo map[string]*EndpointRootStat) chan bool {
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
				var total int64
				for _, root := range rootsInfo {
					total += root.PgChildren
				}
				log.Logger(ctx).Info("Finished analyzing nodes", zap.Any("i", total))
				if s.statuses != nil {
					for u, _ := range rootsInfo {
						s.statuses <- model.NewProcessingStatus("").SetEndpoint(u).SetProgress(0)
					}
					s.statuses <- model.NewProcessingStatus(fmt.Sprintf("Analyzed %d nodes", total))
				}
				close(done)
				close(indexStatus)
				return
			}
		}
	}()
	return finished
}

func (s *Sync) computeIndexProgress(input model.Status, rootInfo *EndpointRootStat) (output model.Status, emit bool) {
	if input.Node() == nil {
		rootInfo.PgChildren++
	} else if input.Node().IsLeaf() {
		rootInfo.PgChildren++
		rootInfo.PgFiles++
		rootInfo.PgSize += input.Node().Size
	} else {
		rootInfo.PgChildren++
		rootInfo.PgFolders++
		rootInfo.PgSize += 36
	}
	if !rootInfo.HasSizeInfo && !rootInfo.HasChildrenInfo {
		// Publish every 50 nodes
		if rootInfo.PgChildren%50 != 0 {
			return // false
		} else {
			return model.NewProcessingStatus(fmt.Sprintf("Analyzed %d nodes", rootInfo.PgChildren)).SetEndpoint(input.EndpointURI()), true
		}
	}
	var pg float64
	if rootInfo.HasSizeInfo && rootInfo.Size > 0 {
		// Compute progress based on SizeInfo
		pg = float64(rootInfo.PgSize) / float64(rootInfo.Size)
	} else {
		// Compute progress based on ChildrenInfo
		pg = float64(rootInfo.PgChildren) / float64(rootInfo.Children)
	}
	if pg-rootInfo.LastPg > 0.05 {
		emit = true
		rootInfo.LastPg = pg
		output := model.NewProcessingStatus(fmt.Sprintf("Analyzed %d nodes (%d%%)", rootInfo.PgChildren, int(math.Floor(pg*100))))
		output.SetProgress(float32(pg), true)
		output.SetEndpoint(input.EndpointURI())
		return output, true
	}
	return
}
