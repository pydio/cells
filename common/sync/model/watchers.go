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

package model

import (
	"context"
	"time"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common/proto/tree"
)

// EventType represents the type of the event occurred.
type EventType string

const (
	// EventCreate notifies when a new object is created
	EventCreate EventType = "ObjectCreated"
	// EventRename notifies when a new object is renamed
	EventRename EventType = "ObjectRenamed"
	// EventRemove notifies when a new object is deleted
	EventRemove EventType = "ObjectRemoved"
	// EventAccessed notifies when an object is accessed.
	EventAccessed EventType = "ObjectAccessed"
	// EventAccessedRead notifies when an object is accessed (specifically read).
	EventAccessedRead EventType = "ObjectAccessed:Read"
	// EventAccessedStat notifies when an object is accessed (specifically stat).
	EventAccessedStat EventType = "ObjectAccessed:Stat"
	// EventOther notifies any other events
	EventOther EventType = "ObjectOther"
	// EventOther notifies any other events
	EventSureMove EventType = "NodeMoved"
)

// EventInfo contains the information of the event that occurred and the source
// IP:PORT of the client which triggerred the event.
type EventInfo struct {
	Time           string
	Size           int64
	Etag           string
	Folder         bool
	Path           string
	Source         PathSyncSource
	Type           EventType
	Host           string
	Port           string
	UserAgent      string
	OperationId    string
	ScanEvent      bool
	ScanSourceNode *tree.Node
	Metadata       map[string]string
	MoveSource     *tree.Node
	MoveTarget     *tree.Node
}

func (e EventInfo) CreateContext(ctx context.Context) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	if e.Metadata == nil {
		return ctx
	} else {
		return metadata.NewContext(ctx, e.Metadata)
	}
}

type WatchObject struct {
	// eventInfo will be put on this chan
	EventInfoChan chan EventInfo
	// errors will be put on this chan
	ErrorChan chan error
	// will stop the watcher goroutines
	DoneChan chan bool
}

// NextEvent pops the next event from the EventInfoChan
func (w WatchObject) NextEvent() EventInfo {
	return <-w.EventInfoChan
}

// NextError pops the next error from the ErrorChan
func (w WatchObject) NextError() error {
	return <-w.ErrorChan
}

// Done returns a channel that unblocks when Close has been
// called
func (w WatchObject) Done() <-chan bool { return w.DoneChan }

// Events returns the chan receiving events
func (w *WatchObject) Events() chan EventInfo {
	return w.EventInfoChan
}

// Errors returns the chan receiving errors
func (w *WatchObject) Errors() chan error {
	return w.ErrorChan
}

// Close the watcher, will stop all goroutines
func (w *WatchObject) Close() {
	close(w.DoneChan)
}

func NodeToEventInfo(ctx context.Context, path string, node *tree.Node, eventType EventType) (eventInfo EventInfo) {
	timeFormatFS := "2006-01-02T15:04:05.000Z"
	eventInfo = EventInfo{
		Time:           time.Now().UTC().Format(timeFormatFS),
		Folder:         !node.IsLeaf(),
		Path:           path,
		Type:           eventType,
		ScanEvent:      true,
		ScanSourceNode: node,
		Metadata:       make(map[string]string),
	}
	if ctx != nil {
		if meta, ok := metadata.FromContext(ctx); ok {
			eventInfo.Metadata = meta
		}
	}
	return eventInfo
}
