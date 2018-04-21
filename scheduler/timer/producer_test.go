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

	"github.com/pydio/cells/common/proto/jobs"
)

func TestProducer(t *testing.T) {

	Convey("Test Producer", t, func() {

		p := NewEventProducer(context.Background())
		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R2/2015-06-04T19:25:16.828696-07:00/PT4S",
			},
		})

		log.Println("During 15s: every 4s")
		time.Sleep(15 * time.Second)

		p.StartOrUpdateJob(&jobs.Job{
			ID: "fake-id",
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R0/2015-06-04T19:25:16.828696-07:00/PT2S",
			},
		})
		log.Println("During 10s : every 2s")

		time.Sleep(10 * time.Second)
		p.StopAll()

		log.Println("Producer is now stopped, no more ticks")
		time.Sleep(10 * time.Second)

	})
}
