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

// Package timings centralizes the delays of the sync library, so that tests can shorten them.
// Values are atomic: tests may change them while goroutines started by previous tests still read them.
package timings

import (
	"sync/atomic"
	"time"
)

// Duration is a time.Duration that can be read and changed concurrently.
type Duration struct {
	v atomic.Int64
}

func newDuration(d time.Duration) *Duration {
	t := &Duration{}
	t.Set(d)
	return t
}

// Get returns the current value
func (d *Duration) Get() time.Duration {
	return time.Duration(d.v.Load())
}

// Set changes the current value
func (d *Duration) Set(v time.Duration) {
	d.v.Store(int64(v))
}

var (
	// ProcessorRetryInterval and ProcessorRetryTimeout drive retries of parallel transfers
	ProcessorRetryInterval = newDuration(5 * time.Second)
	ProcessorRetryTimeout  = newDuration(20 * time.Second)
	// EchoUnlockDelay is the default delay before releasing an echo lock on a written path
	EchoUnlockDelay = newDuration(2 * time.Second)
	// RefreshUuidDelay waits for indexation before refreshing files UUIDs
	RefreshUuidDelay = newDuration(3 * time.Second)
	// BatcherDebounce is the default debounce of the events batcher
	BatcherDebounce = newDuration(1 * time.Second)
	// BatcherIdleDelay is the inactivity delay after which the batcher reports an idle watcher
	BatcherIdleDelay = newDuration(500 * time.Millisecond)
	// ValidateFirstWait, ValidateRetryInterval and ValidateRetryTimeout drive the validation of
	// patches against cached branches (remote servers may report changes with a delay)
	ValidateFirstWait     = newDuration(1 * time.Second)
	ValidateRetryInterval = newDuration(6 * time.Second)
	ValidateRetryTimeout  = newDuration(4 * time.Minute)
	// StartConnectedDelay delays the "connected" status sent by a sync started without watchers
	StartConnectedDelay = newDuration(2 * time.Second)
)

// ForTests sets all timings to short values and returns a function restoring the previous ones.
// Usage: defer timings.ForTests()()
func ForTests() (restore func()) {
	short := map[*Duration]time.Duration{
		ProcessorRetryInterval: 10 * time.Millisecond,
		ProcessorRetryTimeout:  200 * time.Millisecond,
		EchoUnlockDelay:        50 * time.Millisecond,
		RefreshUuidDelay:       10 * time.Millisecond,
		BatcherDebounce:        50 * time.Millisecond,
		BatcherIdleDelay:       20 * time.Millisecond,
		ValidateFirstWait:      10 * time.Millisecond,
		ValidateRetryInterval:  20 * time.Millisecond,
		ValidateRetryTimeout:   200 * time.Millisecond,
		StartConnectedDelay:    20 * time.Millisecond,
	}
	previous := make(map[*Duration]time.Duration, len(short))
	for d, v := range short {
		previous[d] = d.Get()
		d.Set(v)
	}
	return func() {
		for d, v := range previous {
			d.Set(v)
		}
	}
}
