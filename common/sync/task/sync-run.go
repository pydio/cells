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

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

func (s *Sync) Run(ctx context.Context, dryRun bool, force bool, statusChan chan merger.ProcessStatus, doneChan chan interface{}) (model.Stater, error) {

	if s.Direction == model.DirectionBi {

		bi, e := s.RunBi(ctx, dryRun, force, statusChan, doneChan)
		if e == nil {
			s.Processor.PatchChan <- bi.Left
			s.Processor.PatchChan <- bi.Right
		}
		return bi, e

	} else {

		patch, e := s.RunUni(ctx, dryRun, force, statusChan, doneChan)
		if e == nil {
			s.Processor.PatchChan <- patch
		}
		return patch, e
	}

}

func (s *Sync) RunUni(ctx context.Context, dryRun bool, force bool, statusChan chan merger.ProcessStatus, doneChan chan interface{}) (merger.Patch, error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)
	diff := merger.NewDiff(ctx, source, targetAsSource)
	diff.SetupChannels(statusChan, nil)
	e := diff.Compute()
	if e == nil && dryRun {
		fmt.Println(diff.String())
	}
	log.Logger(ctx).Debug("### GOT DIFF", zap.Any("diff", diff))
	if e != nil || dryRun {
		if doneChan != nil {
			doneChan <- 0
		}
		return nil, e
	}

	patch, err := diff.ToUnidirectionalPatch(s.Direction)
	if err != nil {
		return nil, err
	}
	patch.Filter(ctx)
	patch.SetupChannels(statusChan, doneChan)

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

func (s *Sync) RunBi(ctx context.Context, dryRun bool, force bool, statusChan chan merger.ProcessStatus, doneChan chan interface{}) (*merger.BidirectionalPatch, error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	var bb *merger.BidirectionalPatch

	var useSnapshots, captureSnapshots bool
	var leftSnap, rightSnap model.Snapshoter
	var leftBatch, rightBatch merger.Patch

	if s.SnapshotFactory != nil && !force {
		var er1, er2 error
		leftSnap, leftBatch, er1 = s.BatchFromSnapshot(ctx, "left", source, true)
		rightSnap, rightBatch, er2 = s.BatchFromSnapshot(ctx, "right", targetAsSource, true)
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
		leftBatch.Filter(ctx)
		rightBatch.Filter(ctx)
		bb = &merger.BidirectionalPatch{
			Left:  leftBatch,
			Right: rightBatch,
		}
		log.Logger(ctx).Debug("BB-Before Merge", zap.Any("stats", bb.Stats()))
		if err := bb.Merge(ctx); err != nil {
			return nil, err
		}

	} else {

		log.Logger(ctx).Info("Computing patches from Sources")
		diff := merger.NewDiff(ctx, source, targetAsSource)
		diff.SetupChannels(statusChan, nil)
		e := diff.Compute()
		log.Logger(ctx).Info("### GOT DIFF", zap.Any("diff", diff))
		if e != nil || dryRun {
			if doneChan != nil {
				doneChan <- 0
			}
			return nil, e
		}

		sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
		target, _ := model.AsPathSyncTarget(s.Target)
		if ers := merger.SolveConflicts(ctx, diff.Conflicts(), sourceAsTarget, target); len(ers) > 0 {
			log.Logger(ctx).Error("Errors while refreshing folderUUIDs")
		}
		var err error
		bb, err = diff.ToBidirectionalPatch(sourceAsTarget, target)
		if err != nil {
			return nil, err
		}

		log.Logger(ctx).Debug("BB-From diff.ToBiDirectionalBatch", zap.Any("stats", bb.Stats()))

		bb.Left.Filter(ctx)
		bb.Right.Filter(ctx)

		if captureSnapshots {
			log.Logger(ctx).Info("Capturing first snapshots now")
			leftSnap.Capture(ctx, source)
			rightSnap.Capture(ctx, targetAsSource)
		}

	}

	if provider, ok := model.AsSessionProvider(s.Target); ok {
		bb.Left.SetSessionProvider(ctx, provider)
	}
	if provider, ok := model.AsSessionProvider(s.Source); ok {
		bb.Right.SetSessionProvider(ctx, provider)
	}

	// Wait for both batch to be processed to send the doneChan info
	dChan := make(chan interface{}, 2)
	bb.Left.SetupChannels(statusChan, dChan)
	bb.Right.SetupChannels(statusChan, dChan)
	go func() {
		i := 0
		totalSize := 0
		for s := range dChan {
			i++
			if size, ok := s.(int); ok {
				totalSize += size
			}
			if i == 2 {
				close(dChan)
				if doneChan != nil {
					doneChan <- totalSize
				}
			}
		}
	}()

	return bb, nil
}

func (s *Sync) BatchFromSnapshot(ctx context.Context, name string, source model.PathSyncSource, capture bool) (model.Snapshoter, merger.Patch, error) {

	snapUpdater, ok2 := source.(model.SnapshotUpdater)
	snap, er := s.SnapshotFactory.Load(name)
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
	diff := merger.NewDiff(ctx, source, snap)
	er = diff.Compute()
	if er != nil {
		return nil, nil, er
	}
	// We want to apply changes from source onto snapshot
	patch, er := diff.ToUnidirectionalPatch(model.DirectionRight)
	if er != nil {
		return nil, nil, er
	}
	if e := snap.Capture(ctx, source); e != nil {
		log.Logger(ctx).Error("Error while capturing snapshot!", zap.Error(e))
	}
	updatable, ok1 := snap.(model.PathSyncTarget)
	if ok1 && ok2 {
		snapUpdater.SetUpdateSnapshot(updatable)
	}

	return snap, patch, nil

}

func (s *Sync) Capture(ctx context.Context, targetFolder string) error {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	if s.Direction == model.DirectionBi && s.SnapshotFactory != nil {

		leftSnap, err := s.SnapshotFactory.Load("left")
		if err != nil {
			return err
		}
		if e := s.walkToJSON(ctx, leftSnap, filepath.Join(targetFolder, "snap-source.json")); e != nil {
			return e
		}

		rightSnap, err := s.SnapshotFactory.Load("right")
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

	db := endpoints.NewMemDB()
	source.Walk(func(path string, node *tree.Node, err error) {
		db.CreateNode(ctx, node, false)
	})

	return db.ToJSON(jsonFile)

}
