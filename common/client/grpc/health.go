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
	"google.golang.org/grpc"
	"time"

	"google.golang.org/grpc/health/grpc_health_v1"
)

// HealthMonitor blocks a connection to a specific service health
type HealthMonitor interface {
	Monitor(string)
	Up() bool
	Stop()
}

func NewHealthChecker(c context.Context) HealthMonitor {
	return &healthChecker{c: c}
}

type healthChecker struct {
	c      context.Context
	cancel context.CancelFunc
	status bool
}

// Monitor blocks a connection to a specific service health.
func (h *healthChecker) Monitor(serviceName string) {
	cli := grpc_health_v1.NewHealthClient(GetClientConnFromCtx(h.c, serviceName))
	ct, can := context.WithCancel(context.Background())
	h.cancel = can
	resp, er := cli.Check(ct, &grpc_health_v1.HealthCheckRequest{}, grpc.WaitForReady(true))
	if er != nil {
		fmt.Println("[ERROR] Could not monitor service " + serviceName + ": " + er.Error())
		<-time.After(10 * time.Second)
		h.Monitor(serviceName)
		return
	}
	h.status = resp.Status == grpc_health_v1.HealthCheckResponse_SERVING
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
