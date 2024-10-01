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

// Package tracing provides an abstraction of OpenTelemetry SpanExporter
package tracing

import (
	"context"
	"fmt"
	"sync"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
	trace2 "go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v4/common"
	otel2 "github.com/pydio/cells/v4/common/telemetry/otel"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	otelInit = &sync.Once{}
	dynamic  *dynamicExporter
)

func init() {
	propagator.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		return trace2.ContextWithSpan(ctx, trace2.SpanFromContext(parent))
	})
}

type Config struct {
	Outputs           []string          `json:"outputs" yaml:"outputs"`
	ServiceName       string            `json:"service" yaml:"service"`
	ServiceAttributes map[string]string `json:"attributes,omitempty" yaml:"attributes,omitempty"`
}

// InitExporters creates the global trace.Provider and refresh dynamic Exporters.
// Sample URLs: "stdout://", "jaeger://localhost:14268/api/traces",
func InitExporters(ctx context.Context, svc otel2.Service, cfg Config) error {

	if dynamic == nil {
		dynamic = new(dynamicExporter)
	} else {
		// Close existing exporters if any
		_ = dynamic.Shutdown(ctx)
	}
	for _, u := range cfg.Outputs {
		if exp, err := OpenTracing(context.Background(), u); err == nil {
			// fmt.Println("Tracing initialized for ", u)
			dynamic.ee = append(dynamic.ee, exp)
		} else {
			fmt.Printf("cannot open tracer %v", err)
		}
	}
	if len(dynamic.ee) == 0 {
		dynamic.ee = append(dynamic.ee, &noopExporter{})
	}

	otelInit.Do(func() {
		var opts []trace.TracerProviderOption
		opts = append(opts, trace.WithBatcher(dynamic))
		// Prepare resource attributes
		attrs := []attribute.KeyValue{
			semconv.ServiceName(svc.Name),
			semconv.ServiceVersion(common.Version().String()),
		}
		for k, v := range svc.Attributes {
			attrs = append(attrs, attribute.String(k, v))
		}
		opts = append(opts, trace.WithResource(resource.NewWithAttributes(semconv.SchemaURL, attrs...)))

		tp := trace.NewTracerProvider(opts...)
		otel.SetTracerProvider(tp)
		otel.SetTextMapPropagator(newPropagator())
	})

	// If ctx is set, wait for Done to trigger close
	if ctx != nil {
		go func() {
			<-ctx.Done()
			_ = dynamic.Shutdown(ctx)
		}()
	}

	return nil
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

// StartLocalSpan starts creates a new span and start recording. Do NOT forget to defer its End() method!
func StartLocalSpan(ctx context.Context, name string) (context.Context, trace2.Span) {
	span := trace2.SpanFromContext(ctx)
	return span.TracerProvider().Tracer("cells").Start(ctx, name)
}
