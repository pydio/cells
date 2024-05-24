package jaeger

import (
	"context"
	"net/url"

	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"

	"github.com/pydio/cells/v4/common/tracing"
)

func init() {
	tracing.DefaultURLMux().Register("stdout", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (tracesdk.SpanExporter, error) {

	return stdouttrace.New(
		stdouttrace.WithPrettyPrint(),
	)
}
