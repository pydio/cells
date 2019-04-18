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

	"github.com/pydio/cells/common/sync/merger"

	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/sync/proc"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

type Sync struct {
	Source model.Endpoint
	Target model.Endpoint

	EchoFilter *filters.EchoFilter
	Merger     *proc.Processor
	Direction  string

	batcher   *filters.EventsBatcher
	doneChans []chan bool
}

// BroadcastCloseSession forwards session id to underlying batchers
func (s *Sync) BroadcastCloseSession(sessionUuid string) {
	if s.batcher == nil {
		return
	}
	s.batcher.ForceCloseSession(sessionUuid)
}

// SetupWatcher starts watching events for sync
func (s *Sync) SetupWatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget) error {

	var err error
	watchObject, err := source.Watch("")
	if err != nil {
		log.Logger(ctx).Error("Error While Setting up Watcher on source", zap.Any("source", source), zap.Error(err))
		return err
	}

	s.doneChans = append(s.doneChans, watchObject.DoneChan)

	// Now wire batches to processor
	s.batcher = filters.NewEventsBatcher(ctx, source, target)

	filterIn, filterOut := s.EchoFilter.CreateFilter()
	s.Merger.AddRequeueChannel(source, filterIn)
	go s.batcher.BatchEvents(filterOut, s.Merger.BatchesChannel, 1*time.Second)

	go func() {
		// Wait for all events.
		for {
			select {
			case event, ok := <-watchObject.Events():
				if !ok {
					<-time.After(1 * time.Second)
					continue
				}
				//log.Logger(ctx).Info("WATCH EVENT", zap.Any("e", event))
				filterIn <- event
			case err, ok := <-watchObject.Errors():
				if !ok {
					<-time.After(5 * time.Second)
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

// InitialSnapshots computes and compares full left and right snapshots
func (s *Sync) InitialSnapshots(ctx context.Context, dryRun bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (diff *model.Diff, e error) {

	source, _ := model.AsPathSyncSource(s.Source)
	targetAsSource, _ := model.AsPathSyncSource(s.Target)
	diff, e = merger.ComputeDiff(ctx, source, targetAsSource, statusChan)

	log.Logger(ctx).Info("### GOT DIFF", zap.Any("diff", diff))
	if e != nil {
		if doneChan != nil {
			doneChan <- true
		}
		return nil, e
	}
	if dryRun {
		if doneChan != nil {
			doneChan <- true
		}
		return diff, nil
	}

	//log.Println("Initial Snapshot Diff:", diff)
	var batchLeft, batchRight *model.Batch
	var err error
	// Changes must be applied from Source to Target only
	if s.Direction == "left" {
		batchLeft, err = diff.ToUnidirectionalBatch("left")
		batchRight = &model.Batch{}
		if err != nil {
			batchLeft = &model.Batch{}
		} else {
			batchLeft.Filter(ctx)
		}
	} else if s.Direction == "right" {
		batchLeft = &model.Batch{}
		batchRight, err = diff.ToUnidirectionalBatch("right")
		if err != nil {
			batchRight = &model.Batch{}
		} else {
			batchRight.Filter(ctx)
		}
	} else {
		sourceAsTarget, _ := model.AsPathSyncTarget(s.Source)
		target, _ := model.AsPathSyncTarget(s.Target)
		biBatch, err := diff.ToBidirectionalBatch(sourceAsTarget, target)
		if err == nil {
			batchLeft = biBatch.Left
			batchRight = biBatch.Right
			// TODO: PARALLELIZE?
			batchLeft.Filter(ctx)
			batchRight.Filter(ctx)
		}
	}

	log.Logger(ctx).Info("Initial Snapshot Batch",
		zap.Any("left", map[string]int{"create files": len(batchLeft.CreateFiles), "create folders": len(batchLeft.CreateFolders)}),
		zap.Any("right", map[string]int{"create files": len(batchRight.CreateFiles), "create folders": len(batchRight.CreateFolders)}),
	)

	if provider, ok := model.AsSessionProvider(s.Target); ok {
		batchLeft.SessionProvider = provider
		batchLeft.SessionProviderContext = ctx
	}
	if provider, ok := model.AsSessionProvider(s.Source); ok {
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

	log.Logger(ctx).Debug("### SENDING LEFT TO MERGER", batchLeft.Zaps()...)
	log.Logger(ctx).Debug("### SENDING RIGHT TO MERGER", batchRight.Zaps()...)

	s.Merger.BatchesChannel <- batchLeft
	s.Merger.BatchesChannel <- batchRight

	//	log.Logger(ctx).Info("### END SENDING TO MERGER")

	return diff, nil
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
	s.Merger.Shutdown()
}

// Start makes a first sync and setup watchers
func (s *Sync) Start(ctx context.Context) {
	source, sOk := model.AsPathSyncSource(s.Source)
	target, tOk := model.AsPathSyncTarget(s.Target)
	if s.Direction != "right" && sOk && tOk {
		s.SetupWatcher(ctx, source, target)
	}
	source2, sOk2 := model.AsPathSyncSource(s.Target)
	target2, tOk2 := model.AsPathSyncTarget(s.Source)
	if s.Direction != "left" && sOk2 && tOk2 {
		s.SetupWatcher(ctx, source2, target2)
	}
}

func (s *Sync) Resync(ctx context.Context, dryRun bool, statusChan chan model.BatchProcessStatus, doneChan chan bool) (*model.Diff, error) {
	var err error
	defer func() {
		if e := recover(); e != nil {
			if er, ok := e.(error); ok {
				err = er
				if statusChan != nil {
					statusChan <- model.BatchProcessStatus{
						IsError:      true,
						StatusString: err.Error(),
						Progress:     1,
					}
				}
			}
		}
	}()
	var diff *model.Diff
	diff, err = s.InitialSnapshots(ctx, dryRun, statusChan, doneChan)
	return diff, err
}

func NewSync(ctx context.Context, left model.Endpoint, right model.Endpoint) *Sync {

	filter := filters.NewEchoFilter()
	processor := proc.NewProcessor(ctx)
	processor.LocksChannel = filter.LockEvents
	processor.UnlocksChannel = filter.UnlockEvents
	go processor.ProcessBatches()
	go filter.ListenLocksEvents()

	return &Sync{
		Source: left,
		Target: right,

		EchoFilter: filter,
		Merger:     processor,
	}

}
