package otlp

import (
	"context"
	"net/http"
	"net/url"
	"time"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/metric/metricdata"
	"google.golang.org/grpc/encoding/gzip"

	"github.com/pydio/cells/v4/common/telemetry/metrics"
)

func init() {
	metrics.DefaultURLMux().Register("otlp", &Opener{})
}

type provider struct {
	metric.Reader
}

func (*provider) PullSupported() bool {
	return false
}

func (*provider) HttpHandler() http.Handler {
	return nil
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (metrics.ReaderProvider, error) {

	// SAMPLE HOST "localhost:4317"
	exporter, err := otlpmetricgrpc.New(ctx,
		otlpmetricgrpc.WithEndpoint(u.Host),
		otlpmetricgrpc.WithCompressor(gzip.Name),
		otlpmetricgrpc.WithTemporalitySelector(preferDeltaTemporalitySelector),
	)
	if err != nil {
		return nil, err
	}

	reader := metric.NewPeriodicReader(
		exporter,
		metric.WithInterval(15*time.Second), // todo pass through URL
	)
	return &provider{Reader: reader}, nil
}

// This is from default example - to recheck
func preferDeltaTemporalitySelector(kind metric.InstrumentKind) metricdata.Temporality {
	switch kind {
	case metric.InstrumentKindCounter,
		metric.InstrumentKindObservableCounter,
		metric.InstrumentKindHistogram:
		return metricdata.DeltaTemporality
	default:
		return metricdata.CumulativeTemporality
	}
}
