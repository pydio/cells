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

package task

import (
	"context"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

// startGoroutineAlive reports whether the delayed "connected" goroutine spawned by Start is still running.
func startGoroutineAlive() bool {
	buf := make([]byte, 1<<20)
	return strings.Contains(string(buf[:runtime.Stack(buf, true)]), "task.(*Sync).Start.func")
}

func TestShutdownRightAfterStartWithoutWatches(t *testing.T) {
	defer timings.ForTests()()

	Convey("Shutdown within the connected delay of a Start without watchers must not panic nor leak", t, func() {
		left, right := memory.NewMemDB(), memory.NewMemDB()
		left.SetTestPathURI("left")
		right.SetTestPathURI("right")
		s := NewSync(left, right, model.DirectionBi)
		events := make(chan interface{}, 10)
		s.SetupEventsChan(make(chan model.Status, 10), make(chan interface{}, 1), events)

		s.Start(context.Background(), false)
		s.Shutdown()
		So(s.watchConn, ShouldBeNil)

		<-time.After(5 * timings.StartConnectedDelay.Get())
		So(startGoroutineAlive(), ShouldBeFalse)
	})

	Convey("Without Shutdown, Start still reports both endpoints as connected", t, func() {
		left, right := memory.NewMemDB(), memory.NewMemDB()
		left.SetTestPathURI("left")
		right.SetTestPathURI("right")
		s := NewSync(left, right, model.DirectionBi)
		events := make(chan interface{}, 10)
		s.SetupEventsChan(make(chan model.Status, 10), make(chan interface{}, 1), events)

		s.Start(context.Background(), false)
		var connected []string
		for len(connected) < 2 {
			select {
			case e := <-events:
				st := e.(*model.EndpointStatus)
				So(st.WatchConnection, ShouldEqual, model.WatchConnected)
				connected = append(connected, st.EndpointInfo.URI)
			case <-time.After(5 * time.Second):
				t.Fatal("timeout waiting for connected events")
			}
		}
		So(connected, ShouldResemble, []string{left.GetEndpointInfo().URI, right.GetEndpointInfo().URI})
		s.Shutdown()
	})
}
