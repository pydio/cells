package config

import (
	"github.com/pydio/cells/common"
)

// GetUpdatesConfigs gather update configs from correct location
func GetUpdatesConfigs() common.ConfigValues {

	url := Default().Get("defaults", "update", "updateUrl").String("")
	pKey := Default().Get("defaults", "update", "publicKey").String("")
	channel := Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE, "channel").String("stable")
	configs := Map{}
	configs.Set("updateUrl", url)
	configs.Set("channel", channel)
	configs.Set("publicKey", pKey)
	return configs

}
