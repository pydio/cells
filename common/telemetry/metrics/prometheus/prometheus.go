package prometheus

import (
	"context"
	"net/http"
	"net/url"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	otelprom "go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/sdk/metric"

	"github.com/pydio/cells/v4/common/telemetry/metrics"
)

func init() {
	metrics.DefaultURLMux().Register("prometheus", &Opener{})
}

type provider struct {
	metric.Reader
}

func (*provider) PullSupported() bool {
	return true
}

func (*provider) HttpHandler() http.Handler {
	return promhttp.Handler()
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (metrics.ReaderProvider, error) {
	// Check other options
	promExporter, err := otelprom.New(
		otelprom.WithoutScopeInfo(),
		//otelprom.WithoutTargetInfo(), ??
	)
	if err != nil {
		panic(err)
	}
	return &provider{Reader: promExporter}, nil
}
