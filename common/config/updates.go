package config

import (
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/x/configx"
)

// GetUpdatesConfigs gather update configs from correct location
func GetUpdatesConfigs() configx.Values {
	return Get(configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceUpdate))
}
