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

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Counter is the interface for emitting counter type metrics.
type Counter interface {
	// Inc increments the counter by a delta.
	Inc(delta int64)
}

type counter struct {
	metric.Int64Counter
	parent *helper
}

// Inc increments the counter with a delta.
func (m *counter) Inc(delta int64) {
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
