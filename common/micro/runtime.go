package defaults

import "github.com/spf13/viper"

// RuntimeIsFork checks if the runtime is originally a fork of a different process
func RuntimeIsFork() bool {
	return viper.GetBool("is_fork")
}

// RuntimeIsCluster checks if the runtime is configured to use cluster routes
func RuntimeIsCluster() bool {
	return viper.GetString("nats_cluster_address") != ""
}
