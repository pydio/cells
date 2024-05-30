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

package telemetry

import (
	"context"
	"fmt"

	"go.uber.org/multierr"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/telemetry/metrics"
	"github.com/pydio/cells/v4/common/telemetry/otel"
	"github.com/pydio/cells/v4/common/telemetry/tracing"
)

/*
Sample JSON config for telemetry
```
"otelService":{
	"name":"cells",
	"attributes":{"deployment":"local"}
  },
"loggers": [
	{"level":"info","encoding":"console","outputs":["stdout:///"]},
	{"level":"info","encoding":"json","outputs":["file:///Users/charles/Library/Application Support/Pydio/cells5/logs/pydio.log","service:///?service=pydio.grpc.log"]},
	{"level":"error","encoding":"json","outputs":["file:///Users/charles/Library/Application Support/Pydio/cells5/logs/pydio_err.log"]},
	{"level":"=debug","encoding":"console","outputs":["file:///Users/charles/Library/Application Support/Pydio/cells5/logs/pydio_request_debug.log"],"filters":{"X-Pydio-Debug-Session":"true"}},
	{"level":"debug","encoding":"json","outputs":["otlp://localhost:4318"]}
],
"tracing": {
	"outputs": [
	  "jaeger://localhost:14268/api/traces",
	  "otlp://localhost:4318"
	]
},
"metrics": {
	"readers": [
	   "prometheus://",
	   "otlp://localhost:4317"
    ]
}

```
*/

type Config struct {
	OTelService otel.Service       `json:"otelService" yaml:"otel_service"`
	Loggers     []log.LoggerConfig `json:"loggers" yaml:"loggers"`
	Tracing     tracing.Config     `json:"tracing" yaml:"tracing"`
	Metrics     metrics.Config     `json:"metrics" yaml:"metrics"`
}

func (c Config) Reload(ctx context.Context) error {
	if c.OTelService.Name == "" {
		c.OTelService.Name = common.PackageType
	}

	fmt.Println("Reloading", len(c.Loggers), "loggers from configuration")
	log.ReloadMainLogger(c.OTelService, c.Loggers)

	var errs []error
	if len(c.Tracing.Outputs) > 0 {
		if er := tracing.InitProvider(ctx, c.OTelService, c.Tracing); er != nil {
			errs = append(errs, fmt.Errorf("error initializing tracer %v", er))
		}
	}
	if len(c.Metrics.Readers) > 0 {
		if er := metrics.InitProvider(ctx, c.OTelService, c.Metrics); er != nil {
			errs = append(errs, fmt.Errorf("error initializing metrics %v", er))
		}
	}

	return multierr.Combine(errs...)
}
