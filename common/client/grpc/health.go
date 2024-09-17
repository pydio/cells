/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v4/common/utils/std"
)

// HealthMonitor blocks a connection to a specific service health
type HealthMonitor interface {
	Monitor(string)
	Up() bool
	Stop()
}

// NewHealthChecker creates a HealthMonitor that blocks once on establishing the gRPC connection
func NewHealthChecker(c context.Context) HealthMonitor {
	return &healthChecker{c: c}
}

// NewHealthCheckerWithRetries creates a HealthMonitor that retries the gRPC connection if it fails
// Do not pass 0 as retry or timeout parameters !
func NewHealthCheckerWithRetries(c context.Context, retry, timeout time.Duration) HealthMonitor {
	return &healthChecker{
		c:       c,
		retry:   retry,
		timeout: timeout,
	}
}

type healthChecker struct {
	c              context.Context
	cancel         context.CancelFunc
	status         bool
	retry, timeout time.Duration
}

// Monitor blocks a connection to a specific service health.
func (h *healthChecker) Monitor(serviceName string) {
	cli := grpc_health_v1.NewHealthClient(ResolveConn(h.c, serviceName))
	ct, can := context.WithCancel(context.Background())
	h.cancel = can
	testFunc := func() error {
		resp, er := cli.Check(ct, &grpc_health_v1.HealthCheckRequest{})
		if er == nil {
			h.status = resp.Status == grpc_health_v1.HealthCheckResponse_SERVING
			return nil
		}
		if h.timeout > 0 {
			fmt.Println("[WARN] Could not monitor service " + serviceName + ": " + er.Error() + ", will retry in " + h.retry.String())
		}
		return er
	}
	var fail error
	if h.timeout > 0 {
		fail = std.Retry(ct, testFunc, h.retry, h.timeout)
	} else {
		fail = testFunc()
	}
	if fail != nil {
		fmt.Println("[ERROR] Cannot contact service " + serviceName + ": " + fail.Error() + ", monitor will block, this is probably abnormal.")
	}
}

// Up returns internal status value.
func (h *healthChecker) Up() bool {
	return h.status
}

func (h *healthChecker) Stop() {
	if h.cancel != nil {
		h.cancel()
	}
}
