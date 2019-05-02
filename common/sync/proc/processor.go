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

// Package proc provides actual actions to be performed once the sync has filtered all events
package proc

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

type Processor struct {
	BatchesChannel  chan merger.Patch
	RequeueChannels map[model.PathSyncSource]chan model.EventInfo
	LocksChannel    chan filters.LockEvent
	UnlocksChannel  chan filters.UnlockEvent
	JobsInterrupt   chan bool
	GlobalContext   context.Context

	eventChannels []chan model.ProcessorEvent
}

type ProcessFunc func(event *merger.Operation, operationId string, progress chan int64) error

func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		BatchesChannel:  make(chan merger.Patch),
		RequeueChannels: make(map[model.PathSyncSource]chan model.EventInfo),
		JobsInterrupt:   make(chan bool),
		GlobalContext:   ctx,
	}
}

func (pr *Processor) Shutdown() {
	close(pr.BatchesChannel)
}

func (pr *Processor) Logger() *zap.Logger {
	return log.Logger(pr.GlobalContext)
}

func (pr *Processor) AddRequeueChannel(source model.PathSyncSource, channel chan model.EventInfo) {
	pr.RequeueChannels[source] = channel
}

func (pr *Processor) RegisterEventChannel(out chan model.ProcessorEvent) {
	pr.eventChannels = append(pr.eventChannels, out)
}

func (pr *Processor) sendEvent(event model.ProcessorEvent) {
	for _, channel := range pr.eventChannels {
		channel <- event
	}
}

func (pr *Processor) lockFileTo(batchedEvent *merger.Operation, path string, operationId string) {
	if source, ok := model.AsPathSyncSource(batchedEvent.Target()); pr.LocksChannel != nil && ok {
		pr.LocksChannel <- filters.LockEvent{
			Source:      source,
			Path:        path,
			OperationId: operationId,
		}
	}
}

func (pr *Processor) unlockFile(batchedEvent *merger.Operation, path string) {
	if source, castOk := model.AsPathSyncSource(batchedEvent.Target()); castOk && pr.UnlocksChannel != nil {
		d := 2 * time.Second
		if source.GetEndpointInfo().EchoTime > 0 {
			d = source.GetEndpointInfo().EchoTime
		}
		go func() {
			<-time.After(d)
			pr.UnlocksChannel <- filters.UnlockEvent{
				Source: source,
				Path:   path,
			}
		}()
	}
}

func (pr *Processor) process(batch merger.Patch) {

	s := batch.Size()
	defer batch.Done(s)

	if s == 0 {
		return
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "merger:start",
		Data: batch,
	})

	operationId := uuid.New()
	var event *merger.Operation

	total := batch.ProgressTotal()
	var cursor int64

	batch.Status(merger.ProcessStatus{StatusString: fmt.Sprintf("Start processing batch (total bytes %d)", total)})

	sessionFlush := func(nonEmpty []*merger.Operation) {}
	session, err := batch.StartSessionProvider(&tree.Node{Path: "/"})
	if err != nil {
		pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
	} else {
		defer batch.FinishSessionProvider(session.Uuid)
		sessionFlush = func(nonEmpty []*merger.Operation) {
			if len(nonEmpty) == 0 {
				return
			}
			batch.FlushSessionProvider(session.Uuid)
		}
	}

	// Create Folders
	for _, event := range batch.EventsByType([]merger.OperationType{merger.OpCreateFolder}, true) {
		pr.applyProcessFunc(event, operationId, pr.processCreateFolder, "Created Folder", "Creating Folder", "Error while creating folder", &cursor, total, zap.String("path", event.EventInfo.Path))
	}

	// Move folders
	folderMoves := batch.EventsByType([]merger.OperationType{merger.OpMoveFolder}, true)
	sessionFlush(folderMoves)
	for _, event := range folderMoves {
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved Folder", "Moving Folder", "Error while moving folder", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	// Move files
	fileMoves := batch.EventsByType([]merger.OperationType{merger.OpMoveFile}, true)
	sessionFlush(fileMoves)
	for _, event := range fileMoves {
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved File", "Moving File", "Error while moving file", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	// Create files
	createFiles := batch.EventsByType([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile})
	sessionFlush(createFiles)
	if batch.HasTransfers() {
		// Process with a parallel Queue
		wg := &sync.WaitGroup{}
		throttle := make(chan struct{}, 3)
		for _, event = range createFiles {
			wg.Add(1)
			eventCopy := event
			go func() {
				throttle <- struct{}{}
				defer func() {
					<-throttle
					wg.Done()
				}()
				model.Retry(func() error {
					return pr.applyProcessFunc(eventCopy, operationId, pr.processCreateFile, "Created File", "Transferring File", "Error while creating file", &cursor, total, zap.String("path", eventCopy.EventInfo.Path), zap.String("eTag", eventCopy.Node.Etag))
				}, 5*time.Second, 20*time.Second)
			}()
		}
		wg.Wait()
	} else {
		// Process Serialized
		for _, event = range createFiles {
			pr.applyProcessFunc(event, operationId, pr.processCreateFile, "Created File", "Transferring File", "Error while creating file", &cursor, total, zap.String("path", event.EventInfo.Path))
		}
	}

	// Deletes
	deletes := batch.EventsByType([]merger.OperationType{merger.OpDelete})
	sessionFlush(deletes)
	for _, event = range deletes {
		if event.Node == nil {
			continue
		}
		pr.applyProcessFunc(event, operationId, pr.processDelete, "Deleted Node", "Deleting Node", "Error while deleting node", &cursor, total, zap.String("path", event.Node.Path))
	}

	batch.Status(merger.ProcessStatus{StatusString: "Finished processing batch"})

	if len(batch.EventsByType([]merger.OperationType{merger.OpRefreshUuid})) > 0 {
		go pr.refreshFilesUuid(batch)
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "end",
		Data: batch,
	})
}

func (pr *Processor) applyProcessFunc(event *merger.Operation, operationId string, callback ProcessFunc, completeString string, progressString string, errorString string, cursor *int64, total int64, fields ...zapcore.Field) error {

	fields = append(fields, zap.String("target", event.Target().GetEndpointInfo().URI))

	pg := make(chan int64)
	var lastProgress float32
	defer close(pg)
	go func() {
		for p := range pg {
			*cursor += p
			progress := float32(*cursor) / float32(total)
			if progress-lastProgress > 0.01 { // Send 1 per percent
				event.Patch.Status(merger.ProcessStatus{
					StatusString: pr.logAsString(progressString, nil, fields...),
					Progress:     progress,
				})
				lastProgress = progress
			}
		}
	}()

	err := callback(event, operationId, pg)
	if err != nil {
		fields = append(fields, zap.Error(err))
		pr.Logger().Error(errorString, fields...)
	} else {
		pr.Logger().Info(completeString, fields...)
	}

	if total > 0 {
		isError := false
		loggerString := completeString
		if err != nil {
			isError = true
			loggerString = errorString
		}
		event.Patch.Status(merger.ProcessStatus{
			IsError:      isError,
			StatusString: pr.logAsString(loggerString, err, fields...),
			Progress:     float32(*cursor / total),
		})
	}

	return err
}

func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (pr *Processor) ProcessBatches() {

	for {
		select {
		case batch, open := <-pr.BatchesChannel:
			if !open {
				log.Logger(pr.GlobalContext).Info("Stop processing batches, pr.BatchesChannel is closed")
				return
			}
			pr.process(batch)
		}
	}

}
