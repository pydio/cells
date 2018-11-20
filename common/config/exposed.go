package config

import "github.com/pydio/cells/common"

var (
	exposedConfigs map[string]common.XMLSerializableForm
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
