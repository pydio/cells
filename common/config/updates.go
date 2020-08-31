package config

import (
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/x/configx"
)

// GetUpdatesConfigs gather update configs from correct location
func GetUpdatesConfigs() configx.Values {
	return Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE)
}
