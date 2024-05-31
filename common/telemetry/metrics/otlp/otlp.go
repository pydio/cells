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

// Package otlp provides an OpenTelemetry protocol exporter for metrics
package otlp

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
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

// OpenURL supports otlp, currently only using grpc protocol
func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (metrics.ReaderProvider, error) {

	var exporter metric.Exporter
	var err error
	switch u.Scheme {
	case "otlp", "otlp+http":
		exporter, err = otlpmetrichttp.New(ctx,
			otlpmetrichttp.WithEndpoint(u.Host),
			otlpmetrichttp.WithCompression(otlpmetrichttp.GzipCompression),
			otlpmetrichttp.WithTemporalitySelector(preferDeltaTemporalitySelector),
			otlpmetrichttp.WithInsecure(),
		)
	case "otlp+grpc", "otlp+grpc+insecure":
		opts := []otlpmetricgrpc.Option{
			otlpmetricgrpc.WithEndpoint(u.Host),
			otlpmetricgrpc.WithCompressor(gzip.Name),
			otlpmetricgrpc.WithTemporalitySelector(preferDeltaTemporalitySelector),
		}
		if u.Scheme == "otlp+grpc+insecure" {
			opts = append(opts, otlpmetricgrpc.WithInsecure())
		}
		exporter, err = otlpmetricgrpc.New(ctx, opts...)
	default:
		return nil, fmt.Errorf("unsupported scheme: %s, recognized are otlp (defaults to http), otlp+http, otlp+grpc", u.Scheme)
	}

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
