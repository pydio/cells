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
// Package schedule provides a fixed ticker based on a start time
// iso8601 interval periods are supported
package schedule

import (
	"strconv"
	"strings"
	"time"

	"github.com/ajvb/kala/utils/iso8601"
	"github.com/pkg/errors"
)

type OnTick func() error

// TickerSchedule contains all info about the scheduling (start, repeat, interval)
type TickerSchedule struct {
	// ISO8601 representation of schedule
	iso8601Schedule string
	// Number of repetitions: if 0, infinite repetition.
	repeat int64
	// Do not start before that time
	startTime time.Time
	// Interval between ticks
	interval time.Duration
}

// ParseSchedule parses the given Iso 8601 string and stores corresponding values.
func (s *TickerSchedule) ParseIsoSchedule() error {

	if s.iso8601Schedule == "" {
		return errors.New("cannot parse empty Iso8601 schedule")
	}

	parts := strings.Split(s.iso8601Schedule, "/")
	if len(parts) != 3 {
		return errors.New("invalid format for schedule")
	}
	repeatString := parts[0]
	startString := parts[1]
	intervalString := parts[2]

	var err error

	if repeatString != "R" {
		s.repeat, err = strconv.ParseInt(strings.TrimPrefix(parts[0], "R"), 10, 64)
		if err != nil {
			return err
		}
	}

	s.startTime, err = time.Parse(time.RFC3339, startString)
	if err != nil {
		s.startTime, err = time.Parse("2006-01-02T15:04:05", startString)
		if err != nil {
			return err
		}
	}

	if s.repeat > 1 || s.repeat == 0 {
		isoDuration, er := iso8601.FromString(intervalString)
		if er != nil {
			return err
		}
		s.interval = isoDuration.ToDuration()
	}

	return nil
}

// NewTickerScheduleFromISO creates a schedule from an iso8601 string. It can return
// an error if the string is not properly formatted or empty.
func NewTickerScheduleFromISO(is8601 string) (*TickerSchedule, error) {
	s := &TickerSchedule{iso8601Schedule: is8601}
	if err := s.ParseIsoSchedule(); err != nil {
		return nil, err
	}
	return s, nil
}

// NewTickerSchedule creates a schedule from parameters
func NewTickerSchedule(interval time.Duration, startTime time.Time, repeat int64) *TickerSchedule {
	s := &TickerSchedule{
		interval:  interval,
		startTime: startTime,
		repeat:    repeat,
	}
	return s
}

// Ticker provides an easy way to execute a job at given times (like a cron job).
type Ticker struct {
	*TickerSchedule
	ticker   OnTick
	stopChan chan bool
	lastTick time.Time
}

// NewTicker creates a new waiter that sends start events for this job on the given schedule
func NewTicker(schedule *TickerSchedule, onTick OnTick) *Ticker {
	waiter := &Ticker{}
	waiter.TickerSchedule = schedule
	waiter.ticker = onTick
	return waiter
}

// Start starts the waiter
func (w *Ticker) Start() {
	w.stopChan = make(chan bool)
	w.WaitUntilNext()
}

// Stop simply stops the waiter
func (w *Ticker) Stop() {
	w.stopChan <- true
}

// WaitUntilNext implements the intelligence of the waiter.
func (w *Ticker) WaitUntilNext() {

	var wait time.Duration
	if w.interval == 0 {
		// This is not normal, this will trigger the job too many times
		wait = 5 * time.Minute
	} else {
		wait = w.computeNextWait()
	}

	go func() {
		for {
			select {
			case <-time.After(wait):
				w.ticker()
				w.lastTick = time.Now()
				w.WaitUntilNext()
				// TODO implement number of repetition management?
				return
			case <-w.stopChan:
				return
			}
		}
	}()

}

func (w *Ticker) computeNextWait() time.Duration {

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
