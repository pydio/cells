package config

import (
	"strings"

	"github.com/pydio/cells/common"
)

var (
	exposedConfigs    map[string]common.XMLSerializableForm
	restEditablePaths []string
)

// RegisterExposedConfigs let services register specific forms for configs editions
// Used by discovery service
func RegisterExposedConfigs(serviceName string, form common.XMLSerializableForm) {
	if exposedConfigs == nil {
		exposedConfigs = make(map[string]common.XMLSerializableForm)
	}
	exposedConfigs[serviceName] = form
}

// ExposedConfigsForService returns exposed configs for service
func ExposedConfigsForService(serviceName string) common.XMLSerializableForm {
	if exposedConfigs == nil {
		return nil
	}
	if e, ok := exposedConfigs[serviceName]; ok {
		return e
	}
	return nil
}

// RegisterRestEditablePath registers a config path that can be exposed and modified via the REST API
func RegisterRestEditablePath(segments ...string) {
	p := strings.Join(segments, "/")
	restEditablePaths = append(restEditablePaths, p)
}

// IsRestEditable checks if the given path is allowed to be read/written via the REST API.
func IsRestEditable(path string) bool {
	path = strings.Trim(path, "/")
	for _, p := range restEditablePaths {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}
