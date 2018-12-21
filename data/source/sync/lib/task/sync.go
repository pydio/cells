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

	"github.com/pydio/cells/common/log"
	. "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
	"github.com/pydio/cells/data/source/sync/lib/proc"
	"go.uber.org/zap"
)

type Sync struct {
	Source Endpoint
	Target Endpoint

	EchoFilter *filters.EchoFilter
	Merger     *proc.Merger
	Direction  string

	doneChans []chan bool
}

func (s *Sync) SetupWatcher(ctx context.Context, source PathSyncSource, target PathSyncTarget) error {

	var err error
	watchObject, err := source.Watch("")
	if err != nil {
		log.Logger(ctx).Error("Error While Setting up Watcher on source", zap.Any("source", source), zap.Error(err))
		return err
	}

	s.doneChans = append(s.doneChans, watchObject.DoneChan)

	// Now wire batches to processor
	batcher := filters.NewEventsBatcher(ctx, source, target)

	filterIn, filterOut := s.EchoFilter.CreateFilter()
	s.Merger.AddRequeueChannel(source, filterIn)
	go batcher.BatchEvents(filterOut, s.Merger.BatchesChannel, 1*time.Second)

	go func() {

		// Wait for all events.
		for {
			select {
			case event, ok := <-watchObject.Events():
				if !ok {
					continue
				}
				//log.Logger(ctx).Info("WATCH EVENT", zap.Any("e", event))
				filterIn <- event
			case err, ok := <-watchObject.Errors():
				if !ok {
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

func (s *Sync) InitialSnapshots(ctx context.Context, dryRun bool, statusChan chan filters.BatchProcessStatus, doneChan chan bool) (diff *proc.SourceDiff, e error) {

	source, _ := AsPathSyncSource(s.Source)
	targetAsSource, tASOk := AsPathSyncSource(s.Target)
	diff, e = proc.ComputeSourcesDiff(ctx, source, targetAsSource, dryRun, statusChan)

	//log.Logger(ctx).Info("### GOT DIFF", zap.Any("diff", diff))
	if e != nil {
		doneChan <- true
		return nil, e
	}
	if dryRun {
		doneChan <- true
		return diff, nil
	}

	//log.Println("Initial Snapshot Diff:", diff)
	var batchLeft, batchRight *filters.Batch
	var err error
	// Changes must be applied from Source to Target only
	if s.Direction == "left" {
		batchLeft, err = diff.ToUnidirectionalBatch("left")
		if err != nil {
			batchLeft = &filters.Batch{}
		}
		batchRight = &filters.Batch{}
	} else if s.Direction == "right" {
		batchLeft = &filters.Batch{}
		batchRight, err = diff.ToUnidirectionalBatch("right")
		if err != nil {
			batchRight = &filters.Batch{}
		}
	} else {
		sourceAsTarget, _ := AsPathSyncTarget(s.Source)
		target, _ := AsPathSyncTarget(s.Target)
		biBatch, err := diff.ToBidirectionalBatch(sourceAsTarget, target)
		if err == nil {
			batchLeft = biBatch.Left
			batchRight = biBatch.Right
		}
	}

	if sTarget, ok := AsPathSyncTarget(s.Target); ok {
		leftBatchFilter := filters.NewEventsBatcher(ctx, source, sTarget)
		leftBatchFilter.FilterBatch(batchLeft)
	}

	//	log.Logger(ctx).Info("### FILTERED BATCH LEFT")

	if sTarget2, ok2 := AsPathSyncTarget(s.Source); ok2 && tASOk {
		rightBatchFilter := filters.NewEventsBatcher(ctx, targetAsSource, sTarget2)
		rightBatchFilter.FilterBatch(batchRight)
	}

	//	log.Logger(ctx).Info("### FILTERED BATCH RIGHT")

	log.Logger(ctx).Debug("Initial Snapshot Batch",
		zap.Any("left", map[string]int{"create files": len(batchLeft.CreateFiles), "create folders": len(batchLeft.CreateFolders)}),
		zap.Any("right", map[string]int{"create files": len(batchRight.CreateFiles), "create folders": len(batchRight.CreateFolders)}),
	)

	if provider, ok := AsSessionProvider(s.Target); ok {
		batchLeft.SessionProvider = provider
		batchLeft.SessionProviderContext = ctx
	}
	if provider, ok := AsSessionProvider(s.Source); ok {
		batchRight.SessionProvider = provider
		batchLeft.SessionProviderContext = ctx
	}

	batchLeft.StatusChan = statusChan
	batchRight.StatusChan = statusChan
	dChan := make(chan bool, 2)
	batchLeft.DoneChan = dChan
	batchRight.DoneChan = dChan
	go func() {
		i := 0
		for _ = range dChan {
			i++
			if i == 2 {
				close(dChan)
				if doneChan != nil {
					doneChan <- true
				}
			}
		}
	}()

	//	log.Logger(ctx).Info("### SENDING TO MERGER")

	s.Merger.BatchesChannel <- batchLeft
	s.Merger.BatchesChannel <- batchRight

	//	log.Logger(ctx).Info("### END SENDING TO MERGER")

	return diff, nil
}

func (s *Sync) Shutdown() {
	defer func() {
		// ignore 'close on closed channel'
		recover()
	}()
	for _, channel := range s.doneChans {
		close(channel)
	}
	s.Merger.Shutdown()
}

func (s *Sync) Start(ctx context.Context) {
	source, sOk := AsPathSyncSource(s.Source)
	target, tOk := AsPathSyncTarget(s.Target)
	if s.Direction != "right" && sOk && tOk {
		s.SetupWatcher(ctx, source, target)
	}
	source2, sOk2 := AsPathSyncSource(s.Target)
	target2, tOk2 := AsPathSyncTarget(s.Source)
	if s.Direction != "left" && sOk2 && tOk2 {
		s.SetupWatcher(ctx, source2, target2)
	}
}

func (s *Sync) Resync(ctx context.Context, dryRun bool, statusChan chan filters.BatchProcessStatus, doneChan chan bool) (*proc.SourceDiff, error) {
	return s.InitialSnapshots(ctx, dryRun, statusChan, doneChan)
}

func NewSync(ctx context.Context, left Endpoint, right Endpoint) *Sync {

	filter := filters.NewEchoFilter()
	merger := proc.NewMerger(ctx)
	merger.LocksChannel = filter.LockEvents
	merger.UnlocksChannel = filter.UnlockEvents
	go merger.ProcessBatches()
	go filter.ListenLocksEvents()

	return &Sync{
		Source: left,
		Target: right,

		EchoFilter: filter,
		Merger:     merger,
	}

}
