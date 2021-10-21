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
package registry

import (
	"fmt"
	"os"
	"strings"

	"github.com/pydio/cells/common/service/metrics"
)

const (
	serviceMetaPID       = "PID"
	serviceMetaParentPID = "parentPID"
	serviceMetaMetrics   = "metrics"
	serviceMetaStartTag  = "start"
	serviceMetaHostname  = "hostname"
)

func BuildServiceMeta() map[string]string {
	meta := map[string]string{
		serviceMetaPID:       fmt.Sprintf("%d", os.Getpid()),
		serviceMetaParentPID: fmt.Sprintf("%d", os.Getppid()),
		serviceMetaMetrics:   fmt.Sprintf("%d", metrics.GetExposedPort()),
		serviceMetaStartTag:  strings.Join(ProcessStartTags, ","),
	}
	if h, e := os.Hostname(); e == nil {
		meta[serviceMetaHostname] = h
	}
	return meta
}
