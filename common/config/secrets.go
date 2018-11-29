package config

import (
	"path/filepath"
	"sync"
	"time"

	"github.com/micro/go-config/reader"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config/remote"
	"github.com/pydio/cells/common/config/vault"
	"github.com/pydio/go-os/config"
)

var (
	vaultConfig *Config
	vaultSource *vault.VaultSource
	vaultOnce   sync.Once

	registeredVaultKeys [][]string
)

// Vault Config with initialisation
func Vault() config.Config {

	vaultOnce.Do(func() {
		if GetRemoteSource() {
			// loading remoteSource will trigger a call to defaults.NewClient()
			vaultConfig = &Config{config.NewConfig(
				config.WithSource(newRemoteSource(config.SourceName("vault"))),
				config.PollInterval(10*time.Second),
			)}
			return
		}

		// appDir := ApplicationDataDir()
		// Rather use same application directory as the one defined in vars.go to enable overriding of default location
		appDir := PydioConfigDir
		storePath := filepath.Join(appDir, "pydio-vault.json")

		// Load keyPath from default location or from central config
		keyPath := filepath.Join(appDir, "cells-vault-key")
		keyPath = Default().Get("defaults", "vault-key").String(keyPath)

		vaultSource = vault.NewVaultSource(storePath, keyPath, false)

		vaultConfig = &Config{config.NewConfig(
			config.WithSource(vaultSource),
			config.PollInterval(10*time.Second),
		)}
		if save := migrateVault(vaultConfig, defaultConfig); save {
			Save(common.PYDIO_SYSTEM_USERNAME, "Upgrade configs to vault")
		}
	})
	return vaultConfig
}

func RegisterVaultKey(path ...string) {
	registeredVaultKeys = append(registeredVaultKeys, path)
}

func NewKeyForSecret() string {
	return uuid.New()
}

func GetSecret(uuid string) reader.Value {
	return Vault().Get(uuid)
}

func SetSecret(uuid string, val string) {
	if GetRemoteSource() {
		remote.UpdateRemote("vault", val, uuid)
		return
	}
	Vault().Set(val, uuid)
	vaultSource.Set(uuid, val, true)
}

func DelSecret(uuid string) {
	if GetRemoteSource() {
		remote.DeleteRemote("vault", uuid)
		return
	}
	vaultSource.Delete(uuid, true)
}
