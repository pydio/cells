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

	PatchChan       chan merger.Patch
	JobsInterrupt   chan bool
	LocksChan       chan model.LockEvent
	RequeueChannels map[model.PathSyncSource]chan model.EventInfo
}

// NewConnectedProcessor creates a new connected processor
func NewConnectedProcessor(ctx context.Context) *ConnectedProcessor {
	p := &ConnectedProcessor{
		Processor:       *NewProcessor(ctx),
		PatchChan:       make(chan merger.Patch, 1),
		RequeueChannels: make(map[model.PathSyncSource]chan model.EventInfo),
		JobsInterrupt:   make(chan bool),
	}
	p.Connector = p
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
	close(pr.JobsInterrupt)
}

// AddRequeueChannel registers a Requeue chan for a given source
func (pr *ConnectedProcessor) AddRequeueChannel(source model.PathSyncSource, channel chan model.EventInfo) {
	pr.RequeueChannels[source] = channel
}

// ProcessPatches listens to PatchChan for processing
func (pr *ConnectedProcessor) ProcessPatches() {

	for {
		select {
		case patch, open := <-pr.PatchChan:
			if !open {
				pr.Logger().Info("Stop processing patches")
				return
			}
			pr.Process(patch)
		}
	}

}

// Requeue implements Connector func
func (pr *ConnectedProcessor) Requeue(source model.PathSyncSource, event model.EventInfo) {
	if pr.RequeueChannels == nil {
		return
	}
	if c, ok := pr.RequeueChannels[source]; ok {
		c <- event
	}
}

// LockFile implements Connector func
func (pr *ConnectedProcessor) LockFile(operation merger.Operation, path string, operationId string) {
	if source, ok := model.AsPathSyncSource(operation.Target()); pr.LocksChan != nil && ok {
		if source.GetEndpointInfo().SupportsTargetEcho {
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
		if source.GetEndpointInfo().SupportsTargetEcho {
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
