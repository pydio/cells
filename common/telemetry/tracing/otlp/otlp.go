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

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"
	"google.golang.org/grpc/encoding/gzip"

	"github.com/pydio/cells/v5/common/telemetry/tracing"
)

func init() {
	tracing.DefaultURLMux().Register("otlp", &Opener{})
}

type Opener struct{}

// OpenURL respond to otlp:// (defaults to otlp+http), otlp+http://, otlp+gprc://  schemes
// Sample URL for local collector using HTTP otlp://localhost:4318
// or using GRPC otlp+grpc://localhost:4317
func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (trace.SpanExporter, error) {
	switch u.Scheme {
	case "otlp+grpc", "otlp+grpc+insecure":
		opts := []otlptracegrpc.Option{
			otlptracegrpc.WithEndpoint(u.Host),
			otlptracegrpc.WithCompressor(gzip.Name),
		}
		if u.Scheme == "otlp+grpc+insecure" {
			opts = append(opts, otlptracegrpc.WithInsecure())
		}
		return otlptracegrpc.New(ctx, opts...)
	default:
		opts := []otlptracehttp.Option{
			otlptracehttp.WithEndpoint(u.Host),
			otlptracehttp.WithCompression(otlptracehttp.GzipCompression),
			otlptracehttp.WithInsecure(),
		}
		return otlptracehttp.New(ctx, opts...)
	}
}
