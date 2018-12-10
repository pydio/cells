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
	. "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

type Merger struct {
	BatchesChannel  chan *filters.Batch
	RequeueChannels map[PathSyncSource]chan EventInfo
	LocksChannel    chan filters.LockEvent
	UnlocksChannel  chan filters.UnlockEvent
	JobsInterrupt   chan bool
	GlobalContext   context.Context

	eventChannels []chan ProcessorEvent
}

type ProcessFunc func(event *filters.BatchedEvent, operationId string) error

func NewMerger(ctx context.Context) *Merger {
	requeueChannels := make(map[PathSyncSource]chan EventInfo)
	batchesChannel := make(chan *filters.Batch)
	return &Merger{
		BatchesChannel:  batchesChannel,
		RequeueChannels: requeueChannels,
		JobsInterrupt:   make(chan bool),
		GlobalContext:   ctx,
	}
}

func (b *Merger) Shutdown() {
	close(b.BatchesChannel)
}

func (b *Merger) Logger() *zap.Logger {
	return log.Logger(b.GlobalContext)
}

func (b *Merger) AddRequeueChannel(source PathSyncSource, channel chan EventInfo) {
	b.RequeueChannels[source] = channel
}

func (b *Merger) RegisterEventChannel(out chan ProcessorEvent) {
	b.eventChannels = append(b.eventChannels, out)
}

func (b *Merger) sendEvent(event ProcessorEvent) {
	for _, channel := range b.eventChannels {
		channel <- event
	}
}

func (b *Merger) lockFileTo(batchedEvent *filters.BatchedEvent, path string, operationId string) {
	pathSyncTarget, castOk := interface{}(batchedEvent.Target).(PathSyncSource)
	if b.LocksChannel != nil && castOk {
		b.LocksChannel <- filters.LockEvent{
			Source:      pathSyncTarget,
			Path:        path,
			OperationId: operationId,
		}
	}
}

func (b *Merger) unlockFile(batchedEvent *filters.BatchedEvent, path string) {
	pathSyncTarget, castOk := interface{}(batchedEvent.Target).(PathSyncSource)
	if !castOk {
		return
	}
	go func() {
		time.Sleep(2 * time.Second)
		if b.UnlocksChannel != nil {
			b.UnlocksChannel <- filters.UnlockEvent{
				Source: pathSyncTarget,
				Path:   path,
			}
		}
	}()
}

func (b *Merger) process(batch *filters.Batch) {

	if batch.DoneChan != nil {
		defer func() {
			fmt.Println("Sending event for batch finished")
			batch.DoneChan <- true
		}()
	}

	b.sendEvent(ProcessorEvent{
		Type: "merger:start",
		Data: batch,
	})

	operationId := fmt.Sprintf("%s", uuid.NewV4())
	var event *filters.BatchedEvent

	total := float32(len(batch.CreateFolders) + len(batch.FolderMoves) + len(batch.CreateFiles) + len(batch.FileMoves) + len(batch.Deletes))
	var cursor float32

	if batch.StatusChan != nil {
		batch.StatusChan <- filters.BatchProcessStatus{StatusString: "Start processing batch"}
	}

	var sessionUuid string
	if batch.SessionProvider != nil {
		sess, err := batch.SessionProvider.StartSession(batch.SessionProviderContext, &tree.Node{Path: "/"})
		if err != nil {
			b.Logger().Error("Error while starting Indexation Session", zap.Error(err))
		} else {
			sessionUuid = sess.Uuid
			defer batch.SessionProvider.FinishSession(batch.SessionProviderContext, sessionUuid)
		}
	}

	// Create Folders
	for _, eKey := range b.sortedKeys(batch.CreateFolders) {
		event := batch.CreateFolders[eKey]
		cursor++
		b.applyProcessFunc(event, operationId, b.processCreateFolder, "Created Folder", "Error while creating folder",
			batch.StatusChan, cursor, total, zap.String("path", event.EventInfo.Path))
	}

	if len(batch.FolderMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move folders
	for _, eKey := range b.sortedKeys(batch.FolderMoves) {
		event := batch.FolderMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		cursor++
		b.applyProcessFunc(event, operationId, b.processMove, "Moved Folder", "Error while moving folder",
			batch.StatusChan, cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.FileMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move files
	for _, eKey := range b.sortedKeys(batch.FileMoves) {
		event := batch.FileMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		cursor++
		b.applyProcessFunc(event, operationId, b.processMove, "Moved File", "Error while moving file",
			batch.StatusChan, cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.CreateFiles) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Create files
	for _, event = range batch.CreateFiles {
		cursor++
		b.applyProcessFunc(event, operationId, b.processCreateFile, "Created File", "Error while creating file",
			batch.StatusChan, cursor, total, zap.String("path", event.EventInfo.Path))
	}

	if len(batch.Deletes) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Deletes
	for _, event = range batch.Deletes {
		if event.Node == nil {
			continue
		}
		cursor++
		b.applyProcessFunc(event, operationId, b.processDelete, "Deleted Node", "Error while deleting node",
			batch.StatusChan, cursor, total, zap.String("path", event.Node.Path))
	}

	if batch.StatusChan != nil {
		batch.StatusChan <- filters.BatchProcessStatus{StatusString: "Finished processing batch"}
	}

	b.sendEvent(ProcessorEvent{
		Type: "merger:end",
		Data: batch,
	})
}

func (b *Merger) applyProcessFunc(event *filters.BatchedEvent, operationId string, callback ProcessFunc, completeString string, errorString string, statusChan chan filters.BatchProcessStatus, cursor float32, count float32, fields ...zapcore.Field) {

	err := callback(event, operationId)
	if err != nil {
		fields = append(fields, zap.Error(err))
		b.Logger().Error(errorString, fields...)
	} else {
		b.Logger().Debug(completeString, fields...)
	}

	if statusChan != nil && count > 0 {
		isError := false
		loggerString := completeString
		if err != nil {
			isError = true
			loggerString = errorString
		}
		statusChan <- filters.BatchProcessStatus{
			IsError:      isError,
			StatusString: b.logAsString(loggerString, err, fields...),
			Progress:     cursor / count,
		}
	}

}

func (b *Merger) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (b *Merger) sortedKeys(events map[string]*filters.BatchedEvent) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func (b *Merger) ProcessBatches() {

	for {
		select {
		case batch, open := <-b.BatchesChannel:
			if !open {
				continue
			}
			b.process(batch)
		}
	}

}
