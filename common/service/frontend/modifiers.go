package frontend

import "context"

// RegistryModifier is a func type for dynamically filtering output of the registry
type RegistryModifier func(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error

// PluginModifier is a func type for dynamically filtering the content of a plugin (e.g enabled/disabled),
// based on the current status
type PluginModifier func(ctx context.Context, status RequestStatus, plugin Plugin) error

// PluginModifier is a func type for dynamically filtering the content of a plugin (e.g enabled/disabled),
// based on the current status
type BootConfModifier func(bootConf *BootConf) error

var (
	pluginsModifier   []PluginModifier
	bootConfModifiers []BootConfModifier
	modifiers         []RegistryModifier
)

// RegisterRegModifier appends a RegistryModifier to the list
func RegisterRegModifier(modifier RegistryModifier) {
	modifiers = append(modifiers, modifier)
}

// ApplyRegModifiers can filter the output of registry before sending, based on status
func ApplyRegModifiers(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error {

	for _, m := range modifiers {
		if e := m(ctx, status, registry); e != nil {
			return e
		}
	}

	return nil
}

// RegisterPluginModifier appends a PluginModifier to the list
func RegisterPluginModifier(modifier PluginModifier) {
	pluginsModifier = append(pluginsModifier, modifier)
}

// ApplyPluginModifiers is called to apply all registered modifiers on a given plugin
func ApplyPluginModifiers(ctx context.Context, status RequestStatus, plugin Plugin) error {

	for _, m := range pluginsModifier {
		if e := m(ctx, status, plugin); e != nil {
			return e
		}
	}

	return nil

}

// RegisterPluginModifier appends a BootConfModifier to the list
func RegisterBootConfModifier(modifier BootConfModifier) {
	bootConfModifiers = append(bootConfModifiers, modifier)
}

// ApplyPluginModifiers is called to apply all registered modifiers on the boot configuration
func ApplyBootConfModifiers(bootConf *BootConf) error {

	for _, m := range bootConfModifiers {
		if e := m(bootConf); e != nil {
			return e
		}
	}

	return nil

}
