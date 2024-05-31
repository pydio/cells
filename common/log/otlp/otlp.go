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

package otlp

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	bridge "github.com/odigos-io/opentelemetry-zap-bridge"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/telemetry/otel"
)

func init() {
	log.DefaultURLMux().RegisterCore("otlp", &opener{})
}

type opener struct{}

func (o *opener) OpenCore(ctx context.Context, u *url.URL, level zapcore.LevelEnabler, svc otel.Service) (log.CoreCloser, error) {
	useGrpc := u.Scheme == "otlp+grpc"
	u.Scheme = "http"

	// autosdk env configuration keys
	// export OTEL_SERVICE_NAME=otlplogs-example
	// export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
	// export OTEL_LOGS_EXPORTER=otlp (default)
	// export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"

	if err := os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", u.String()); err == nil {
		if useGrpc {
			_ = os.Setenv("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")
		}
		_ = os.Setenv("OTEL_SERVICE_NAME", svc.Name)
		if svc.Attributes != nil {
			var parts []string
			for k, v := range svc.Attributes {
				parts = append(parts, fmt.Sprintf("%s=%s", k, v))
			}
			_ = os.Setenv("OTEL_RESOURCE_ATTRIBUTES", strings.Join(parts, ","))
		}
	}

	if c, er := zapcore.NewIncreaseLevelCore(bridge.NewOtelZapCore(), level); er != nil {
		return nil, er
	} else {
		return &wrapper{Core: c}, nil
	}
}

type wrapper struct {
	zapcore.Core
}

func (w *wrapper) Close() error {
	return nil
}
