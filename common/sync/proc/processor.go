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

	"github.com/pydio/cells/common/sync/filters"
	"github.com/pydio/cells/common/sync/model"

	"github.com/satori/go.uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type Processor struct {
	BatchesChannel  chan *model.Batch
	RequeueChannels map[model.PathSyncSource]chan model.EventInfo
	LocksChannel    chan filters.LockEvent
	UnlocksChannel  chan filters.UnlockEvent
	JobsInterrupt   chan bool
	GlobalContext   context.Context

	eventChannels []chan model.ProcessorEvent
}

type ProcessFunc func(event *model.BatchEvent, operationId string) error

func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		BatchesChannel:  make(chan *model.Batch),
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

func (pr *Processor) lockFileTo(batchedEvent *model.BatchEvent, path string, operationId string) {
	if source, ok := model.AsPathSyncSource(batchedEvent.Target); pr.LocksChannel != nil && ok {
		pr.LocksChannel <- filters.LockEvent{
			Source:      source,
			Path:        path,
			OperationId: operationId,
		}
	}
}

func (pr *Processor) unlockFile(batchedEvent *model.BatchEvent, path string) {
	if source, castOk := model.AsPathSyncSource(batchedEvent.Target); castOk && pr.UnlocksChannel != nil {
		go func() {
			<-time.After(2 * time.Second)
			pr.UnlocksChannel <- filters.UnlockEvent{
				Source: source,
				Path:   path,
			}
		}()
	}
}

func (pr *Processor) process(batch *model.Batch) {

	if batch.DoneChan != nil {
		defer func() {
			batch.DoneChan <- true
		}()
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "merger:start",
		Data: batch,
	})

	operationId := fmt.Sprintf("%s", uuid.NewV4())
	var event *model.BatchEvent

	total := float32(len(batch.CreateFolders) + len(batch.FolderMoves) + len(batch.CreateFiles) + len(batch.FileMoves) + len(batch.Deletes))
	var cursor float32

	if batch.StatusChan != nil {
		batch.StatusChan <- model.BatchProcessStatus{StatusString: "Start processing batch"}
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
		cursor++
		pr.applyProcessFunc(event, operationId, pr.processCreateFolder, "Created Folder", "Error while creating folder",
			batch.StatusChan, cursor, total, zap.String("path", event.EventInfo.Path))
	}

	if len(batch.FolderMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move folders
	for _, eKey := range pr.sortedKeys(batch.FolderMoves) {
		event := batch.FolderMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		cursor++
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved Folder", "Error while moving folder",
			batch.StatusChan, cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.FileMoves) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Move files
	for _, eKey := range pr.sortedKeys(batch.FileMoves) {
		event := batch.FileMoves[eKey]
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		cursor++
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved File", "Error while moving file",
			batch.StatusChan, cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	if len(batch.CreateFiles) > 0 && sessionUuid != "" && batch.SessionProvider != nil {
		batch.SessionProvider.FlushSession(batch.SessionProviderContext, sessionUuid)
	}

	// Create files
	for _, event = range batch.CreateFiles {
		cursor++
		pr.applyProcessFunc(event, operationId, pr.processCreateFile, "Created File", "Error while creating file",
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
		pr.applyProcessFunc(event, operationId, pr.processDelete, "Deleted Node", "Error while deleting node",
			batch.StatusChan, cursor, total, zap.String("path", event.Node.Path))
	}

	if batch.StatusChan != nil {
		batch.StatusChan <- model.BatchProcessStatus{StatusString: "Finished processing batch"}
	}

	if len(batch.RefreshFilesUuid) > 0 {
		go pr.refreshFilesUuid(batch)
	}

	pr.sendEvent(model.ProcessorEvent{
		Type: "merger:end",
		Data: batch,
	})
}

func (pr *Processor) applyProcessFunc(event *model.BatchEvent, operationId string, callback ProcessFunc,
	completeString string, errorString string, statusChan chan model.BatchProcessStatus, cursor float32,
	count float32, fields ...zapcore.Field) {

	err := callback(event, operationId)
	if err != nil {
		fields = append(fields, zap.Error(err))
		pr.Logger().Error(errorString, fields...)
	} else {
		pr.Logger().Info(completeString, fields...)
	}

	if statusChan != nil && count > 0 {
		isError := false
		loggerString := completeString
		if err != nil {
			isError = true
			loggerString = errorString
		}
		statusChan <- model.BatchProcessStatus{
			IsError:      isError,
			StatusString: pr.logAsString(loggerString, err, fields...),
			Progress:     cursor / count,
		}
	}

}

func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (pr *Processor) sortedKeys(events map[string]*model.BatchEvent) []string {
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
