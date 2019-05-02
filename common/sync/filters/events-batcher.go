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
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

type EventsBatcher struct {
	Source        model.PathSyncSource
	Target        model.PathSyncTarget
	globalContext context.Context

	batchCacheMutex *sync.Mutex
	batchCache      map[string][]model.EventInfo

	batchOut         chan merger.Patch
	eventChannels    []chan model.ProcessorEvent
	closeSessionChan chan string
	batchesStatus    chan merger.ProcessStatus
	batchesDone      chan interface{}
}

func (ev *EventsBatcher) RegisterEventChannel(out chan model.ProcessorEvent) {
	ev.eventChannels = append(ev.eventChannels, out)
}

func (ev *EventsBatcher) sendEvent(event model.ProcessorEvent) {
	for _, channel := range ev.eventChannels {
		channel <- event
	}
}

func (ev *EventsBatcher) FilterPatch(patch merger.Patch) {

	ev.sendEvent(model.ProcessorEvent{
		Type: "filter:start",
		Data: patch,
	})
	patch.Filter(ev.globalContext)
	ev.sendEvent(model.ProcessorEvent{
		Type: "filter:end",
		Data: patch,
	})
}

func (ev *EventsBatcher) ProcessEvents(events []model.EventInfo, asSession bool) {

	log.Logger(ev.globalContext).Debug("Processing Events Now", zap.Int("count", len(events)))
	patch := merger.NewPatch(ev.Source, ev.Target)
	patch.SetupChannels(ev.batchesStatus, ev.batchesDone)
	/*
		if p, o := common.AsSessionProvider(ev.Target); o && asSession && len(events) > 30 {
			patch.sessionProvider = p
			patch.sessionProviderContext = events[0].CreateContext(ev.globalContext)
		}
	*/

	for _, event := range events {
		log.Logger(ev.globalContext).Debug("[batcher]", zap.Any("type", event.Type), zap.Any("path", event.Path), zap.Any("sourceNode", event.ScanSourceNode))
		key := event.Path
		var bEvent = &merger.Operation{
			Patch:     patch,
			Key:       key,
			EventInfo: event,
		}
		if event.Type == model.EventCreate || event.Type == model.EventRename {
			if event.Folder {
				bEvent.Type = merger.OpCreateFolder
			} else {
				bEvent.Type = merger.OpCreateFile
			}
			patch.Enqueue(bEvent)

		} else if event.Type == model.EventSureMove {
			event.Path = event.MoveTarget.Path
			bEvent.Node = event.MoveSource
			if event.MoveSource.IsLeaf() {
				bEvent.Type = merger.OpMoveFile
			} else {
				bEvent.Type = merger.OpMoveFolder
			}
			patch.Enqueue(bEvent, event.Path)
		} else {
			bEvent.Type = merger.OpDelete
			patch.Enqueue(bEvent)
		}
	}

	ev.sendEvent(model.ProcessorEvent{
		Type: "filter:start",
		Data: patch,
	})
	patch.Filter(ev.globalContext)
	ev.sendEvent(model.ProcessorEvent{
		Type: "filter:end",
		Data: patch,
	})

	if patch.Size() > 0 {
		log.Logger(ev.globalContext).Info("****** Sending Patch from Events")
		fmt.Println(patch)
	}

	ev.batchOut <- patch

}

func (ev *EventsBatcher) BatchEvents(in chan model.EventInfo, out chan merger.Patch, duration time.Duration) {

	ev.batchOut = out
	var batch []model.EventInfo

	for {
		select {
		case event := <-in:
			//log.Logger(ev.globalContext).Info("Received S3 Event", zap.Any("e", event))
			// Add to queue
			if session := event.Metadata["X-Pydio-Session"]; session != "" {
				if strings.HasPrefix(session, "close-") {
					session = strings.TrimPrefix(session, "close-")

					ev.batchCacheMutex.Lock()
					ev.batchCache[session] = append(ev.batchCache[session], event)
					log.Logger(ev.globalContext).Debug("[batcher] Processing session")
					go ev.ProcessEvents(ev.batchCache[session], true)
					delete(ev.batchCache, session)
					ev.batchCacheMutex.Unlock()
				} else {
					ev.batchCacheMutex.Lock()
					log.Logger(ev.globalContext).Debug("[batcher] Batching Event in session "+session, zap.Any("e", event))
					ev.batchCache[session] = append(ev.batchCache[session], event)
					ev.batchCacheMutex.Unlock()
				}
			} else if event.ScanEvent || event.OperationId == "" {
				log.Logger(ev.globalContext).Debug("[batcher] Batching Event without session ", zap.Any("e", event))
				batch = append(batch, event)
			}
		case session := <-ev.closeSessionChan:
			ev.batchCacheMutex.Lock()
			if events, ok := ev.batchCache[session]; ok {
				log.Logger(ev.globalContext).Debug("[batcher] Force closing session now!")
				go ev.ProcessEvents(events, true)
				delete(ev.batchCache, session)
			}
			ev.batchCacheMutex.Unlock()
		case <-time.After(duration):
			// Process Queue
			if len(batch) > 0 {
				log.Logger(ev.globalContext).Debug("[batcher] Processing batch after timeout")
				go ev.ProcessEvents(batch, false)
				batch = nil
			}
		}

	}

}

func (ev *EventsBatcher) ForceCloseSession(sessionUuid string) {
	ev.closeSessionChan <- sessionUuid
}

func NewEventsBatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget, batchesStatus chan merger.ProcessStatus, batchesDone chan interface{},
) *EventsBatcher {

	return &EventsBatcher{
		Source:           source,
		Target:           target,
		globalContext:    ctx,
		batchCache:       make(map[string][]model.EventInfo),
		batchCacheMutex:  &sync.Mutex{},
		closeSessionChan: make(chan string, 1),
		batchesStatus:    batchesStatus,
		batchesDone:      batchesDone,
	}

}
