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

package filters

import (
	"context"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// EchoFilter tries to detect events that are linked to an operation that has
// just been performed by a processor. It listen to two Lock and Unlock events channels
// to maintain an internal list of events that have been performed. It's the mission of
// the processor to actually unlock after a given time.
type EchoFilter struct {
	sync.Mutex
	sources   map[model.PathSyncSource]map[string]string
	locksChan chan model.LockEvent
}

// NewEchoFilter creates a new EchoFilter
func NewEchoFilter() *EchoFilter {
	e := &EchoFilter{
		sources:   make(map[model.PathSyncSource]map[string]string),
		locksChan: make(chan model.LockEvent),
	}
	//go e.listenLocks()
	return e
}

func (f *EchoFilter) GetLocksChan() chan model.LockEvent {
	return f.locksChan
}

func (f *EchoFilter) Start() {
	go f.listenLocks()
}

func (f *EchoFilter) Stop() {
	close(f.locksChan)
}

func (f *EchoFilter) Pipe(in chan model.EventInfo) (out chan model.EventInfo) {

	out = make(chan model.EventInfo)

	go func() {
		defer close(out)
		for event := range in {
			if event.OperationId != "" {
				out <- event
				continue
			}
			f.Lock()
			e := f.filterEvent(event)
			out <- e
			f.Unlock()
		}
	}()

	return out
}

func (f *EchoFilter) listenLocks() {

	for lock := range f.locksChan {
		f.Lock()
		if lock.Type == model.LockEventLock {
			f.lockFileTo(lock.Source, lock.Path, lock.OperationId)
		} else {
			f.unlockFile(lock.Source, lock.Path)
		}
		f.Unlock()
	}

}

func (f *EchoFilter) lockFileTo(source model.PathSyncSource, path string, operationId string) {
	log.Logger(context.Background()).Debug("Locking File "+path, zap.String("source", source.GetEndpointInfo().URI))
	var operations map[string]string
	var ok bool
	if operations, ok = f.sources[source]; !ok {
		operations = make(map[string]string)
		f.sources[source] = operations
	}
	operations[path] = operationId
}

func (f *EchoFilter) unlockFile(source model.PathSyncSource, path string) {
	if operations, ok := f.sources[source]; ok {
		log.Logger(context.Background()).Debug("Unlocking File "+path, zap.String("source", source.GetEndpointInfo().URI))
		delete(operations, path)
		if len(operations) == 0 {
			delete(f.sources, source)
		}
	}
}

func (f *EchoFilter) filterEvent(event model.EventInfo) model.EventInfo {

	if operations, ok := f.sources[event.Source]; ok {
		if value, pOk := operations[event.Path]; pOk {
			event.OperationId = value
			log.Logger(context.Background()).Debug("Filter Event - Setting OperationId on event " + event.Path + " and unlocking")
			delete(operations, event.Path)
			if len(operations) == 0 {
				delete(f.sources, event.Source)
			}
			return event
		}
	}
	return event

}
