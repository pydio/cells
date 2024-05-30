/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package metrics

import (
	"context"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Stopwatch is a helper for simpler tracking of elapsed time, use the
// Stop() method to report time elapsed since its created back to the
// timer or histogram.
type Stopwatch struct {
	start    time.Time
	recorder StopwatchRecorder
}

// NewStopwatch creates a new immutable stopwatch for recording the start
// time to a stopwatch reporter.
func NewStopwatch(start time.Time, r StopwatchRecorder) Stopwatch {
	return Stopwatch{start: start, recorder: r}
}

// Stop reports time elapsed since the stopwatch start to the recorder.
func (sw Stopwatch) Stop() {
	sw.recorder.RecordStopwatch(sw.start)
}

// StopwatchRecorder is a recorder that is called when a stopwatch is
// stopped with Stop().
type StopwatchRecorder interface {
	RecordStopwatch(stopwatchStart time.Time)
}

// Timer is the interface for emitting timer metrics.
type Timer interface {
	// Record a specific duration directly.
	Record(value time.Duration)

	// Start gives you back a specific point in time to report via Stop.
	Start() Stopwatch
}

type timer struct {
	metric.Float64Gauge
	parent *helper
}

func (m *timer) Start() Stopwatch {
	return NewStopwatch(time.Now(), m)
}

func (m *timer) RecordStopwatch(stopwatchStart time.Time) {
	m.Record(time.Now().Sub(stopwatchStart))
}

func (m *timer) Record(value time.Duration) {
	var options []metric.RecordOption
	if m.parent != nil && m.parent.tags != nil {
		var attrs []attribute.KeyValue
		for k, v := range m.parent.tags {
			attrs = append(attrs, attribute.String(k, v))
		}
		options = append(options, metric.WithAttributes(attrs...))
	}
	m.Float64Gauge.Record(context.Background(), float64(value), options...)
}
