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
	flags.Bool("nats_streaming_cluster_node_id", false, "NATS streaming cluster node id")
	flags.Bool("nats_streaming_cluster_bootstrap", false, "NATS streaming bootstrap cluster")
	flags.String("nats_streaming_cluster_peers", "", "NATS streaming list of cluster peers")
}
