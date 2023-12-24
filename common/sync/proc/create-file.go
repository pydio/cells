/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package proc

import (
	"context"
	"io"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/sync/merger"
	"github.com/pydio/cells/v4/common/sync/model"
)

// cancellableReaderWithProgress wraps calls to io.Reader sending a progress of total bytes read
// and provides a way to cancel copy through a context
type cancellableReaderWithProgress struct {
	io.Reader
	canceler  context.Context
	pg        chan int64
	totalRead int64
}

// Read implements the io.Reader basic function
func (pr *cancellableReaderWithProgress) Read(p []byte) (n int, e error) {
	select {
	case <-pr.canceler.Done():
		return 0, pr.canceler.Err()
	default:
		//return 0, fmt.Errorf("fake.read.error.on.copy")
		n, e = pr.Reader.Read(p)
		pr.pg <- int64(n)
		pr.totalRead += int64(n)
		return n, e
	}
}

func (pr *Processor) processCreateFile(ctx context.Context, operation merger.Operation, operationId string, pg chan int64) error {

	dataTarget, dtOk := model.AsDataSyncTarget(operation.Target())
	dataSource, dsOk := model.AsDataSyncSource(operation.Source())

	localPath := operation.GetRefPath()
	if pr.Locker != nil {
		defer pr.Locker.UnlockFile(operation, localPath)
		pr.Locker.LockFile(operation, localPath, operationId)
	}
	if dtOk && dsOk {

		reader, rErr := dataSource.GetReaderOn(ctx, localPath)
		if rErr != nil {
			pr.Logger().Error("Cannot get reader on source", zap.String("job", "create"), zap.String("path", localPath), zap.Error(rErr))
			return rErr
		}
		defer reader.Close()
		wCtx, cancel := context.WithCancel(ctx)
		writer, writeDone, writeErr, wErr := dataTarget.GetWriterOn(wCtx, localPath, operation.GetNode().GetSize())
		if wErr != nil {
			pr.Logger().Error("Cannot get writer on target", zap.String("job", "create"), zap.String("path", localPath), zap.Error(wErr))
			return wErr
		}
		progressReader := &cancellableReaderWithProgress{
			Reader:   reader,
			pg:       pg,
			canceler: ctx,
		}
		_, err := io.Copy(writer, progressReader)
		if err != nil {
			cancel() // There was an error during copy, properly cancel the Writer
			if progressReader.totalRead > 0 {
				// Revert progress count to 0 for this operation
				pg <- -progressReader.totalRead
			}
		}
		writer.Close()
		if err == nil && writeDone != nil {
			// Wait for real write to be finished
			for {
				select {
				case <-writeDone:
					return nil
				case e := <-writeErr:
					return e
				}
			}
		} else {
			return err
		}

	} else {

		pg <- 1
		update := false
		if operation.Type() == merger.OpUpdateFile || operation.GetNode().GetUuid() != "" {
			update = true
		}
		if operation.Type() == merger.OpCreateFile && strings.HasSuffix(operation.GetNode().GetPath(), common.PydioSyncHiddenFile) {
			if n, e := operation.Source().LoadNode(ctx, operation.GetNode().GetPath()); e == nil {
				log.Logger(ctx).Debug("Reload .pydio Node data to make sure eTag is up-to-date", operation.GetNode().Zap("opNode"), n.Zap("sourceNode"))
				operation.SetNode(n)
			}
		}
		return operation.Target().CreateNode(operation.CreateContext(pr.GlobalContext), operation.GetNode(), update)
	}

}
