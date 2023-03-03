package jaeger

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/tracing"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"net/url"
)

func init() {
	tracing.DefaultURLMux().Register("jaeger", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (trace.TracerProvider, error) {

	url := fmt.Sprintf("http://localhost:14268/api/traces")

	// Create the Jaeger exporter
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return nil, err
	}

	tp := tracesdk.NewTracerProvider(
		// Always be sure to batch in production.
		tracesdk.WithBatcher(exp),
		// Record information about this application in a Resource.
		tracesdk.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("whatever"),
			attribute.String("environment", "whatever"),
			attribute.Int64("ID", 1),
		)),
	)
	return tp, nil
}
