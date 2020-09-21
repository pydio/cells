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

	"github.com/gobwas/glob"
	"github.com/pborman/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// ProcessFunc is a generic function signature for applying an operation
type ProcessFunc func(canceler context.Context, event merger.Operation, operationId string, progress chan int64) error

// ProcessorLocker defines a set of event based functions that can be called during processing
type ProcessorLocker interface {
	// LockFile sends LockEvent for Echo Filtering
	LockFile(operation merger.Operation, path string, operationId string)
	// UnlockFile sends UnlockEvent for Echo Filtering
	UnlockFile(operation merger.Operation, path string)
}

// Processor is a simple processor without external connections
type Processor struct {
	GlobalContext    context.Context
	Locker           ProcessorLocker
	QueueSize        int
	Silent           bool
	SkipTargetChecks bool
	Ignores          []glob.Glob
	PatchListener    merger.PatchListener
}

// NewProcessor creates a new processor
func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		GlobalContext: ctx,
		QueueSize:     5,
		Silent:        false,
	}
}

// Process calls all Operations to be performed on a Patch
func (pr *Processor) Process(patch merger.Patch, cmd *model.Command) {

	var interrupted bool

	// Send the patch itself on the doneChan
	defer func() {
		if interrupted {
			patch.Status(model.NewProcessingStatus("Patch interrupted by user").SetError(errors.New("patch interrupted by user")))
		}
		patch.Done(patch)
	}()

	patch.Filter(pr.GlobalContext, pr.Ignores...)
	if errs, b := patch.HasErrors(); b {
		for _, e := range errs {
			log.Logger(pr.GlobalContext).Error("Errors after filtering patch", zap.Error(e))
		}
		return // Errors while filtering, stop now
	}

	for _, f := range patch.PostFilter() {
		if e := f(); e != nil {
			patch.SetPatchError(e)
			return
		}
	}

	if patch.Size() == 0 {
		log.Logger(pr.GlobalContext).Info("Empty Patch : nothing to do")
		return
	}

	// This is a bit hacky - We should have a more generic patch chan (not just Done) for publishing patches
	if pr.PatchListener != nil {
		pr.PatchListener.PublishPatch(patch)
	}

	if !pr.SkipTargetChecks {
		patch.FilterToTarget(pr.GlobalContext)
		if patch.Size() == 0 {
			log.Logger(pr.GlobalContext).Info("Empty Patch after filtering")
			return
		}
	}

	var cursor int64
	processUUID := uuid.New()
	total := patch.ProgressTotal()

	patch.Status(model.NewProcessingStatus(fmt.Sprintf("Start processing patch (total bytes %d)", total)))
	stats := patch.Stats()
	pending := make(map[string]int)
	if pen, ok := stats["Pending"]; ok {
		pending = pen.(map[string]int)
	}

	// Setup Session : patch will start/flush/finish session on underlying Source() and Target()
	// if necessary. Flush is triggered between each operation type by checking if next type has
	// some Pending operations.
	flusher := func(tt ...merger.OperationType) {}
	if session, err := patch.StartSession(&tree.Node{Path: "/"}); err == nil {
		defer func() {
			if e := patch.FinishSession(session.Uuid); e != nil {
				patch.SetPatchError(e)
			}
		}()
		flusher = func(tt ...merger.OperationType) {
			for _, t := range tt {
				if val, ok := pending[t.String()]; ok && val > 0 {
					if e := patch.FlushSession(session.Uuid); e != nil {
						patch.SetPatchError(e)
					}
					return
				}
			}
		}
	} else {
		pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
	}

	// Listen to cmd Chan
	ctx, cancel := context.WithCancel(pr.GlobalContext)
	var cmdChan chan model.SyncCmd
	if cmd != nil {
		var unsub chan bool
		cmdChan, unsub = cmd.Subscribe()
		cmdDone := make(chan bool)
		defer close(cmdDone)
		go func() {
			defer close(unsub)
			for {
				select {
				case cmd := <-cmdChan:
					if cmd == model.Interrupt {
						interrupted = true
						cancel()
						return
					}
				case <-cmdDone:
					return
				}
			}
		}()
	}

	parallel := make(chan merger.Operation)
	opsFinished := make(chan struct{})
	done := make(chan struct{})
	previousType := merger.OpUnknown
	go func() {
		defer close(done)
		wg := &sync.WaitGroup{}
		throttle := make(chan struct{}, pr.QueueSize)
		for {
			select {
			case op := <-parallel:

				// Flush for next type if it's different
				if previousType != merger.OpCreateFile && previousType != merger.OpUpdateFile {
					flusher(merger.OpCreateFile, merger.OpUpdateFile)
				}
				previousType = op.Type()
				if interrupted || op.IsProcessed() {
					break
				}
				wg.Add(1)
				opCopy := op
				throttle <- struct{}{}
				go func() {
					defer func() {
						<-throttle
						wg.Done()
					}()
					if interrupted {
						return
					}
					pr.applyProcessFunc(ctx, patch, opCopy, processUUID, &cursor, total, true)
				}()

			case <-opsFinished:
				wg.Wait()
				return

			}
		}
	}()

	serialWalker := func(op merger.Operation) {
		// Flush for next type if it's different
		if previousType != merger.OpUnknown && op.Type() != previousType {
			flusher(op.Type())
		}
		previousType = op.Type()
		if interrupted || op.IsProcessed() {
			return
		}
		pr.applyProcessFunc(ctx, patch, op, processUUID, &cursor, total, false)
	}

	patch.WalkOperations([]merger.OperationType{merger.OpCreateFolder}, serialWalker)
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFolder}, serialWalker)
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFile}, serialWalker)
	if patch.HasTransfers() {
		patch.WalkOperations([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile}, func(o merger.Operation) {
			parallel <- o
		})
	} else {
		patch.WalkOperations([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile}, serialWalker)
	}
	patch.WalkOperations([]merger.OperationType{merger.OpDelete}, func(o merger.Operation) {
		if o.GetNode() != nil {
			serialWalker(o)
		}
	})

	if len(patch.OperationsByType([]merger.OperationType{merger.OpRefreshUuid})) > 0 {
		go pr.refreshFilesUuid(patch)
	}

	close(opsFinished)
	// Wait that all parallel operations are done
	<-done

	// Now that all files are created, we can process metadata operations
	patch.WalkOperations([]merger.OperationType{merger.OpCreateMeta, merger.OpUpdateMeta, merger.OpDeleteMeta}, serialWalker)

	if pE, h := patch.HasErrors(); !h && !pr.SkipTargetChecks {
		if err := patch.Validate(ctx); err != nil {
			log.Logger(pr.GlobalContext).Error("Could not validate patch", zap.Error(err))
		}
	} else if h {
		log.Logger(pr.GlobalContext).Error("Patch ended with errors", zap.Int("count", len(pE)))
		for _, e := range pE {
			log.Logger(pr.GlobalContext).Error("--- Error", zap.Error(e), zap.String("target", patch.Target().GetEndpointInfo().URI))
		}

	}
}

// applyProcessFunc takes a ProcessFunc and handle progress, status messages, etc
func (pr *Processor) applyProcessFunc(ctx context.Context, p merger.Patch, op merger.Operation, operationId string, cursor *int64, total int64, retry bool) error {

	callback, progressString, completeString, errorString, fields := pr.dataForOperation(p, op)

	pgs := make(chan int64)
	var lastProgress float32
	defer close(pgs)
	go func() {
		for pg := range pgs {
			*cursor += pg
			progress := float32(*cursor) / float32(total)
			if pg < 0 || progress-lastProgress > 0.01 { // Send percent per percent, or if it's negative (error reverted pg value)
				log.Logger(pr.GlobalContext).Debug("Sending PG", zap.Float32("pg", progress))
				op.Status(model.NewProcessingStatus(pr.logAsString(progressString, nil, fields...)).SetProgress(progress))
				lastProgress = progress
			}
		}
	}()
	var err error
	if retry {
		err = model.RetryWithCtx(ctx, func(retry int) error {
			e := callback(ctx, op, operationId, pgs)
			if e != nil {
				pr.Logger().Error(errorString, fields...)
				op.Status(model.NewProcessingStatus(fmt.Sprintf("%s (%s) - retrying...", errorString, e.Error())).SetError(e))
			}
			return e
		}, 5*time.Second, 20*time.Second)
	} else {
		err = callback(ctx, op, operationId, pgs)
	}
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

	loggerString := completeString
	if err != nil {
		loggerString = errorString
	}
	var end float32
	if total > 0 {
		end = float32(*cursor) / float32(total)
	}
	op.Status(model.NewProcessingStatus(pr.logAsString(loggerString, err, fields...)).SetError(err).SetProgress(end))

	return err
}

// logAsStrings transforms zap Fields to string
func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (pr *Processor) dataForOperation(p merger.Patch, op merger.Operation) (cb ProcessFunc, progress string, complete string, error string, fields []zapcore.Field) {

	switch op.Type() {
	case merger.OpCreateFolder:
		cb = pr.processCreateFolder
		progress = "Creating folder"
		complete = "Created folder"
		error = "Error while creating folder"
		fields = append(fields, zap.String(common.KEY_NODE_PATH, op.GetRefPath()))
	case merger.OpCreateFile, merger.OpUpdateFile:
		cb = pr.processCreateFile
		if p.HasTransfers() {
			progress = "Transferring file"
			complete = "Transferred file"
			error = "Error while transferring file"
		} else {
			progress = "Indexing file"
			complete = "Indexed file"
			error = "Error while indexing file"
		}
		fields = append(fields, zap.String(common.KEY_NODE_PATH, op.GetRefPath()))
	case merger.OpMoveFolder:
		cb = pr.processMove
		progress = "Moving folder"
		complete = "Moved folder"
		error = "Error while moving folder"
		fields = append(fields, zap.String(common.KEY_NODE_PATH, op.GetMoveOriginPath()))
		fields = append(fields, zap.String("NodeTo", op.GetRefPath()))
	case merger.OpMoveFile:
		cb = pr.processMove
		progress = "Moving file"
		complete = "Moved file"
		error = "Error while moving file"
		fields = append(fields, zap.String(common.KEY_NODE_PATH, op.GetMoveOriginPath()))
		fields = append(fields, zap.String("NodeTo", op.GetRefPath()))
	case merger.OpDelete:
		cb = pr.processDelete
		nS := "folder"
		if op.GetNode().IsLeaf() {
			nS = "file"
		}
		progress = "Deleting " + nS
		complete = "Deleted " + nS
		error = "Error while deleting " + nS
		fields = append(fields, zap.String(common.KEY_NODE_PATH, op.GetRefPath()))
	case merger.OpCreateMeta:
		cb = pr.processMetadata
		progress = "Creating metadata"
		complete = "Created metadata"
		error = "Error while creating metadata"
		fields = append(fields, zap.String("namespace", op.GetNode().GetUuid()))
	case merger.OpDeleteMeta:
		cb = pr.processMetadata
		progress = "Removing metadata"
		complete = "Removed metadata"
		error = "Error while removing metadata"
		fields = append(fields, zap.String("namespace", op.GetNode().GetUuid()))
	case merger.OpUpdateMeta:
		cb = pr.processMetadata
		progress = "Updating metadata"
		complete = "Updated metadata"
		error = "Error while updating metadata"
		fields = append(fields, zap.String("namespace", op.GetNode().GetUuid()))
	}
	fields = append(fields, zap.String("target", op.Target().GetEndpointInfo().URI))
	return
}

// Logger is a shortcut for log.Logger(pr.globalContext) function
func (pr *Processor) Logger() *zap.Logger {
	return log.Logger(pr.GlobalContext)
}
