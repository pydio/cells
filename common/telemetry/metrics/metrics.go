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

// Package metrics abstract various providers around OpenTelemetry metric.Reader
package metrics

import (
	"context"
	"strings"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"

	"github.com/pydio/cells/v5/common"
	otel2 "github.com/pydio/cells/v5/common/telemetry/otel"
)

// Config is a serializable representation of a list of Readers.
type Config struct {
	Readers []string `json:"readers" yaml:"readers"`
}

var (
	discoveries []otel2.PullServiceDiscovery
	enabled     bool
)

// InitReaders reads a Config and initializes the corresponding metric.Reader.
func InitReaders(ctx context.Context, svc otel2.Service, cfg Config) error {

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

	// Prefix all names with cells. For gocloud.dev instruments, also append the backend
	// provider name to avoid Prometheus "collected before" duplicate errors when multiple
	// backends (e.g. NATS broker + fsqueue async queue) are active in the same process:
	// each backend creates a distinct OTel scope with gocdk_provider as a scope attribute,
	// producing identical metric names+labels once WithoutScopeInfo strips the scope.
	var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
		name := "cells_" + i.Name
		if strings.HasPrefix(i.Scope.Name, "gocloud.dev/") {
			if v, ok := i.Scope.Attributes.Value(attribute.Key("gocdk_provider")); ok {
				providerPath := v.AsString()
				if idx := strings.LastIndex(providerPath, "/"); idx >= 0 {
					name += "_" + providerPath[idx+1:]
				}
			}
		}
		s := metric.Stream{Name: name, Description: i.Description, Unit: i.Unit}
		return s, true
	}

	opts := []metric.Option{
		metric.WithResource(res),
		metric.WithView(view),
	}

	enabled = false
	for _, r := range cfg.Readers {
		if rp, er := OpenReader(ctx, r); er == nil {
			enabled = true
			opts = append(opts, metric.WithReader(rp))
			if sd, ok := rp.(otel2.PullServiceDiscovery); ok {
				discoveries = append(discoveries, sd)
			}
		} else {
			// fmt.Println("Error while initializing metrics reader ", er)
		}
	}

	provider := metric.NewMeterProvider(opts...)

	otel.SetMeterProvider(provider)

	TaggedHelper(map[string]string{
		"version":       common.Version().String(),
		"package_label": common.PackageLabel,
		"package_type":  common.PackageType,
	}).Gauge("version_info").Update(1)

	_ = runtime.Start(runtime.WithMeterProvider(provider), runtime.WithMinimumReadMemStatsInterval(time.Second))
	return nil
}

func HasPullServices() bool {
	return len(discoveries) > 0
}

func GetPullServices() []otel2.PullServiceDiscovery {
	return discoveries
}

func HasProviders() bool {
	return enabled
}
