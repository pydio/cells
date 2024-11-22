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

package timer

import (
	"context"
	"log"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/jobs"
)

func TestProducer(t *testing.T) {

	Convey("Test Producer", t, func() {

		var events []*jobs.JobTriggerEvent
		testChan := make(chan *jobs.JobTriggerEvent)
		stop := make(chan struct{})
		go func() {
			for {
				select {
				case event := <-testChan:
					events = append(events, event)
				case <-stop:
					return
				}
			}
		}()

		p := NewEventProducer(context.Background())
		p.TestChan = testChan

		// Limited Repeat twice (reminder)
		startTime := time.Now().Format(time.RFC3339)
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R2/" + startTime + "/PT2S",
			},
		})

		log.Println("During 10s: every 2s but should be repeated only twice")
		time.Sleep(10 * time.Second)
		So(len(events), ShouldEqual, 2)
		events = nil

		// Limited Repeat once (reminder)
		startTime = time.Now().Format(time.RFC3339)
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R1/" + startTime + "/PT1S",
			},
		})

		log.Println("During 5s: every 1s but should be sent only once")
		time.Sleep(5 * time.Second)
		So(len(events), ShouldEqual, 1)
		events = nil

		// Limited Repeat once (reminder fixed date)
		startTime = time.Now().Add(time.Second).Format(time.RFC3339)
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R1/" + startTime + "/",
			},
		})

		log.Println("During 5s: every 1s but should be sent only once (fixed date in the future)")
		time.Sleep(5 * time.Second)
		So(len(events), ShouldEqual, 1)
		events = nil

		// Infinite repeat
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R/2015-06-04T19:25:16.828696-07:00/PT4S",
			},
		})

		log.Println("During 15s: every 4s")
		time.Sleep(15 * time.Second)
		So(len(events), ShouldBeBetweenOrEqual, 3, 4)
		events = nil

		// Infinite repeat updated
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R0/2015-06-04T19:25:16.828696-07:00/PT2S",
			},
		})
		log.Println("During 10s : every 2s")

		time.Sleep(10 * time.Second)
		So(len(events), ShouldBeBetweenOrEqual, 4, 5)
		p.StopAll()
		events = nil

		log.Println("Producer is now stopped, no more ticks")
		time.Sleep(10 * time.Second)
		So(len(events), ShouldEqual, 0)
		stop <- struct{}{}

		//pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)

	})
}
