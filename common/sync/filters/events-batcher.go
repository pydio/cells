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

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
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
	ignores       []glob.Glob

	batchCacheMutex *sync.Mutex
	batchCache      map[string][]model.EventInfo

	patches          chan merger.Patch
	closeSessionChan chan string
	debounce         time.Duration

	// Will be passed along to new patches
	statuses chan model.Status
	done     chan interface{}
	cmd      *model.Command

	// Monitor batcher activity (receiving events)
	active       bool
	activeChan   chan bool
	activeDone   chan bool
	epStatusChan chan *model.EndpointStatus
}

// NewEventsBatcher creates a new EventsBatcher
func NewEventsBatcher(ctx context.Context, source model.PathSyncSource, target model.PathSyncTarget, ignores []glob.Glob, debounce ...time.Duration) *EventsBatcher {

	b := &EventsBatcher{
		Source:        source,
		Target:        target,
		ignores:       ignores,
		globalContext: ctx,

		batchCache:      make(map[string][]model.EventInfo),
		batchCacheMutex: &sync.Mutex{},

		activeChan:       make(chan bool),
		activeDone:       make(chan bool),
		closeSessionChan: make(chan string, 1),
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
	go ev.MonitorActivity()
	go ev.batchEvents(in)
}

func (ev *EventsBatcher) MonitorActivity() {
	defer func() {
		close(ev.activeChan)
	}()
	for {
		select {
		case <-ev.activeChan:
			ev.setActivity(true)
		case <-time.After(500 * time.Millisecond):
			ev.setActivity(false)
		case <-ev.activeDone:
			return
		}
	}
}

func (ev *EventsBatcher) notifyActive() {
	ev.activeChan <- true
}

func (ev *EventsBatcher) setActivity(active bool) {
	if ev.active == active {
		return
	}
	log.Logger(ev.globalContext).Debug("Updating watcher activity", zap.Bool("active", active))
	ev.active = active
	if ev.epStatusChan != nil {
		if active {
			ev.epStatusChan <- &model.EndpointStatus{
				EndpointInfo:    ev.Source.GetEndpointInfo(),
				WatchConnection: model.WatchActive,
			}
		} else {
			ev.epStatusChan <- &model.EndpointStatus{
				EndpointInfo:    ev.Source.GetEndpointInfo(),
				WatchConnection: model.WatchIdle,
			}
		}
	}
}

// ForceCloseSession makes sure an in-memory session is always flushed
func (ev *EventsBatcher) ForceCloseSession(sessionUuid string) {
	ev.closeSessionChan <- sessionUuid
}

func (ev *EventsBatcher) batchEvents(in chan model.EventInfo) {

	defer func() {
		// on close, also close activity monitoring
		close(ev.activeDone)
	}()
	var batch []model.EventInfo

	for {
		select {
		case event, ok := <-in:
			if !ok {
				return
			}
			if model.IsIgnoredFile(event.Path, ev.ignores...) {
				log.Logger(ev.globalContext).Debug("Ignoring event for path " + event.Path)
				break
			}
			// Add to queue
			if session := event.Metadata[common.XPydioSessionUuid]; session != "" {
				if strings.HasPrefix(session, common.SyncSessionClose_) {
					session = strings.TrimPrefix(session, common.SyncSessionClose_)
					ev.batchCacheMutex.Lock()
					ev.batchCache[session] = append(ev.batchCache[session], event)
					log.Logger(ev.globalContext).Debug("[batcher] Processing session")
					go ev.processEvents(ev.batchCache[session], session)
					delete(ev.batchCache, session)
					ev.batchCacheMutex.Unlock()
				} else {
					ev.batchCacheMutex.Lock()
					log.Logger(ev.globalContext).Debug("[batcher] Batching Event in session "+session, zap.Any("e", event))
					ev.batchCache[session] = append(ev.batchCache[session], event)
					ev.batchCacheMutex.Unlock()
				}
				ev.notifyActive()
			} else if event.ScanEvent || event.OperationId == "" {
				log.Logger(ev.globalContext).Debug("[batcher] Batching Event without session ", zap.Any("e", event))
				batch = append(batch, event)
				ev.notifyActive()
			}
		case session := <-ev.closeSessionChan:
			ev.batchCacheMutex.Lock()
			if events, ok := ev.batchCache[session]; ok {
				log.Logger(ev.globalContext).Debug("[batcher] Force closing session now!")
				go ev.processEvents(events, session)
				delete(ev.batchCache, session)
			}
			ev.batchCacheMutex.Unlock()
		case <-time.After(ev.debounce):
			// Process Queue
			if len(batch) > 0 {
				log.Logger(ev.globalContext).Info("[batcher] Processing batch after timeout")
				go ev.processEvents(batch, "")
				batch = nil
			}
		}

	}

}

func (ev *EventsBatcher) processEvents(events []model.EventInfo, batchSession string) {

	log.Logger(ev.globalContext).Debug("Processing Events Now", zap.Int("count", len(events)))
	patch := merger.NewPatch(ev.Source, ev.Target, merger.PatchOptions{MoveDetection: true})
	patch.SetupChannels(ev.statuses, ev.done, ev.cmd)
	// Copy/Move Cases
	if batchSession != "" {
		// This is triggered by copy sessions only
		if strings.HasPrefix(batchSession, common.SyncSessionPrefixCopy) {
			patch.SetSessionData(events[0].CreateContext(ev.globalContext), false)
		}
		patch.SetLockSessionData(events[0].CreateContext(ev.globalContext), batchSession)
	} else if len(events) > 10 {
		patch.SetSessionData(events[0].CreateContext(ev.globalContext), false)
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

	patch.PostFilter(func() error {
		if updater, ok := patch.Source().(model.SnapshotUpdater); ok && patch.Size() > 0 {
			log.Logger(ev.globalContext).Debug("[batcher] PatchUpdating Snapshot")
			updater.PatchUpdateSnapshot(ev.globalContext, patch)
			log.Logger(ev.globalContext).Info("[batcher] PatchUpdating Snapshot - Done")
		}
		return nil
	})

	ev.patches <- patch

}

func (ev *EventsBatcher) SetupChannels(status chan model.Status, done chan interface{}, cmd *model.Command) {
	ev.statuses = status
	ev.done = done
	ev.cmd = cmd
}

func (ev *EventsBatcher) SetEndpointStatusChan(c chan *model.EndpointStatus) {
	ev.epStatusChan = c
}

func (ev *EventsBatcher) Status(s model.Status) {
	// do nothing
}

func (ev *EventsBatcher) Done(info interface{}) {
	// do nothing
}
