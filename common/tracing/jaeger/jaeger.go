package jaeger

import (
	"context"
	"net/url"

	"go.opentelemetry.io/otel/exporters/jaeger"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"

	"github.com/pydio/cells/v4/common/tracing"
)

func init() {
	tracing.DefaultURLMux().Register("jaeger", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (tracesdk.SpanExporter, error) {

	//url := fmt.Sprintf("http://localhost:14268/api/traces")
	// Replace jaeger:// with http://
	u.Scheme = "http"

	// Create the Jaeger exporter
	return jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(u.String())))
}
