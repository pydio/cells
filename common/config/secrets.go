package config

import (
	"github.com/pborman/uuid"
	"github.com/pydio/cells/x/configx"
)

var (
	registeredVaultKeys []string
)

var (
	stdvault Store
)

// RegisterVaultKey adds a key to the configuration so that the value
// associated with the key is swapped to an encrypted value
func RegisterVaultKey(s ...string) {
	registeredVaultKeys = append(registeredVaultKeys, configx.FormatPath(s))
}

// NewKeyForSecret creates a new random key
func NewKeyForSecret() string {
	return uuid.New()
}

// GetSecret returns the non encrypted value for a uuid
func GetSecret(uuid string) configx.Values {
	if uuid == "" {
		return configx.New()
	}
	return stdvault.Val(uuid)
}

// SetSecret set the value for a uuid in the vault
func SetSecret(uuid string, val string) {
	stdvault.Val(uuid).Set(val)
}

// DelSecret deletes the value of a uuid in the vault
func DelSecret(uuid string) {
	stdvault.Val(uuid).Del()
}
