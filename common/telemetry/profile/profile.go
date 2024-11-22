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

// Package profile provides an abstraction of pprof profiles generations.
package profile

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v5/common/telemetry/otel"
)

// PProfProvider is the interface for a profile provider
type PProfProvider interface {
	PushSupported() bool
}

// Config is a serializable representation of a list of publishers
type Config struct {
	Publishers []string `json:"publishers" yaml:"publishers"`
}

var (
	discoveries []otel.PullServiceDiscovery
	enabled     bool
)

// InitPublishers reads a config and initialize the corresponding PProfProvider
func InitPublishers(ctx context.Context, scv otel.Service, cfg Config) error {
	enabled = false
	for _, publisher := range cfg.Publishers {
		if prof, er := OpenProfiler(ctx, publisher, scv); er != nil {
			fmt.Println("Error opening profiler:", er)
		} else {
			enabled = true
			if sd, ok := prof.(otel.PullServiceDiscovery); ok {
				discoveries = append(discoveries, sd)
			}
		}
	}
	return nil
}

// HasPullServices checks if one or more current PProfProvider implement the otel.PullServiceDiscovery interface
func HasPullServices() bool {
	return len(discoveries) > 0
}

// GetPullServices lists the PProfProvider that implement the otel.PullServiceDiscovery interface
func GetPullServices() []otel.PullServiceDiscovery {
	return discoveries
}

// HasProviders checks that there is at least one PProfProvider initialized.
func HasProviders() bool {
	return enabled
}
