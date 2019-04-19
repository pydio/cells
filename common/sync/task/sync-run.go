package task

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

func (s *Sync) Run(ctx context.Context, dryRun bool, force bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (model.Stater, error) {

	if s.Direction == model.DirectionBi {

		bi, e := s.RunBi(ctx, dryRun, force, statusChan, doneChan)
		if e == nil {
			s.Merger.BatchesChannel <- bi.Left
			s.Merger.BatchesChannel <- bi.Right
		}
		return bi, e

	} else {

		batch, e := s.RunUni(ctx, dryRun, force, statusChan, doneChan)
		if e == nil {
			s.Merger.BatchesChannel <- batch
		}
		return batch, e
	}

}

func (s *Sync) RunUni(ctx context.Context, dryRun bool, force bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (*model.Batch, error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)
	diff, e := merger.ComputeDiff(ctx, source, targetAsSource, statusChan)

	log.Logger(ctx).Info("### GOT DIFF", zap.Any("diff", diff))
	if e != nil || dryRun {
		if doneChan != nil {
			doneChan <- true
		}
		return nil, e
	}

	batch, err := diff.ToUnidirectionalBatch(s.Direction)
	if err != nil {
		return nil, err
	}
	batch.Filter(ctx)
	batch.StatusChan = statusChan
	batch.DoneChan = doneChan

	log.Logger(ctx).Debug("### SENDING TO MERGER", batch.Zaps()...)

	var asProvider model.Endpoint
	if s.Direction == model.DirectionRight {
		asProvider = s.Target
	} else {
		asProvider = s.Source
	}
	if provider, ok := model.AsSessionProvider(asProvider); ok {
		batch.SessionProvider = provider
		batch.SessionProviderContext = ctx
	}

	return batch, nil
}

func (s *Sync) RunBi(ctx context.Context, dryRun bool, force bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (*model.BidirectionalBatch, error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)

	var bb *model.BidirectionalBatch

	var useSnapshots, captureSnaphots bool
	var leftSnap, rightSnap model.Snapshoter
	var leftBatch, rightBatch *model.Batch

	if s.SnapshotFactory != nil && !force {
		var er1, er2 error
		leftSnap, leftBatch, er1 = s.BatchFromSnapshot(ctx, "left", source, true)
		rightSnap, rightBatch, er2 = s.BatchFromSnapshot(ctx, "right", targetAsSource, true)
		if er1 == nil && er2 == nil {
			if leftSnap.IsEmpty() || rightSnap.IsEmpty() {
				captureSnaphots = true
			} else {
				useSnapshots = true
			}
		}
	}

	if useSnapshots {

		log.Logger(ctx).Info("Computing Batches from Snapshots")
		leftBatch.Filter(ctx)
		rightBatch.Filter(ctx)
		bb = &model.BidirectionalBatch{
			Left:  leftBatch,
			Right: rightBatch,
		}
		log.Logger(ctx).Info("BB-Before Merge", zap.Any("stats", bb.Stats()))
		if err := bb.Merge(ctx); err != nil {
			return nil, err
		}
		log.Logger(ctx).Info("BB-After Merge", zap.Any("stats", bb.Stats()))

	} else {

		log.Logger(ctx).Info("Computing Batches from Sources")
		diff, e := merger.ComputeDiff(ctx, source, targetAsSource, statusChan)
		log.Logger(ctx).Info("### GOT DIFF", zap.Any("diff", diff))
		if e != nil || dryRun {
			if doneChan != nil {
				doneChan <- true
			}
			return nil, e
		}

		sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
		target, _ := model.AsPathSyncTarget(s.Target)
		var err error
		bb, err = diff.ToBidirectionalBatch(sourceAsTarget, target)
		if err != nil {
			return nil, err
		}

		log.Logger(ctx).Info("BB-From diff.ToBiDirectionalBatch", zap.Any("stats", bb.Stats()))

		bb.Left.Filter(ctx)
		bb.Right.Filter(ctx)

		if captureSnaphots {
			log.Logger(ctx).Info("Capturing first snapshots now")
			leftSnap.Capture(ctx, source)
			rightSnap.Capture(ctx, targetAsSource)
		}

	}

	bb.Left.StatusChan = statusChan
	bb.Right.StatusChan = statusChan

	if provider, ok := model.AsSessionProvider(s.Target); ok {
		bb.Left.SessionProvider = provider
		bb.Left.SessionProviderContext = ctx
	}
	if provider, ok := model.AsSessionProvider(s.Source); ok {
		bb.Right.SessionProvider = provider
		bb.Right.SessionProviderContext = ctx
	}

	// Wait for both batch to be processed to send the DoneChan info
	dChan := make(chan bool, 2)
	bb.Left.DoneChan = dChan
	bb.Right.DoneChan = dChan
	go func() {
		i := 0
		for range dChan {
			i++
			if i == 2 {
				close(dChan)
				if doneChan != nil {
					doneChan <- true
				}
			}
		}
	}()

	return bb, nil
}

func (s *Sync) BatchFromSnapshot(ctx context.Context, name string, source model.PathSyncSource, capture bool) (model.Snapshoter, *model.Batch, error) {

	snap, er := s.SnapshotFactory.Load(name)
	if er != nil {
		return nil, nil, er
	}
	if snap.IsEmpty() {
		// Do not capture now
		return snap, nil, nil
	}
	diff, er := merger.ComputeDiff(ctx, source, snap, nil)
	if er != nil {
		return nil, nil, er
	}
	// We want to apply changes from source onto snapshot
	batch, er := diff.ToUnidirectionalBatch(model.DirectionRight)
	if er != nil {
		return nil, nil, er
	}
	if e := snap.Capture(ctx, source); e != nil {
		log.Logger(ctx).Error("Error while capturing snapshot!", zap.Error(e))
	}

	return snap, batch, nil

}
