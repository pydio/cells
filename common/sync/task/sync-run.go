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
	"path/filepath"
	"strings"

	"github.com/pydio/cells/common/sync/endpoints/memory"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

func (s *Sync) run(ctx context.Context, dryRun bool, force bool) (model.Stater, error) {

	if s.Direction == model.DirectionBi {

		bb, e := s.runBi(ctx, dryRun, force)
		if e != nil {
			return nil, e
		}
		out := model.NewMultiStater()
		for k, b := range bb {
			out[k] = b
			s.processor.PatchChan <- b
		}
		return out, e

	} else {
		if len(s.Roots) == 0 {
			patch, e := s.runUni(ctx, "/", dryRun, force)
			if e == nil {
				s.processor.PatchChan <- patch
			}
			return patch, e
		} else {
			multi := model.NewMultiStater()
			var errors []string
			for _, p := range s.Roots {
				if patch, e := s.runUni(ctx, p, dryRun, force); e == nil {
					s.processor.PatchChan <- patch
					multi[p] = patch
				} else {
					errors = append(errors, e.Error())
				}
			}
			if len(errors) > 0 {
				return multi, fmt.Errorf(strings.Join(errors, "-"))
			}
			return multi, nil
		}
	}

}

func (s *Sync) runUni(ctx context.Context, rootPath string, dryRun bool, force bool) (merger.Patch, error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)
	diff := merger.NewDiff(ctx, source, targetAsSource)
	diff.SetupChannels(s.statuses, nil)
	e := diff.Compute(rootPath)
	if e == nil && dryRun {
		fmt.Println(diff.String())
	}
	log.Logger(ctx).Debug("### GOT DIFF", zap.Any("diff", diff))
	if e != nil || dryRun {
		if s.runDone != nil {
			s.runDone <- 0
		}
		return nil, e
	}

	patch, err := diff.ToUnidirectionalPatch(s.Direction)
	if err != nil {
		return nil, err
	}
	patch.Filter(ctx)
	patch.SetupChannels(s.statuses, s.runDone)

	log.Logger(ctx).Debug("### SENDING TO MERGER", zap.Any("stats", patch.Stats()))

	var asProvider model.Endpoint
	if s.Direction == model.DirectionRight {
		asProvider = s.Target
	} else {
		asProvider = s.Source
	}
	if provider, ok := model.AsSessionProvider(asProvider); ok {
		patch.SetSessionProvider(ctx, provider)
	}

	return patch, nil
}

func (s *Sync) runBi(ctx context.Context, dryRun bool, force bool) (map[string]*merger.BidirectionalPatch, error) {

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

	bb := make(map[string]*merger.BidirectionalPatch, len(roots))

	if s.snapshotFactory != nil && !force {
		var er1, er2 error
		leftSnap, leftPatches, er1 = s.patchesFromSnapshot(ctx, "left", source, roots)
		rightSnap, rightPatches, er2 = s.patchesFromSnapshot(ctx, "right", targetAsSource, roots)
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
			if b, e := merger.ComputeBidirectionalPatch(ctx, leftPatches[r], rightPatches[r]); e == nil {
				bb[r] = b
			} else {
				log.Logger(ctx).Error("Could not compute Bidirectionnal Patch! DO SOMETHING HERE!!")
				return nil, e
			}
		}

	} else {

		log.Logger(ctx).Info("Computing patches from Sources")
		for _, r := range roots {
			diff := merger.NewDiff(ctx, source, targetAsSource)
			diff.SetupChannels(s.statuses, nil)
			e := diff.Compute(r)
			log.Logger(ctx).Info("### Got Diff for Root", zap.String("r", r), zap.Any("diff", diff))
			if e != nil || dryRun {
				if s.runDone != nil {
					s.runDone <- 0
				}
				return nil, e
			}

			sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
			target, _ := model.AsPathSyncTarget(s.Target)
			if ers := merger.SolveConflicts(ctx, diff.Conflicts(), sourceAsTarget, target); len(ers) > 0 {
				log.Logger(ctx).Error("Errors while refreshing folderUUIDs")
			}
			leftPatch, rightPatch := diff.ToBidirectionalPatches(sourceAsTarget, target)
			if b, err := merger.ComputeBidirectionalPatch(context.Background(), leftPatch, rightPatch); err == nil {
				bb[r] = b
				log.Logger(ctx).Debug("BB-From diff.ToBiDirectionalBatch", zap.Any("stats", b.Stats()))
			} else {
				return nil, err
			}

		}

		if captureSnapshots {
			log.Logger(ctx).Info("Capturing first snapshots now")
			leftSnap.Capture(ctx, source, roots...)
			rightSnap.Capture(ctx, targetAsSource, roots...)
		}

	}

	// Wait all patches to be processed to send the doneChan info
	patchCount := len(bb)
	dChan := make(chan interface{}, patchCount)
	for _, b := range bb {
		// TODO : HOW TO HANDLE SESSION PROVIDER FOR BI-DIRECTIONAL PATCH?
		if provider, ok := model.AsSessionProvider(s.Target); ok {
			b.SetSessionProvider(ctx, provider)
		}
		b.SetupChannels(s.statuses, dChan)
	}
	go func() {
		i := 0
		totalSize := 0
		for si := range dChan {
			i++
			if size, ok := si.(int); ok {
				totalSize += size
			}
			if i == patchCount {
				close(dChan)
				if s.runDone != nil {
					s.runDone <- totalSize
				}
			}
		}
	}()

	return bb, nil
}

func (s *Sync) patchesFromSnapshot(ctx context.Context, name string, source model.PathSyncSource, roots []string) (model.Snapshoter, map[string]merger.Patch, error) {

	snapUpdater, ok2 := source.(model.SnapshotUpdater)
	hashStoreReader, ok3 := source.(model.HashStoreReader)
	snap, er := s.snapshotFactory.Load(name)
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
		er = diff.Compute(r)
		if er != nil {
			return nil, nil, er
		}
		// We want to apply changes from source onto snapshot
		patch, er := diff.ToUnidirectionalPatch(model.DirectionRight)
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

		leftSnap, err := s.snapshotFactory.Load("left")
		if err != nil {
			return err
		}
		if e := s.walkToJSON(ctx, leftSnap, filepath.Join(targetFolder, "snap-source.json")); e != nil {
			return e
		}

		rightSnap, err := s.snapshotFactory.Load("right")
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
