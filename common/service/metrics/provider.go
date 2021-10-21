/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"io"
	"time"

	"github.com/uber-go/tally"
)

var (
	scope = tally.NoopScope

	closer        io.Closer
	port          int
	startExposure []func()
)

func RegisterRootScope(s tally.ScopeOptions, exposedPort int) {
	scope, closer = tally.NewRootScope(s, 1*time.Second)
	port = exposedPort
}

func RegisterOnStartExposure(runFunc func()) {
	startExposure = append(startExposure, runFunc)
}

func Init() {
	if len(startExposure) > 0 {
		for _, f := range startExposure {
			f()
		}
	}
}

func Close() {
	port = 0
	if closer != nil {
		closer.Close()
	}
}

func GetExposedPort() int {
	return port
}

func GetMetrics() tally.Scope {
	return scope
}

func GetMetricsForService(serviceName string) tally.Scope {
	return scope.Tagged(map[string]string{
		"service": serviceName,
	})
}
