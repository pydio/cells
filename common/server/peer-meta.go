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

package server

import (
	"fmt"
	"os"
	"strings"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service/metrics"
)

const (
	NodeMetaPID          = "PID"
	NodeMetaParentPID    = "parentPID"
	NodeMetaMetrics      = "metrics"
	NodeMetaStartTag     = "start"
	NodeMetaForkStartTag = "forkStartTag"
	NodeMetaHostName     = "hostname"
)

func InitPeerMeta() map[string]string {
	meta := make(map[string]string)
	meta[NodeMetaPID] = fmt.Sprintf("%d", os.Getpid())
	meta[NodeMetaParentPID] = fmt.Sprintf("%d", os.Getppid())
	meta[NodeMetaMetrics] = fmt.Sprintf("%d", metrics.GetExposedPort())
	meta[NodeMetaStartTag] = strings.Join(runtime.ProcessStartTags(), ",")
	if h, e := os.Hostname(); e == nil {
		meta[NodeMetaHostName] = h
	}
	return meta
}
