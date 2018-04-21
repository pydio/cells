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
	"strconv"
	"strings"
	"time"

	"github.com/ajvb/kala/utils/iso8601"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/jobs"
)

// ScheduleWaiter provides an easy way to execute a job at given times (like a cron job).
type ScheduleWaiter struct {
	*jobs.Schedule
	jobId    string
	ticker   chan *jobs.JobTriggerEvent
	stopChan chan bool

	// Number of repetitions: if 0, infinite repetition.
	repeat int64
	// Do not start until that time
	startTime time.Time
	// Interval between each repetition
	interval time.Duration

	lastTick time.Time
}

// NewScheduleWaiter creates a new waiter that sends start events for this job on the given schedule
func NewScheduleWaiter(jobId string, schedule *jobs.Schedule, tickerChannel chan *jobs.JobTriggerEvent) *ScheduleWaiter {
	waiter := &ScheduleWaiter{}
	waiter.Schedule = schedule
	waiter.ParseSchedule()
	waiter.jobId = jobId
	waiter.ticker = tickerChannel
	return waiter
}

// Start starts the waiter
func (w *ScheduleWaiter) Start() {
	w.stopChan = make(chan bool)
	w.WaitUntilNext()
}

// Stop simply stops the waiter
func (w *ScheduleWaiter) Stop() {
	w.stopChan <- true
}

// WaitUntilNext implements the intelligence of the waiter.
func (w *ScheduleWaiter) WaitUntilNext() {

	wait := w.computeNextWait()

	go func() {
		for {
			select {
			case <-time.After(wait):
				w.ticker <- &jobs.JobTriggerEvent{
					JobID:    w.jobId,
					Schedule: w.Schedule,
				}
				w.lastTick = time.Now()
				w.WaitUntilNext()
				// TODO implement number of repetition management
				return
			case <-w.stopChan:
				return
			}
		}
	}()

}

func (w *ScheduleWaiter) computeNextWait() time.Duration {

	now := time.Now()
	var wait time.Duration
	// First let's wait until start time
	if wait = w.startTime.Sub(now); wait < 0 {
		// Start time is behind us, let's have a look at intervals now
		if w.lastTick.IsZero() {
			// next start should be the rest of wait modulo interval
			wait = wait%w.interval + w.interval
		} else {
			wait = w.lastTick.Add(w.interval).Sub(now) // Compute next run and diff
		}
	}

	return wait

}

// ParseSchedule parses the given Iso 8601 string and stores corresponding values in the waiter to ease processing.
func (w *ScheduleWaiter) ParseSchedule() error {

	parts := strings.Split(w.Iso8601Schedule, "/")
	if len(parts) != 3 {
		return errors.InternalServerError(common.SERVICE_TIMER, "Invalid format for schedule")
	}
	repeatString := parts[0]
	startString := parts[1]
	intervalString := parts[2]

	var err error

	if repeatString != "R" {
		w.repeat, err = strconv.ParseInt(strings.TrimPrefix(parts[0], "R"), 10, 64)
		if err != nil {
			return err
		}
	}

	w.startTime, err = time.Parse(time.RFC3339, startString)
	if err != nil {
		w.startTime, err = time.Parse("2006-01-02T15:04:05", startString)
		if err != nil {
			return err
		}
	}

	if w.repeat > 1 || w.repeat == 0 {
		isoDuration, er := iso8601.FromString(intervalString)
		if er != nil {
			return err
		}
		w.interval = isoDuration.ToDuration()
	}

	return nil
}
