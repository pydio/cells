package otlp

import (
	"context"
	"net/url"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"

	"github.com/pydio/cells/v4/common/log/tracing"
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
