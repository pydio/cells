package config

import (
	"path/filepath"
	"time"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common/config/micro"
	mvault "github.com/pydio/cells/common/config/micro/vault"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/go-os/config"
)

var (
	registeredVaultKeys []string
)

var (
	stdvault = New(micro.New(
		config.NewConfig(
			config.WithSource(
				mvault.NewVaultSource(
					filepath.Join(PydioConfigDir, "pydio-vault.json"),
					filepath.Join(PydioConfigDir, "cells-vault-key"),
					true,
				),
			),
			config.PollInterval(10*time.Second),
		),
	))
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
