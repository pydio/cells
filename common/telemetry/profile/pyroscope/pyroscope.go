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

// Package pyroscope provides a Push-implementation of profiling traces to Grafana Pyroscope server
package pyroscope

import (
	"context"
	"net/url"

	pyroscope "github.com/grafana/pyroscope-go"

	"github.com/pydio/cells/v5/common/telemetry/otel"
	"github.com/pydio/cells/v5/common/telemetry/profile"
)

func init() {
	profile.DefaultURLMux().Register("pyroscope", &Opener{})
}

type provider struct {
}

func (*provider) PushSupported() bool {
	return true
}

type Opener struct {
	prof *pyroscope.Profiler
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL, service otel.Service) (profile.PProfProvider, error) {
	if o.prof != nil {
		_ = o.prof.Stop()
	}
	u.Scheme = "http"

	// SAMPLE HOST "http://localhost:4040"
	var er error
	o.prof, er = pyroscope.Start(pyroscope.Config{
		ApplicationName: service.Name,

		// replace this with the address of pyroscope server
		ServerAddress: u.String(),

		// you can disable logging by setting this to nil
		Logger: nil, // pyroscope.StandardLogger,

		// you can provide static tags via a map:
		Tags: func() map[string]string {
			m := make(map[string]string, len(service.Attributes))
			for k, v := range service.Attributes {
				m[k] = v
			}
			return m
		}(),

		ProfileTypes: []pyroscope.ProfileType{
			// these profile types are enabled by default:
			pyroscope.ProfileCPU,
			pyroscope.ProfileAllocObjects,
			pyroscope.ProfileAllocSpace,
			pyroscope.ProfileInuseObjects,
			pyroscope.ProfileInuseSpace,

			// these profile types are optional:
			pyroscope.ProfileGoroutines,
			pyroscope.ProfileMutexCount,
			pyroscope.ProfileMutexDuration,
			pyroscope.ProfileBlockCount,
			pyroscope.ProfileBlockDuration,
		},
	})

	return &provider{}, er
}
