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

package cmd

import (
	"github.com/spf13/pflag"
)

// addNatsFlags registers necessary flags to connect to the registry
func addNatsFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("nats_address", ":4222", "NATS server address")
	flags.String("nats_cluster_address", "", "NATS server cluster address")
	flags.String("nats_cluster_routes", "", "NATS server cluster routes")
	flags.Int("nats_monitor_port", 8222, "Expose nats monitoring endpoints on a given port")
}

func addNatsStreamingFlags(flags *pflag.FlagSet) {
	flags.String("nats_streaming_cluster_id", "cells", "NATS streaming cluster ID")
	flags.String("nats_streaming_store", "MEMORY", "NATS streaming store type")
	flags.Bool("nats_streaming_clustered", false, "NATS streaming clustered")
	flags.String("nats_streaming_cluster_node_id", "", "NATS streaming cluster node id")
	flags.Bool("nats_streaming_cluster_bootstrap", false, "NATS streaming bootstrap cluster")
	flags.String("nats_streaming_cluster_peers", "", "NATS streaming list of cluster peers")
}
