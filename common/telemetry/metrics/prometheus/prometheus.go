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

// Package prometheus provides a Prometheus collector and the required cells HTTP services to expose metrics.
package prometheus

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/prometheus/client_golang/prometheus"
	otelprom "go.opentelemetry.io/otel/exporters/prometheus"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/metrics"
)

func init() {
	runtime.RegisterEnvVariable("CELLS_METRICS_BASIC_AUTH", "Metrics Basic Authentication", "Basic authentication in the form of user:password used for exposing metrics")
	metrics.DefaultURLMux().Register("prom", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (metrics.ReaderProvider, error) {
	// Use local registry to avoid collision with prometheus.DefaultGatherer
	promReg := prometheus.NewRegistry()
	promExporter, promErr := otelprom.New(
		otelprom.WithRegisterer(promReg),
		otelprom.WithoutScopeInfo(),
		otelprom.WithoutCounterSuffixes(),
		otelprom.WithoutTargetInfo(),
	)
	if promErr != nil {
		return nil, promErr
	}

	if u.Scheme == "prom+file" {
		return &fileProvider{
			Reader:   promExporter,
			filePath: u.Path,
			registry: promReg,
		}, nil
	} else if u.Scheme == "prom" {
		var login, password string
		// Try to get from ENV
		if envAuth, ok := os.LookupEnv("CELLS_METRICS_BASIC_AUTH"); ok {
			parts := strings.SplitN(envAuth, ":", 2)
			if len(parts) == 2 {
				login = parts[0]
				password = parts[1]
			}
		}
		// Try to get from URL - less secure
		if login == "" || password == "" {
			login = u.User.Username()
			password, _ = u.User.Password()
		}
		if login == "" || password == "" {
			return nil, errors.New("please set a username/password in ENV using CELLS_METRICS_BASIC_AUTH or in URL")
		}
		return &httpProvider{
			Reader:   promExporter,
			registry: promReg,
			login:    login,
			pwd:      password,
		}, nil
	} else {
		return nil, fmt.Errorf("unsupported scheme %s, please use prom (http) or prom+file (file) schemes", u.Scheme)
	}
}
