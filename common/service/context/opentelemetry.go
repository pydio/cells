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

package servicecontext

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v4/common/log/tracing"
	"github.com/pydio/cells/v4/common/runtime"
)

var (
	otelInit = &sync.Once{}
)

func init() {
	runtime.RegisterEnvVariable("CELLS_OTLP_TRACE_EXPORTERS", "OpenTelemetry Exporters", "One or more URL to declare exporters for Traces")
}

// SpanFromContext reads trace.SpanContext from context
func SpanFromContext(ctx context.Context) trace.SpanContext {
	return trace.SpanContextFromContext(ctx)
}

// HttpMiddlewareOpenTelemetry enabled tracing on HTTP server
func HttpMiddlewareOpenTelemetry(operation string) func(h http.Handler) http.Handler {
	otelInit.Do(func() {
		tp, _ := newTraceProvider()
		otel.SetTracerProvider(tp)
		otel.SetTextMapPropagator(newPropagator())
	})
	return otelhttp.NewMiddleware(operation)
}

func newTraceProvider() (*tracesdk.TracerProvider, error) {

	// Sample URLs:
	// "stdout://",
	// "jaeger://localhost:14268/api/traces",
	exportersURL := strings.Split(os.Getenv("CELLS_OTLP_TRACE_EXPORTERS"), ",")

	var opts []tracesdk.TracerProviderOption
	for _, u := range exportersURL {
		if exp, err := tracing.OpenTracing(context.Background(), u); err == nil {
			opts = append(opts, tracesdk.WithBatcher(exp))
		} else {
			fmt.Printf("cannot open tracer %v", err)
		}
	}
	if len(opts) == 0 {
		// No exporter found or open, define a Noop
		opts = append(opts, tracesdk.WithSyncer(&NoopExporter{}))
	}
	opts = append(opts, tracesdk.WithResource(resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("cells"),
		//attribute.String("environment", "whatever"),
		//attribute.Int64("ID", 1),
	)),
	)

	return tracesdk.NewTracerProvider(opts...), nil
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

type NoopExporter struct {
}

func (n *NoopExporter) ExportSpans(ctx context.Context, spans []tracesdk.ReadOnlySpan) error {
	return nil
}

func (n *NoopExporter) Shutdown(ctx context.Context) error {
	return nil
}
