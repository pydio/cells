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
	"sort"
	"time"

	"github.com/satori/go.uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

type Processor struct {
	BatchesChannel  chan *merger.Batch
	RequeueChannels map[model.PathSyncSource]chan model.EventInfo
	LocksChannel    chan filters.LockEvent
	UnlocksChannel  chan filters.UnlockEvent
	JobsInterrupt   chan bool
	GlobalContext   context.Context

	eventChannels []chan model.ProcessorEvent
}

type ProcessFunc func(event *merger.BatchEvent, operationId string, progress chan int64) error

func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		BatchesChannel:  make(chan *merger.Batch),
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

func (pr *Processor) lockFileTo(batchedEvent *merger.BatchEvent, path string, operationId string) {
	if source, ok := model.AsPathSyncSource(batchedEvent.Target()); pr.LocksChannel != nil && ok {
		pr.LocksChannel <- filters.LockEvent{
			Source:      source,
			Path:        path,
			OperationId: operationId,
		}
	}
}

func (pr *Processor) unlockFile(batchedEvent *merger.BatchEvent, path string) {
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

func (pr *Processor) process(batch *merger.Batch) {

	if batch.DoneChan != nil {
		defer func() {
			batch.DoneChan <- true
		}()
	}

	if batch.Size() == 0 {
		// Nothing to do !
		return
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "merger:start",
		Data: batch,
	})

	operationId := fmt.Sprintf("%s", uuid.NewV4())
	var event *merger.BatchEvent

	total := batch.ProgressTotal()
	var cursor int64

	if batch.StatusChan != nil {
		batch.StatusChan <- merger.BatchProcessStatus{StatusString: fmt.Sprintf("Start processing batch - Total Bytes %d", total)}
	}

	var sessionUuid string
	if batch.SessionProvider != nil {
		sess, err := batch.SessionProvider.StartSession(batch.SessionProviderContext, &tree.Node{Path: "/"})
		if err != nil {
			pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
		} else {
			sessionUuid = sess.Uuid
			defer batch.SessionProvider.FinishSession(batch.SessionProviderContext, sessionUuid)
		}
	}

	// Create Folders
	for _, eKey := range pr.sortedKeys(batch.CreateFolders) {
		event := batch.CreateFolders[eKey]
		pr.applyProcessFunc(event, operationId, pr.processCreateFolder, "Created Folder", "Creating Folder", "Error while creating folder",
			batch.StatusChan, &cursor, total, zap.String("path", event.EventInfo.Path))
	}

	if len(batch.FolderMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move folders
	for _, eKey := range pr.sortedKeys(batch.FolderMoves) {
		event := batch.FolderMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved Folder", "Moving Folder", "Error while moving folder",
			batch.StatusChan, &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.FileMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move files
	for _, eKey := range pr.sortedKeys(batch.FileMoves) {
		event := batch.FileMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved File", "Moving File", "Error while moving file",
			batch.StatusChan, &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.CreateFiles) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Create files
	for _, event = range batch.CreateFiles {
		pr.applyProcessFunc(event, operationId, pr.processCreateFile, "Created File", "Transferring File", "Error while creating file",
			batch.StatusChan, &cursor, total, zap.String("path", event.EventInfo.Path))
	}

	if len(batch.Deletes) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Deletes
	for _, event = range batch.Deletes {
		if event.Node == nil {
			continue
		}
		pr.applyProcessFunc(event, operationId, pr.processDelete, "Deleted Node", "Deleting Node", "Error while deleting node",
			batch.StatusChan, &cursor, total, zap.String("path", event.Node.Path))
	}

	if batch.StatusChan != nil {
		batch.StatusChan <- merger.BatchProcessStatus{StatusString: "Finished processing batch"}
	}

	if len(batch.RefreshFilesUuid) > 0 {
		go pr.refreshFilesUuid(batch)
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "end",
		Data: batch,
	})
}

func (pr *Processor) applyProcessFunc(event *merger.BatchEvent, operationId string, callback ProcessFunc,
	completeString string, progressString string, errorString string, statusChan chan merger.BatchProcessStatus, cursor *int64,
	total int64, fields ...zapcore.Field) {

	fields = append(fields, zap.String("target", event.Target().GetEndpointInfo().URI))

	pg := make(chan int64)
	var lastProgress float32
	defer close(pg)
	go func() {
		for p := range pg {
			*cursor += p
			progress := float32(*cursor) / float32(total)
			if statusChan != nil && progress-lastProgress > 0.01 { // Send 1 per percent
				statusChan <- merger.BatchProcessStatus{
					StatusString: pr.logAsString(progressString, nil, fields...),
					Progress:     progress,
				}
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

	if statusChan != nil && total > 0 {
		isError := false
		loggerString := completeString
		if err != nil {
			isError = true
			loggerString = errorString
		}
		statusChan <- merger.BatchProcessStatus{
			IsError:      isError,
			StatusString: pr.logAsString(loggerString, err, fields...),
			Progress:     float32(*cursor / total),
		}
	}

}

func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (pr *Processor) sortedKeys(events map[string]*merger.BatchEvent) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func (pr *Processor) ProcessBatches() {

	for {
		select {
		case batch, open := <-pr.BatchesChannel:
			if !open {
				continue
			}
			pr.process(batch)
		}
	}

}
