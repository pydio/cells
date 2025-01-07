package tracing

import (
	"context"

	"go.opentelemetry.io/otel/sdk/trace"
	"go.uber.org/multierr"
)

// dynamicExporter wraps multiple exporters
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
	var err []error
	for _, e := range d.ee {
		err = append(err, e.Shutdown(ctx))
	}
	return multierr.Combine(err...)
}

// noopExporter does nothing
type noopExporter struct{}

func (n *noopExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	return nil
}

func (n *noopExporter) Shutdown(ctx context.Context) error {
	return nil
}
