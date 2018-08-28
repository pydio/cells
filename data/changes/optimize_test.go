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

package changes

import (
	"context"
	"fmt"
	"strconv"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
)

type mockChanger []*tree.SyncChange

func (mc mockChanger) Changes() <-chan *tree.SyncChange {
	ch := make(chan *tree.SyncChange)
	go func() {
		defer close(ch)
		for _, change := range mc {
			ch <- change
		}
	}()
	return ch
}

// simply stores sent events in an array
type streamEventCounter struct {
	counter    int
	mockEvents []*tree.SyncChange
	debug      bool
}

func newStreamEventCounter(debug bool) *streamEventCounter {
	mock := streamEventCounter{} // counter: 0 useless
	mock.mockEvents = make([]*tree.SyncChange, 10)
	mock.debug = debug
	return &mock
}

func (s *streamEventCounter) Send(event *tree.SyncChange) error {
	// insure there is no overflow by doubling the size of the array if necessary
	if s.counter == len(s.mockEvents) {
		tmpArray := make([]*tree.SyncChange, len(s.mockEvents)*2)
		//copy everything up to the position
		copy(tmpArray, s.mockEvents[:s.counter-1])
		s.mockEvents = tmpArray
	}
	s.mockEvents[s.counter] = event
	s.counter++
	if s.debug {
		seqStr := strconv.FormatUint(event.GetSeq(), 10)
		fmt.Println("Sending event #" + seqStr)
	}
	return nil
}

func TestStreamOptimizer(t *testing.T) {

	Convey("In a clean context", t, func() {

		ctx := context.Background()

		Convey("Simply test mock", func() {
			var changes mockChanger = []*tree.SyncChange{
				{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_create, Source: "NULL", Target: "/test/alpha"},
				{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
				{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_content, Source: "/test/alpha2", Target: "/test/alpha2"},
			}

			sender := newStreamEventCounter(false)
			err := NewOptimizer(ctx, changes).Output(ctx, sender)
			So(err, ShouldBeNil)
			So(sender.counter, ShouldEqual, 1)
			So(sender.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_create)
			So(sender.mockEvents[0].GetTarget(), ShouldEqual, "/test/alpha2")

		})

		Convey("Test create / delete cancelation", func() {
			var changes mockChanger = []*tree.SyncChange{
				{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_create, Source: "NULL", Target: "/test/alpha"},
				{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_delete, Source: "/test/alpha", Target: "NULL"},
			}

			sender := newStreamEventCounter(false)
			err := NewOptimizer(ctx, changes).Output(ctx, sender)
			So(err, ShouldBeNil)
			So(sender.counter, ShouldEqual, 0)
		})

		Convey("Test flatten strategies", func() {

			Convey("Various moves then delete", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha3"},
					{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_delete, Source: "/test/alpha3", Target: "NULL"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 1)
				So(sender.mockEvents[0].GetSource(), ShouldEqual, "/test/alpha")

			})

			Convey("Various moves", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha3"},
					{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha3", Target: "/test/alpha4"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 1)
				So(sender.mockEvents[0].GetSource(), ShouldEqual, "/test/alpha")
				So(sender.mockEvents[0].GetTarget(), ShouldEqual, "/test/alpha4")
			})

			Convey("Round trip moves", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha3"},
					{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha3", Target: "/test/alpha4"},
					{Seq: 4, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 0)
			})

			Convey("Move, update, move ", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha2"},
					{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha4"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 2)
				So(sender.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_content)
				So(sender.mockEvents[1].GetType(), ShouldEqual, tree.SyncChange_path)
				So(sender.mockEvents[0].GetTarget(), ShouldEqual, "/test/alpha")

			})

			Convey("Move, update, move, update ", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha2"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha2"},
					{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha4"},
					{Seq: 4, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha4"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 2)
				So(sender.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_path)
				So(sender.mockEvents[1].GetType(), ShouldEqual, tree.SyncChange_content)
				So(sender.mockEvents[1].GetTarget(), ShouldEqual, "/test/alpha4")

			})

			Convey("Create, update, move ", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_create, Source: "NULL", Target: "/test/alpha"},
					{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha"},
					{Seq: 8, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 1)
				So(sender.mockEvents[0].GetSource(), ShouldEqual, "NULL")
				So(sender.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_create)
				So(sender.mockEvents[0].GetSeq(), ShouldEqual, uint64(8))
			})

			Convey("Create, move, update", func() {
				var changes mockChanger = []*tree.SyncChange{
					{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_create, Source: "NULL", Target: "/test/alpha"},
					{Seq: 8, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
					{Seq: 13, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha4"},
				}

				sender := newStreamEventCounter(false)
				err := NewOptimizer(ctx, changes).Output(ctx, sender)
				So(err, ShouldBeNil)
				So(sender.counter, ShouldEqual, 1)
				So(sender.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_create)
				So(sender.mockEvents[0].GetSeq(), ShouldEqual, uint64(13))
			})
		})
	})
}

func TestConcurrency(t *testing.T) {

	ctx := context.Background()

	Convey("Test order:", t, func() {
		var changes mockChanger = []*tree.SyncChange{
			{Seq: 1, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 2, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 3, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha"},
			{Seq: 4, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 5, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 6, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 7, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 8, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 9, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha2"},
			{Seq: 10, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha5"},
			{Seq: 11, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha5", Target: "/test/alpha4"},
			{Seq: 12, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 13, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha"},
			{Seq: 14, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 15, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 16, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 17, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 18, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 19, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha2"},
			{Seq: 21, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha2", Target: "/test/alpha4"},
			{Seq: 22, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 23, NodeId: "alpha", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/alpha"},
			{Seq: 24, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 25, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 26, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 27, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha"},
			{Seq: 28, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha", Target: "/test/alpha4"},
			{Seq: 29, NodeId: "alpha", Type: tree.SyncChange_path, Source: "/test/alpha4", Target: "/test/alpha2"},
			{Seq: 113, NodeId: "beta", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/beta"},
			{Seq: 114, NodeId: "beta", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/beta"},
			{Seq: 115, NodeId: "beta", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/beta"},
			{Seq: 116, NodeId: "beta", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/beta"},
			{Seq: 117, NodeId: "beta", Type: tree.SyncChange_content, Source: "NULL", Target: "/test/beta"},
			{Seq: 118, NodeId: "beta", Type: tree.SyncChange_path, Source: "/test/beta", Target: "/test/beta2"},
		}

		sender := newStreamEventCounter(true)
		err := newTestOptimizer(ctx, changes).Output(ctx, sender)
		So(err, ShouldBeNil)
		So(sender.counter, ShouldEqual, 4)
	})

}

// NewOptimizer produces a new StreamOptimizer
func newTestOptimizer(ctx context.Context, c ChangeStreamer) (o *StreamOptimizer) {
	o = new(StreamOptimizer)
	o.changeQ = o.optimizeWithDelay(ctx, c.Changes())
	return
}

func (o StreamOptimizer) optimizeWithDelay(ctx context.Context, chq <-chan *tree.SyncChange) <-chan *tree.SyncChange {
	out := make(chan *tree.SyncChange, 16)

	go func() {
		defer func() { close(out) }()
		for batch := range o.batch(ctx, chq) {
			for ch := range o.flatten(ctx, batch) {
				// Adds a delay to insure events stay in correct order
				if ch.GetSeq() < 100 {
					time.Sleep(time.Millisecond * 100)
				}
				out <- ch
			}
		}
	}()

	return out
}

// TODO check what was the idea of this...

// func TestBufPool(t *testing.T) {
// 	Convey("Test if the size parameter affects the buffer size", t, func() {
// 		Convey("Size=1", func() {
// 			So(len(newBufPool(1)), ShouldEqual, 1)
// 		})

// 		Convey("Size=8", func() {
// 			So(len(newBufPool(8)), ShouldEqual, 8)
// 		})

// 		Convey("Size=1024", func() {
// 			So(len(newBufPool(1024)), ShouldEqual, 1024)
// 		})
// 	})

// 	// Convey("Test buffer IO", t, func() {
// 	// 	bp := newBufPool(1)
// 	// 	var buf ChangeBuffer

// 	// 	Convey("Get ChangeBuffer", func() {
// 	// 		buf = bp.Get() // should not panic
// 	// 		So(len(buf), ShouldEqual, 0)
// 	// 	})

// 	// 	Convey("Put ChangeBuffer", func() {
// 	// 		So(func() { bp.Put(buf) }, ShouldNotPanic)
// 	// 	})
// 	// })
// }
