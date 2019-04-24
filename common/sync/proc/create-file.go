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

package proc

import (
	"io"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

type ProgressReader struct {
	io.Reader
	cursor int64
	pg     chan int64
}

func (pr *ProgressReader) Read(p []byte) (n int, e error) {
	n, e = pr.Reader.Read(p)
	pr.pg <- int64(n)
	return n, e
}

func (pr *Processor) processCreateFile(event *merger.BatchEvent, operationId string, pg chan int64) error {

	dataTarget, dtOk := model.AsDataSyncTarget(event.Target())
	dataSource, dsOk := model.AsDataSyncSource(event.Source())

	localPath := event.EventInfo.Path
	defer pr.unlockFile(event, localPath)
	pr.lockFileTo(event, localPath, operationId)
	if dtOk && dsOk {

		reader, rErr := dataSource.GetReaderOn(localPath)
		if rErr != nil {
			pr.Logger().Error("Cannot get reader on source", zap.String("job", "create"), zap.String("path", localPath), zap.Error(rErr))
			return rErr
		}
		defer reader.Close()
		writer, wErr := dataTarget.GetWriterOn(localPath, event.Node.Size)
		if wErr != nil {
			pr.Logger().Error("Cannot get writer on target", zap.String("job", "create"), zap.String("path", localPath), zap.Error(wErr))
			return wErr
		}
		defer func() {
			writer.Close()
		}()
		_, err := io.Copy(writer, &ProgressReader{Reader: reader, pg: pg})

		return err

	} else {

		pg <- 1
		update := false
		if event.Node.Uuid != "" {
			update = true
		}
		return event.Target().CreateNode(event.EventInfo.CreateContext(pr.GlobalContext), event.Node, update)
	}

}
