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
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

// MeterHelper interface expands OpenTelemetry interface with some specific counters/gauges for legacy
// support of tally+prometheus metrics reporting.
type MeterHelper interface {
	metric.Meter
	Counter(name string, descriptionAndUnit ...string) Counter
	Gauge(name string, descriptionAndUnit ...string) Gauge
	Timer(name string, description ...string) Timer
}

type helper struct {
	metric.Meter
	tags map[string]string
}

func (m *helper) Counter(name string, descAndUnit ...string) Counter {
	var opts []metric.Int64CounterOption
	for idx, o := range descAndUnit {
		if idx == 0 {
			opts = append(opts, metric.WithDescription(o))
		} else if idx == 1 {
			opts = append(opts, metric.WithUnit(o))
		}
	}
	i, _ := m.Meter.Int64Counter(name, opts...)
	return &counter{
		parent:       m,
		Int64Counter: i,
	}
}

func (m *helper) Gauge(name string, descAndUnit ...string) Gauge {
	var opts []metric.Float64GaugeOption
	for idx, o := range descAndUnit {
		if idx == 0 {
			opts = append(opts, metric.WithDescription(o))
		} else if idx == 1 {
			opts = append(opts, metric.WithUnit(o))
		}
	}
	g, _ := m.Meter.Float64Gauge(name, opts...)
	return &gauge{
		parent:       m,
		Float64Gauge: g,
	}
}

func (m *helper) Timer(name string, description ...string) Timer {
	opts := []metric.Float64GaugeOption{
		metric.WithUnit("ns"),
	}
	if len(description) > 0 {
		opts = append(opts, metric.WithDescription(description[0]))
	}
	g, _ := m.Meter.Float64Gauge(name, opts...)
	return &timer{
		parent:       m,
		Float64Gauge: g,
	}
}

var (
	current MeterHelper
)

func Helper() MeterHelper {

	if current == nil {
		current = &helper{
			Meter: otel.Meter("root"),
		}
	}

	return current
}

func TaggedHelper(tags map[string]string) MeterHelper {
	return &helper{
		Meter: otel.Meter("root"),
		tags:  tags,
	}
}

func ServiceHelper(serviceName string) MeterHelper {
	return TaggedHelper(map[string]string{"service": serviceName})
}
