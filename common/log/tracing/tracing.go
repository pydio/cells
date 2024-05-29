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
	"go.uber.org/multierr"

	"github.com/pydio/cells/v4/common/log"
)

var (
	otelInit = &sync.Once{}
	dynamic  *dynamicExporter
)

type dynamicExporter struct {
	ee []trace.SpanExporter
}

func (d *dynamicExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	var err []error
	for _, e := range d.ee {
		err = append(err, e.ExportSpans(ctx, spans))
	}
	return multierr.Combine(err...)
}

func (d *dynamicExporter) Shutdown(ctx context.Context) error {
	fmt.Println("Closing all tracing providers")
	var err []error
	for _, e := range d.ee {
		err = append(err, e.Shutdown(ctx))
	}
	return multierr.Combine(err...)
}

// InitProvider creates a provider and refresh dynamic exporters
// Sample output URLs: "stdout://", "jaeger://localhost:14268/api/traces",
func InitProvider(ctx context.Context, cfg log.TracingConfig) error {

	if dynamic == nil {
		dynamic = new(dynamicExporter)
	} else {
		// Close existing exporters if any
		_ = dynamic.Shutdown(ctx)
	}
	for _, u := range cfg.Outputs {
		if exp, err := OpenTracing(context.Background(), u); err == nil {
			fmt.Println("Tracing initialized for ", u)
			dynamic.ee = append(dynamic.ee, exp)
		} else {
			fmt.Printf("cannot open tracer %v", err)
		}
	}
	if len(dynamic.ee) == 0 {
		dynamic.ee = append(dynamic.ee, &NoopExporter{})
	}

	otelInit.Do(func() {
		var opts []trace.TracerProviderOption
		opts = append(opts, trace.WithBatcher(dynamic))
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

type NoopExporter struct {
}

func (n *NoopExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	return nil
}

func (n *NoopExporter) Shutdown(ctx context.Context) error {
	return nil
}
