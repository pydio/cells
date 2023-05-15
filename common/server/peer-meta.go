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
	"strings"

	"github.com/pydio/cells/v4/common/runtime"
)

func InitPeerMeta(meta map[string]string) {
	if _, ok := meta[runtime.NodeMetaPID]; !ok {
		meta[runtime.NodeMetaPID] = runtime.GetPID()
	}

	if _, ok := meta[runtime.NodeMetaParentPID]; !ok {
		meta[runtime.NodeMetaParentPID] = runtime.GetPPID()
	}

	if _, ok := meta[runtime.NodeMetaStartTag]; !ok {
		meta[runtime.NodeMetaStartTag] = strings.Join(runtime.ProcessStartTags(), ",")
	}

	if _, ok := meta[runtime.NodeMetaHostName]; !ok {
		meta[runtime.NodeMetaHostName] = runtime.GetHostname()
	}

	if _, ok := meta[runtime.NodeMetaHostName]; !ok {
		meta[runtime.NodeMetaHostName] = runtime.GetHostname()
	}

	if _, ok := meta[runtime.NodeMetaCluster]; !ok {
		meta[runtime.NodeMetaCluster] = runtime.Cluster()
	}

	if _, ok := meta[runtime.NodeMetaCapacities]; !ok {
		caps := runtime.GetStringSlice(runtime.KeyNodeCapacity)
		if len(caps) > 0 {
			meta[runtime.NodeMetaCapacities] = strings.Join(caps, "|")
		}
	}
}
