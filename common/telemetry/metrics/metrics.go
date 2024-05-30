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

package metrics

import (
	"context"
	"net/http"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"

	"github.com/pydio/cells/v4/common"
	otel2 "github.com/pydio/cells/v4/common/telemetry/otel"
)

type Config struct {
	Readers []string `json:"readers" yaml:"readers"`
}

var (
	httpPuller ReaderProvider
)

func InitProvider(ctx context.Context, svc otel2.Service, cfg Config) error {

	attrs := []attribute.KeyValue{
		semconv.ServiceName(svc.Name),
		semconv.ServiceVersion(common.Version().String()),
	}
	for k, v := range svc.Attributes {
		attrs = append(attrs, attribute.String(k, v))
	}

	// Should be initialized by service
	res, err := resource.New(ctx,
		resource.WithFromEnv(),
		resource.WithTelemetrySDK(),
		resource.WithHost(),
		resource.WithAttributes(
			attrs...,
		))
	if err != nil {
		return err
	}

	// Prefix all names with cells
	var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
		s := metric.Stream{Name: "cells_" + i.Name, Description: i.Description, Unit: i.Unit}
		return s, true
	}

	opts := []metric.Option{
		metric.WithResource(res),
		metric.WithView(view),
	}

	for _, r := range cfg.Readers {
		if rp, er := OpenReader(ctx, r); er == nil {
			opts = append(opts, metric.WithReader(rp))
			if rp.PullSupported() {
				httpPuller = rp
			}
		}
	}

	provider := metric.NewMeterProvider(opts...)

	otel.SetMeterProvider(provider)
	return nil
}

func HasHttpPuller() bool {
	return httpPuller != nil
}

func HttpHandler() http.Handler {
	return httpPuller.HttpHandler()
}
