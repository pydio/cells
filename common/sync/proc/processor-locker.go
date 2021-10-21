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
	"time"

	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// ConnectedProcessor is an extended flavour of Processor that listens to a PatchChan and sends LockEvents and Requeue Scan Events
type ConnectedProcessor struct {
	Processor

	PatchChan chan merger.Patch
	LocksChan chan model.LockEvent
	Cmd       *model.Command
}

// NewConnectedProcessor creates a new connected processor
func NewConnectedProcessor(ctx context.Context, cmd *model.Command) *ConnectedProcessor {
	p := &ConnectedProcessor{
		Processor: *NewProcessor(ctx),
		PatchChan: make(chan merger.Patch, 1),
		Cmd:       cmd,
	}
	p.Locker = p
	return p
}

// SetLocksChan sets the locks event channel
func (pr *ConnectedProcessor) SetLocksChan(locks chan model.LockEvent) {
	pr.LocksChan = locks
}

// Start starts listening for Patch channel
func (pr *ConnectedProcessor) Start() {
	go pr.ProcessPatches()
}

// Stop closes Patch Channel and Interrupt Channel
func (pr *ConnectedProcessor) Stop() {
	close(pr.PatchChan)
}

// ProcessPatches listens to PatchChan for processing
func (pr *ConnectedProcessor) ProcessPatches() {

	for patch := range pr.PatchChan {
		pr.Process(patch, pr.Cmd)
	}
	pr.Logger().Info("Stop processing patches")

}

// LockFile implements Connector func
func (pr *ConnectedProcessor) LockFile(operation merger.Operation, path string, operationId string) {
	if source, ok := model.AsPathSyncSource(operation.Target()); pr.LocksChan != nil && ok {
		if source.GetEndpointInfo().IsAsynchronous {
			return // no lock needed, do nothing
		}
		pr.LocksChan <- model.LockEvent{
			Type:        model.LockEventLock,
			Source:      source,
			Path:        path,
			OperationId: operationId,
		}
	}
}

// UnlockFile implements Connector func
func (pr *ConnectedProcessor) UnlockFile(operation merger.Operation, path string) {
	if source, castOk := model.AsPathSyncSource(operation.Target()); castOk && pr.LocksChan != nil {
		if source.GetEndpointInfo().IsAsynchronous {
			return // no lock needed, do nothing
		}
		d := 2 * time.Second
		if source.GetEndpointInfo().EchoTime > 0 {
			d = source.GetEndpointInfo().EchoTime
		}
		go func() {
			<-time.After(d)
			pr.LocksChan <- model.LockEvent{
				Type:   model.LockEventUnlock,
				Source: source,
				Path:   path,
			}
		}()
	}
}
