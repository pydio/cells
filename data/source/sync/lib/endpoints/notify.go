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

package endpoints

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/rjeczalik/notify"
)

var (
	// EventTypePut contains the notify events that will cause a put (writer)
	EventTypeAll = []notify.Event{notify.All}
	// EventTypePut contains the notify events that will cause a put (writer)
	EventTypePut = []notify.Event{notify.Create, notify.Write, notify.Rename}
	// EventTypePut contains the notify events that will cause a put (writer)
	EventTypeCreate = []notify.Event{notify.Create}
	// EventTypePut contains the notify events that will cause a put (writer)
	EventTypeWrite = []notify.Event{notify.Write}
	// EventTypePut contains the notify events that will cause a put (writer)
	EventTypeRename = []notify.Event{notify.Rename}
	// EventTypeDelete contains the notify events that will cause a delete (remove)
	EventTypeDelete = []notify.Event{notify.Remove}
	// EventTypeGet contains the notify events that will cause a get (read)
	EventTypeGet = []notify.Event{} // On macOS, FreeBSD, Solaris this is not available.

)

// PipeChan builds a new dynamically sized channel
func PipeChan(capacity int) (inputCh chan notify.EventInfo, outputCh chan notify.EventInfo) {

	// A set of channels which store all elements received from input
	channels := make(chan chan notify.EventInfo, 1000)

	inputCh = make(chan notify.EventInfo, capacity)

	// A goroutine which receives elements from inputCh and creates
	// new channels when needed.
	go func() {
		// Create the first channel
		currCh := make(chan notify.EventInfo, capacity)
		channels <- currCh

		for elem := range inputCh {
			// Prepare next channel with a double capacity when
			// half of the current channel is already filled.
			if len(currCh) >= cap(currCh)/2 {
				close(currCh)
				currCh = make(chan notify.EventInfo, cap(currCh)*2)
				channels <- currCh
			}
			// Prepare next channel with half capacity when
			// current channel is 1/4 filled
			if len(currCh) >= capacity && len(currCh) <= cap(currCh)/4 {
				close(currCh)
				currCh = make(chan notify.EventInfo, cap(currCh)/2)
				channels <- currCh
			}
			// Send element to current channel
			currCh <- elem
		}

		close(currCh)
		close(channels)
	}()

	// Copy elements from infinite channel set to the output
	outputCh = make(chan notify.EventInfo, capacity)
	go func() {
		for {
			currCh, ok := <-channels
			if !ok {
				break
			}
			for v := range currCh {
				outputCh <- v
			}
		}
		close(outputCh)
	}()
	return inputCh, outputCh
}

// Get current time in a predefined format
func now() string {
	TimeFormatFS := "2006-01-02T15:04:05.000Z"
	return time.Now().UTC().Format(TimeFormatFS)
}

// IsEventType checks if the event is of a certain type
func isEventType(eventType []notify.Event, event notify.Event) bool {
	for _, ev := range eventType {
		if event&ev != 0 {
			return true
		}
	}
	return false
}

// Transform an OS notify event to a standard pydio EventInfo
func notifyEventToEventInfo(c *FSClient, event notify.EventInfo) (eventInfo common.EventInfo, err error) {

	var i os.FileInfo
	var empty common.EventInfo
	eventPath := strings.TrimPrefix(CanonicalPath(event.Path()), c.RootPath)
	normalizedPath := c.normalize(eventPath)
	if isEventType(EventTypeCreate, event.Event()) || isEventType(EventTypeWrite, event.Event()) {

		var e error
		i, e = c.FS.Stat(eventPath)
		if e != nil {
			if os.IsNotExist(e) {
				log.Println("Ignoring Create/Write event on non-existing file")
				return empty, nil
			}
			return empty, e
		}
		return common.EventInfo{
			Time:           now(),
			Size:           i.Size(),
			Folder:         i.IsDir(),
			Path:           normalizedPath,
			Type:           common.EventCreate,
			PathSyncSource: c,
		}, nil

	} else if isEventType(EventTypeRename, event.Event()) {

		var e error
		i, e = c.FS.Stat(eventPath)
		if e != nil {
			if os.IsNotExist(e) {
				return common.EventInfo{
					Time:           now(),
					Path:           normalizedPath,
					Type:           common.EventRemove,
					PathSyncSource: c,
				}, nil
			}
			return empty, e
		}
		return common.EventInfo{
			Time:           now(),
			Size:           i.Size(),
			Folder:         i.IsDir(),
			Path:           normalizedPath,
			Type:           common.EventRename,
			PathSyncSource: c,
		}, nil

	} else if isEventType(EventTypeDelete, event.Event()) {

		return common.EventInfo{
			Time:           now(),
			Path:           normalizedPath,
			Type:           common.EventRemove,
			PathSyncSource: c,
		}, nil
	} else {
		// Ignore other events
		return empty, nil
	}

}
