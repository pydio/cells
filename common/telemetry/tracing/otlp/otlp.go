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

package otlp

import (
	"context"
	"net/url"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"

	"github.com/pydio/cells/v4/common/telemetry/tracing"
)

func init() {
	tracing.DefaultURLMux().Register("otlp", &Opener{})
	tracing.DefaultURLMux().Register("otlps", &Opener{secure: true})
}

type Opener struct {
	secure bool
}

// OpenURL respond to otlp:// scheme
// Sample URL for local uptrace docker otlp://localhost:4318
func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (trace.SpanExporter, error) {
	opts := []otlptracehttp.Option{
		otlptracehttp.WithEndpoint(u.Host),
		otlptracehttp.WithCompression(otlptracehttp.GzipCompression),
	}
	if !o.secure {
		opts = append(opts, otlptracehttp.WithInsecure())
	}
	exp, er := otlptracehttp.New(ctx, opts...)
	return exp, er
}
