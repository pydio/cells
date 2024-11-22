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

package filesystem

import (
	"sync"
	"testing"

	"github.com/rjeczalik/notify"

	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

func TestIsEventType(t *testing.T) {

	Convey("Testing events", t, func() {
		So(isEventType(EventTypeCreate, notify.Create), ShouldBeTrue)
		So(isEventType(EventTypePut, notify.Rename), ShouldBeTrue)
		So(isEventType(EventTypePut, notify.Write), ShouldBeTrue)
		So(isEventType(EventTypeCreate, notify.Remove), ShouldBeFalse)
	})

}

func TestEventInfoCreation(t *testing.T) {

	Convey("Test EventType Create", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path:  "/file",
			event: notify.Create,
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(eventInfo.Path, ShouldEqual, "file")
		So(eventInfo.Folder, ShouldBeFalse)
		So(eventInfo.Type, ShouldEqual, model.EventCreate)

	})

	Convey("Test EventType Create - Ignore Not Existing", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path:  "/file1",
			event: notify.Create,
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldResemble, model.EventInfo{})
		So(err, ShouldBeNil)

	})

	Convey("Test EventType Write", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path:  "/file",
			event: notify.Write,
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(eventInfo.Path, ShouldEqual, "file")
		So(eventInfo.Folder, ShouldBeFalse)
		So(eventInfo.Type, ShouldEqual, model.EventCreate)

	})

	Convey("Test EventType Remove", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path:  "/file-removed",
			event: notify.Remove,
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(eventInfo.Path, ShouldEqual, "file-removed")
		So(eventInfo.Folder, ShouldBeFalse)
		So(eventInfo.Type, ShouldEqual, model.EventRemove)

	})

	Convey("Test EventType Rename", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path:  "/file",
			event: notify.Rename,
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(eventInfo.Path, ShouldEqual, "file")
		So(eventInfo.Folder, ShouldBeFalse)
		So(eventInfo.Type, ShouldEqual, model.EventRename)

	})

	Convey("Test EventType Unknown", t, func() {

		c := FilledMockedClient()
		source := &MockEventInfo{
			path: "/file",
		}
		eventInfo, err := notifyEventToEventInfo(c, source)
		So(eventInfo, ShouldResemble, model.EventInfo{})
		So(err, ShouldBeNil)

	})

}

func TestPipeChan(t *testing.T) {

	Convey("Test PipeChan Buffering", t, func() {

		var batch []notify.EventInfo
		eventsNumber := 1000

		in, out := PipeChan(100)

		wg := sync.WaitGroup{}
		wg.Add(2)

		go func() {
			defer wg.Done()
			i := 0
			for event := range out {
				batch = append(batch, event)
				i++
				if i == eventsNumber {
					return
				}
			}
		}()

		go func() {
			defer wg.Done()
			defer close(in)
			for i := 0; i < eventsNumber; i++ {
				source := &MockEventInfo{
					path:  "file",
					event: notify.Write,
				}
				in <- source
			}
		}()

		wg.Wait()

		So(batch, ShouldHaveLength, eventsNumber)

	})

}
