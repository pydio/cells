package config

import (
	"fmt"
	"strings"

	"github.com/pydio/cells/common"
)

type (
	configMigration func(config *Config) (bool, error)
)

var (
	configsMigrations []configMigration
	configKeysRenames = map[string]string{
		"services/pydio.api.websocket":      "services/" + common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET,
		"services/pydio.grpc.gateway.data":  "services/" + common.SERVICE_GATEWAY_DATA,
		"services/pydio.grpc.gateway.proxy": "services/" + common.SERVICE_GATEWAY_PROXY,
		"services/pydio.rest.gateway.dav":   "services/" + common.SERVICE_GATEWAY_DAV,
		"services/pydio.rest.gateway.wopi":  "services/" + common.SERVICE_GATEWAY_WOPI,
		"ports/micro.api":                   "ports/" + common.SERVICE_MICRO_API,
		"services/micro.api":                "services/" + common.SERVICE_MICRO_API,
		"services/pydio.api.front-plugins":  "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS,
	}
)

func init() {
	configsMigrations = append(configsMigrations, renameServices1)
}

// UpgradeConfigsIfRequired applies all registered configMigration functions
// Returns true if there was a change and save is required, error if something nasty happened
func UpgradeConfigsIfRequired(config *Config) (bool, error) {
	var save bool
	for _, m := range configsMigrations {
		s, e := m(config)
		if e != nil {
			return false, e
		}
		if s {
			save = true
		}
	}
	return save, nil
}

func renameServices1(config *Config) (bool, error) {
	var save bool
	for oldPath, newPath := range configKeysRenames {
		oldPaths := strings.Split(oldPath, "/")
		val := config.Get(oldPaths...)
		var data interface{}
		if e := val.Scan(&data); e == nil && data != nil {
			fmt.Printf("[Configs] Upgrading: renaming key %s to %s\n", oldPath, newPath)
			config.Set(val, strings.Split(newPath, "/")...)
			config.Del(oldPaths...)
			save = true
		}
	}
	return save, nil
}
