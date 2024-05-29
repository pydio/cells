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

package metrics

import (
	"context"
	"io"
	"time"

	tally "github.com/uber-go/tally/v4"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Counter is the interface for emitting counter type metrics.
type Counter interface {
	// Inc increments the counter by a delta.
	Inc(delta int64)
}

type mixedCounter struct {
	tally.Counter
	metric.Int64Counter
	parent *mixed
}

func (m *mixedCounter) Inc(delta int64) {
	m.Counter.Inc(delta)
	var options []metric.AddOption
	if m.parent != nil && m.parent.tags != nil {
		var attrs []attribute.KeyValue
		for k, v := range m.parent.tags {
			attrs = append(attrs, attribute.String(k, v))
		}
		options = append(options, metric.WithAttributes(attrs...))
	}
	m.Int64Counter.Add(context.Background(), delta, options...)
}

// Gauge is the interface for emitting gauge metrics.
type Gauge interface {
	// Update sets the gauges absolute value.
	Update(value float64)
}

type mixedGauge struct {
	tally.Gauge
	metric.Float64Gauge
	parent *mixed
}

func (m *mixedGauge) Update(value float64) {
	m.Gauge.Update(value)
	var options []metric.RecordOption
	if m.parent != nil && m.parent.tags != nil {
		var attrs []attribute.KeyValue
		for k, v := range m.parent.tags {
			attrs = append(attrs, attribute.String(k, v))
		}
		options = append(options, metric.WithAttributes(attrs...))
	}
	m.Float64Gauge.Record(context.Background(), value, options...)
}

// Timer is the interface for emitting timer metrics.
type Timer interface {
	// Record a specific duration directly.
	Record(value time.Duration)

	// Start gives you back a specific point in time to report via Stop.
	Start() tally.Stopwatch
}

type mixedTimer struct {
	tally.Timer
	metric.Float64Gauge
	parent *mixed
}

func (m *mixedTimer) Start() tally.Stopwatch {
	return tally.NewStopwatch(time.Now(), m)
}

func (m *mixedTimer) RecordStopwatch(stopwatchStart time.Time) {
	m.Record(time.Now().Sub(stopwatchStart))
}

func (m *mixedTimer) Record(value time.Duration) {
	m.Timer.Record(value)
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

// Meter interface expands OpenTelemetry interface with some specific tally counters for legacy
// support of tally+prometheus metrics reporting.
type Meter interface {
	metric.Meter
	Counter(name string) Counter
	Gauge(name string) Gauge
	Timer(name string) Timer
}

type mixed struct {
	tally.Scope
	metric.Meter
	tags map[string]string
}

func (m *mixed) Counter(name string) Counter {
	i, _ := m.Meter.Int64Counter(name)
	return &mixedCounter{
		parent:       m,
		Counter:      m.Scope.Counter(name),
		Int64Counter: i,
	}
}

func (m *mixed) Gauge(name string) Gauge {
	g, _ := m.Meter.Float64Gauge(name)
	return &mixedGauge{
		parent:       m,
		Gauge:        m.Scope.Gauge(name),
		Float64Gauge: g,
	}
}

func (m *mixed) Timer(name string) Timer {
	g, _ := m.Meter.Float64Gauge(name)
	return &mixedTimer{
		parent:       m,
		Timer:        m.Scope.Timer(name),
		Float64Gauge: g,
	}
}

var (
	scope  = tally.NoopScope
	closer io.Closer

	current Meter
)

func RegisterRootScope(s tally.ScopeOptions) {
	scope, closer = tally.NewRootScope(s, 1*time.Second)
}

func RegisterOpenTelemetryProvider(mp metric.MeterProvider) {
	otel.SetMeterProvider(mp)
}

func Close() {
	if closer != nil {
		_ = closer.Close()
	}
}

func GetMetrics() Meter {

	rootMeter := otel.Meter("root")
	if current == nil {
		current = &mixed{
			Scope: scope,
			Meter: rootMeter,
		}
	}

	return current
}

func GetTaggedMetrics(tags map[string]string) Meter {
	return &mixed{
		Meter: otel.Meter("root"),
		Scope: scope.Tagged(tags),
		tags:  tags,
	}
}

func GetMetricsForService(serviceName string) Meter {
	return GetTaggedMetrics(map[string]string{"service": serviceName})
}
