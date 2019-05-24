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
type ProcessFunc func(event merger.Operation, operationId string, progress chan int64) error

// ProcessorConnector defines a set of event based functions that can be called during processing
type ProcessorConnector interface {
	// Requeue send a fake event to be requeued in original Event chan input
	Requeue(source model.PathSyncSource, event model.EventInfo)
	// LockFile sends LockEvent for Echo Filtering
	LockFile(operation merger.Operation, path string, operationId string)
	// UnlockFile sends UnlockEvent for Echo Filtering
	UnlockFile(operation merger.Operation, path string)
}

// Processor is a simple processor without external connections
type Processor struct {
	GlobalContext context.Context
	Connector     ProcessorConnector
	QueueSize     int
	Silent        bool
}

// NewProcessor creates a new processor
func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		GlobalContext: ctx,
		QueueSize:     4,
		Silent:        false,
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

	total := patch.ProgressTotal()
	var cursor int64

	patch.Status(merger.ProcessStatus{StatusString: fmt.Sprintf("Start processing patch (total bytes %d)", total)})
	stats := patch.Stats()

	sessionFlush := func(stats map[string]interface{}, tt ...merger.OperationType) {}
	session, err := patch.StartSessionProvider(&tree.Node{Path: "/"})
	if err != nil {
		pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
	} else {
		defer patch.FinishSessionProvider(session.Uuid)
		sessionFlush = func(stats map[string]interface{}, tt ...merger.OperationType) {
			for _, t := range tt {
				if val, ok := stats[t.String()]; ok {
					if val.(int) > 0 {
						patch.FlushSessionProvider(session.Uuid)
						return
					}
				}
			}
		}
	}

	// Create Folders
	patch.WalkOperations([]merger.OperationType{merger.OpCreateFolder}, func(operation merger.Operation) {
		pr.applyProcessFunc(operation, operationId, pr.processCreateFolder, "Created folder", "Creating folder", "Error while creating folder", &cursor, total, zap.String("path", operation.GetRefPath()))
	})

	sessionFlush(stats, merger.OpMoveFolder)
	// Move folders
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFolder}, func(operation merger.Operation) {
		toPath := operation.GetRefPath()
		fromPath := operation.GetMoveOriginPath()
		pr.applyProcessFunc(operation, operationId, pr.processMove, "Moved folder", "Moving folder", "Error while moving folder", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	})

	// Move files
	sessionFlush(stats, merger.OpMoveFile)
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFile}, func(operation merger.Operation) {
		toPath := operation.GetRefPath()
		fromPath := operation.GetMoveOriginPath()
		pr.applyProcessFunc(operation, operationId, pr.processMove, "Moved file", "Moving file", "Error while moving file", &cursor, total, zap.String("from", fromPath), zap.String("to", toPath))
	})

	// Create files
	createFiles := patch.OperationsByType([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile})
	sessionFlush(stats, merger.OpCreateFile, merger.OpUpdateFile)
	if patch.HasTransfers() {
		// Process with a parallel Queue
		wg := &sync.WaitGroup{}
		throttle := make(chan struct{}, pr.QueueSize)
		for _, op := range createFiles {
			wg.Add(1)
			opCopy := op
			go func() {
				throttle <- struct{}{}
				defer func() {
					<-throttle
					wg.Done()
				}()
				model.Retry(func() error {
					return pr.applyProcessFunc(opCopy, operationId, pr.processCreateFile, "Transferred file", "Transferring file", "Error while transferring file", &cursor, total, zap.String("path", opCopy.GetRefPath()), zap.String("eTag", opCopy.GetNode().Etag))
				}, 5*time.Second, 20*time.Second)
			}()
		}
		wg.Wait()
	} else {
		// Process Serialized
		for _, event := range createFiles {
			pr.applyProcessFunc(event, operationId, pr.processCreateFile, "Indexed file", "Indexing file", "Error while indexing file", &cursor, total, zap.String("path", event.GetRefPath()))
		}
	}

	// Deletes
	deletes := patch.OperationsByType([]merger.OperationType{merger.OpDelete})
	sessionFlush(stats, merger.OpDelete)
	for _, op := range deletes {
		if op.GetNode() == nil {
			continue
		}
		nS := "folder"
		if op.GetNode().IsLeaf() {
			nS = "file"
		}
		pr.applyProcessFunc(op, operationId, pr.processDelete, "Deleted "+nS, "Deleting "+nS, "Error while deleting "+nS, &cursor, total, zap.String("path", op.GetNode().Path))
	}
	var pg float32
	if total > 0 {
		pg = float32(cursor) / float32(total)
	}
	patch.Status(merger.ProcessStatus{StatusString: "Finished processing patch", Progress: pg})

	if len(patch.OperationsByType([]merger.OperationType{merger.OpRefreshUuid})) > 0 {
		go pr.refreshFilesUuid(patch)
	}

}

// Logger is a shortcut for log.Logger(pr.globalContext) function
func (pr *Processor) Logger() *zap.Logger {
	return log.Logger(pr.GlobalContext)
}

// applyProcessFunc takes a ProcessFunc and handle progress, status messages, etc
func (pr *Processor) applyProcessFunc(op merger.Operation, operationId string, callback ProcessFunc, completeString string, progressString string, errorString string, cursor *int64, total int64, fields ...zapcore.Field) error {

	fields = append(fields, zap.String("target", op.Target().GetEndpointInfo().URI))

	pgs := make(chan int64)
	var lastProgress float32
	defer close(pgs)
	go func() {
		for pg := range pgs {
			*cursor += pg
			progress := float32(*cursor) / float32(total)
			if progress-lastProgress > 0.01 { // Send 1 per percent
				log.Logger(pr.GlobalContext).Debug("Sending PG", zap.Float32("pg", progress))
				op.Status(merger.ProcessStatus{
					StatusString: pr.logAsString(progressString, nil, fields...),
					Progress:     progress,
				})
				lastProgress = progress
			}
		}
	}()

	err := callback(op, operationId, pgs)
	if err != nil {
		fields = append(fields, zap.Error(err))
		if !pr.Silent {
			pr.Logger().Error(errorString, fields...)
		}
	} else {
		op.SetProcessed()
		if !pr.Silent {
			pr.Logger().Info(completeString, fields...)
		}
	}

	if total > 0 {
		isError := false
		loggerString := completeString
		if err != nil {
			isError = true
			loggerString = errorString
		}
		end := float32(*cursor) / float32(total)
		log.Logger(pr.GlobalContext).Debug("Sending PG END", zap.Float32("pg", end))
		op.Status(merger.ProcessStatus{
			IsError:      isError,
			StatusString: pr.logAsString(loggerString, err, fields...),
			Progress:     end,
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
