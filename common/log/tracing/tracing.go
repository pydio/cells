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

	"github.com/pydio/cells/v4/common/log"
)

var (
	otelPropagatorInit = &sync.Once{}
)

func InitProvider(cfg log.TracingConfig) error {

	// Sample output URLs:
	// "stdout://",
	// "jaeger://localhost:14268/api/traces",

	// Prepare writers
	var opts []trace.TracerProviderOption
	for _, u := range cfg.Outputs {
		if exp, err := OpenTracing(context.Background(), u); err == nil {
			fmt.Println("Tracing initialized for ", u)
			opts = append(opts, trace.WithBatcher(exp))
		} else {
			fmt.Printf("cannot open tracer %v", err)
		}
	}
	if len(opts) == 0 {
		// No exporter found or open, define a Noop
		opts = append(opts, trace.WithSyncer(&NoopExporter{}))
	}

	// Prepare resource attributes
	attrs := []attribute.KeyValue{
		semconv.ServiceName(cfg.ServiceName),
	}
	if cfg.ServiceAttributes != nil {
		for k, v := range cfg.ServiceAttributes {
			attrs = append(attrs, attribute.String(k, v))
		}
	}
	opts = append(opts, trace.WithResource(resource.NewWithAttributes(semconv.SchemaURL, attrs...)))

	tp := trace.NewTracerProvider(opts...)
	otel.SetTracerProvider(tp)
	otelPropagatorInit.Do(func() {
		otel.SetTextMapPropagator(newPropagator())
	})
	return nil
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

type NoopExporter struct {
}

func (n *NoopExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	return nil
}

func (n *NoopExporter) Shutdown(ctx context.Context) error {
	return nil
}
