package defaults

import "github.com/spf13/viper"

func RuntimeIsFork() bool {
	return viper.GetBool("is_fork")
}

func RuntimeIsCluster() bool {
	return viper.GetString("registry_cluster_routes") != ""
}
