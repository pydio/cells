package config

import "github.com/spf13/viper"

// RuntimeIsLocal check if the environment runtime config is generated locally
func RuntimeIsLocal() bool {
	return viper.GetString("config") == "local"
}

// RuntimeIsRemote check if the environment runtime config is a remote server
func RuntimeIsRemote() bool {
	return viper.GetString("config") == "remote" || viper.GetString("config") == "raft"
}
