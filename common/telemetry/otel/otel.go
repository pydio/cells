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

// Package otel groups together some common types for telemetry
package otel

import "context"

// Service is a serialization of OpenTelemetry resources.Resource
type Service struct {
	Name       string            `json:"name" yaml:"name"`
	Attributes map[string]string `json:"attributes" yaml:"attributes"`
}

// PullServiceDiscovery is used for drivers that may initialize an HTTP service for external data pulling.
type PullServiceDiscovery interface {
	InitHTTPPullService(ctx context.Context, route string)
}
