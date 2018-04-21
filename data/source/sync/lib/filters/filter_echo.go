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

package filters

import (
	"sync"

	"github.com/pydio/cells/data/source/sync/lib/common"
)

type LockEvent struct {
	Source      common.PathSyncSource
	Path        string
	OperationId string
}

type UnlockEvent struct {
	Source common.PathSyncSource
	Path   string
}

type EchoFilter struct {
	sourcesOperations map[common.PathSyncSource]map[string]string
	mapMutex          *sync.Mutex
	LockEvents        chan LockEvent
	UnlockEvents      chan UnlockEvent
}

func (f *EchoFilter) lockFileTo(source common.PathSyncSource, path string, operationId string) {
	var operations map[string]string
	var ok bool
	if operations, ok = f.sourcesOperations[source]; !ok {
		operations = make(map[string]string)
		f.sourcesOperations[source] = operations
	}
	operations[path] = operationId
}

func (f *EchoFilter) unlockFile(source common.PathSyncSource, path string) {
	if operations, ok := f.sourcesOperations[source]; ok {
		delete(operations, path)
		if len(operations) == 0 {
			delete(f.sourcesOperations, source)
		}
	}
}

func (f *EchoFilter) filterEvent(event common.EventInfo) common.EventInfo {

	if operations, ok := f.sourcesOperations[event.PathSyncSource]; ok {
		if value, pOk := operations[event.Path]; pOk {
			event.OperationId = value
			return event
		}
	}
	//log.Printf("No associated operation for event %v - map was %v, source was %v", event, f.sourcesOperations, event.PathSyncSource)
	return event

}

func (f *EchoFilter) ListenLocksEvents() {

	for {
		select {
		case lock := <-f.LockEvents:
			f.mapMutex.Lock()
			f.lockFileTo(lock.Source, lock.Path, lock.OperationId)
			f.mapMutex.Unlock()
		case unlock := <-f.UnlockEvents:
			f.mapMutex.Lock()
			f.unlockFile(unlock.Source, unlock.Path)
			f.mapMutex.Unlock()
		}
	}

}

func (f *EchoFilter) CreateFilter() (in chan common.EventInfo, out chan common.EventInfo) {

	out = make(chan common.EventInfo)
	in = make(chan common.EventInfo)

	go func() {

		defer close(out)
		defer close(in)

		for event := range in {
			if event.OperationId != "" {
				out <- event
				continue
			}
			f.mapMutex.Lock()
			e := f.filterEvent(event)
			//log.Printf("Sending to filter output %v", e)
			out <- e
			f.mapMutex.Unlock()
		}

	}()

	return in, out
}

func NewEchoFilter() (ef *EchoFilter) {
	sourcesOperations := make(map[common.PathSyncSource]map[string]string)
	lockEvents := make(chan LockEvent)
	unlockEvents := make(chan UnlockEvent)

	ef = &EchoFilter{
		sourcesOperations: sourcesOperations,
		LockEvents:        lockEvents,
		UnlockEvents:      unlockEvents,
		mapMutex:          &sync.Mutex{},
	}

	return ef
}
