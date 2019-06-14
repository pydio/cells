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
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/common"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// EventsBatcher will batch incoming events and process them after a certain idle time.
// If incoming events have a SessionUuid, events are batched separately in-memory and processed
// once a close-session event is received
type EventsBatcher struct {
	Source        model.PathSyncSource
	Target        model.PathSyncTarget
	globalContext context.Context

	batchCacheMutex *sync.Mutex
	batchCache      map[string][]model.EventInfo

	patches          chan merger.Patch
	closeSessionChan chan string
	statuses         chan merger.ProcessStatus
	done             chan interface{}
	debounce         time.Duration
}

// NewEventsBatcher creates a new EventsBatcher
func NewEventsBatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget, statuses chan merger.ProcessStatus, done chan interface{}, debounce ...time.Duration) *EventsBatcher {

	b := &EventsBatcher{
		Source:        source,
		Target:        target,
		globalContext: ctx,

		batchCache:      make(map[string][]model.EventInfo),
		batchCacheMutex: &sync.Mutex{},

		closeSessionChan: make(chan string, 1),
		statuses:         statuses,
		done:             done,
	}
	if len(debounce) > 0 {
		b.debounce = debounce[0]
	} else {
		b.debounce = 1 * time.Second
	}

	return b
}

// Batch starts processing incoming events and turn them into Patch
func (ev *EventsBatcher) Batch(in chan model.EventInfo, out chan merger.Patch) {
	ev.patches = out
	go ev.batchEvents(in)
}

// ForceCloseSession makes sure an in-memory session is always flushed
func (ev *EventsBatcher) ForceCloseSession(sessionUuid string) {
	ev.closeSessionChan <- sessionUuid
}

func (ev *EventsBatcher) batchEvents(in chan model.EventInfo) {

	var batch []model.EventInfo

	for {
		select {
		case event, ok := <-in:
			if !ok {
				return
			}
			// Add to queue
			if session := event.Metadata[common.XPydioSessionUuid]; session != "" {
				if strings.HasPrefix(session, "close-") {
					session = strings.TrimPrefix(session, "close-")

					ev.batchCacheMutex.Lock()
					ev.batchCache[session] = append(ev.batchCache[session], event)
					log.Logger(ev.globalContext).Debug("[batcher] Processing session")
					go ev.processEvents(ev.batchCache[session])
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
				go ev.processEvents(events)
				delete(ev.batchCache, session)
			}
			ev.batchCacheMutex.Unlock()
		case <-time.After(ev.debounce):
			// Process Queue
			if len(batch) > 0 {
				log.Logger(ev.globalContext).Debug("[batcher] Processing batch after timeout")
				go ev.processEvents(batch)
				batch = nil
			}
		}

	}

}

func (ev *EventsBatcher) processEvents(events []model.EventInfo) {

	log.Logger(ev.globalContext).Debug("Processing Events Now", zap.Int("count", len(events)))
	patch := merger.NewPatch(ev.Source, ev.Target, merger.PatchOptions{MoveDetection: true})
	patch.SetupChannels(ev.statuses, ev.done)

	if p, o := model.AsSessionProvider(ev.Target); o && len(events) > 40 {
		patch.SetSessionProvider(events[0].CreateContext(ev.globalContext), p, false)
	}

	for _, event := range events {
		log.Logger(ev.globalContext).Debug("[batcher]", zap.Any("type", event.Type), zap.Any("path", event.Path), zap.Any("sourceNode", event.ScanSourceNode))

		var t merger.OperationType
		switch event.Type {
		case model.EventCreate, model.EventRename:
			if event.Folder {
				t = merger.OpCreateFolder
			} else {
				t = merger.OpCreateFile
			}
		case model.EventSureMove:
			event.Path = event.MoveTarget.Path
			if event.MoveSource.IsLeaf() {
				t = merger.OpMoveFile
			} else {
				t = merger.OpMoveFolder
			}
		default:
			t = merger.OpDelete
		}

		operation := merger.NewOperation(t, event)
		if event.Type == model.EventSureMove {
			operation.SetNode(event.MoveSource)
		}
		patch.Enqueue(operation)

	}

	patch.Filter(ev.globalContext)
	if patch.Size() > 0 {
		log.Logger(ev.globalContext).Info("****** Sending Patch from Events", zap.Any("stats", patch.Stats()))
	}
	if updater, ok := patch.Source().(model.SnapshotUpdater); ok {
		updater.PatchUpdateSnapshot(ev.globalContext, patch)
	}

	ev.patches <- patch

}
