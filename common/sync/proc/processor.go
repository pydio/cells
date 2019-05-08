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
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// ProcessFunc is a generic function signature for applying an operation
type ProcessFunc func(event *merger.Operation, operationId string, progress chan int64) error

// ProcessorConnector defines a set of event based functions that can be called during processing
type ProcessorConnector interface {
	// Requeue send a fake event to be requeued in original Event chan input
	Requeue(source model.PathSyncSource, event model.EventInfo)
	// LockFile sends LockEvent for Echo Filtering
	LockFile(operation *merger.Operation, path string, operationId string)
	// UnlockFile sends UnlockEvent for Echo Filtering
	UnlockFile(operation *merger.Operation, path string)
}

// Processor is a simple processor without external connections
type Processor struct {
	GlobalContext context.Context
	Connector     ProcessorConnector
}

// NewProcessor creates a new processor
func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		GlobalContext: ctx,
	}
}

// Process calls all Operations to be performed on a Patch
func (pr *Processor) Process(patch merger.Patch) {

	s := patch.Size()
	defer patch.Done(s)

	if s == 0 {
		return
	}

	operationId := uuid.New()
	var event *merger.Operation

	total := patch.ProgressTotal()
	var cursor int64

	patch.Status(merger.ProcessStatus{StatusString: fmt.Sprintf("Start processing patch (total bytes %d)", total)})

	sessionFlush := func(nonEmpty []*merger.Operation) {}
	session, err := patch.StartSessionProvider(&tree.Node{Path: "/"})
	if err != nil {
		pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
	} else {
		defer patch.FinishSessionProvider(session.Uuid)
		sessionFlush = func(nonEmpty []*merger.Operation) {
			if len(nonEmpty) == 0 {
				return
			}
			patch.FlushSessionProvider(session.Uuid)
		}
	}

	// Create Folders
	for _, event := range patch.OperationsByType([]merger.OperationType{merger.OpCreateFolder}, true) {
		pr.applyProcessFunc(event, operationId, pr.processCreateFolder, "Created Folder", "Creating Folder", "Error while creating folder", &cursor, total, zap.String("path", event.EventInfo.Path))
	}

	// Move folders
	folderMoves := patch.OperationsByType([]merger.OperationType{merger.OpMoveFolder}, true)
	sessionFlush(folderMoves)
	for _, event := range folderMoves {
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved Folder", "Moving Folder", "Error while moving folder", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	// Move files
	fileMoves := patch.OperationsByType([]merger.OperationType{merger.OpMoveFile}, true)
	sessionFlush(fileMoves)
	for _, event := range fileMoves {
		toPath := event.EventInfo.Path
		fromPath := event.Node.Path
		pr.applyProcessFunc(event, operationId, pr.processMove, "Moved File", "Moving File", "Error while moving file", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	}

	// Create files
	createFiles := patch.OperationsByType([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile})
	sessionFlush(createFiles)
	if patch.HasTransfers() {
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
	deletes := patch.OperationsByType([]merger.OperationType{merger.OpDelete})
	sessionFlush(deletes)
	for _, event = range deletes {
		if event.Node == nil {
			continue
		}
		pr.applyProcessFunc(event, operationId, pr.processDelete, "Deleted Node", "Deleting Node", "Error while deleting node", &cursor, total, zap.String("path", event.Node.Path))
	}

	patch.Status(merger.ProcessStatus{StatusString: "Finished processing patch"})

	if len(patch.OperationsByType([]merger.OperationType{merger.OpRefreshUuid})) > 0 {
		go pr.refreshFilesUuid(patch)
	}

}

// Logger is a shortcut for log.Logger(pr.globalContext) function
func (pr *Processor) Logger() *zap.Logger {
	return log.Logger(pr.GlobalContext)
}

// applyProcessFunc takes a ProcessFunc and handle progress, status messages, etc
func (pr *Processor) applyProcessFunc(event *merger.Operation, operationId string, callback ProcessFunc, completeString string, progressString string, errorString string, cursor *int64, total int64, fields ...zapcore.Field) error {

	fields = append(fields, zap.String("target", event.Target().GetEndpointInfo().URI))

	pgs := make(chan int64)
	var lastProgress float32
	defer close(pgs)
	go func() {
		for pg := range pgs {
			*cursor += pg
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

	err := callback(event, operationId, pgs)
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

// logAsStrings transforms zap Fields to string
func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}
