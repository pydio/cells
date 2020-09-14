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
	//vaultConfig *Config
	//vaultSource *vault.VaultSource
	//vaultOnce sync.Once

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

// Vault Config with initialisation
// func Vault() config.Config {

// 	vaultOnce.Do(func() {
// 		if GetRemoteSource() {
// 			// loading remoteSource will trigger a call to defaults.NewClient()
// 			vaultConfig = &Config{config.NewConfig(
// 				config.WithSource(newRemoteSource(config.SourceName("vault"))),
// 				config.PollInterval(10*time.Second),
// 			)}
// 			return
// 		}

// 		// appDir := ApplicationWorkingDir()
// 		// Rather use same application directory as the one defined in vars.go to enable overriding of default location
// 		appDir := PydioConfigDir
// 		storePath := filepath.Join(appDir, "pydio-vault.json")

// 		// Load keyPath from default location or from central config
// 		keyPath := Get("defaults", "vault-key").Default(filepath.Join(appDir, "cells-vault-key")).String()

// 		vaultSource = vault.NewVaultSource(storePath, keyPath, false)

// 		vaultConfig = &Config{config.NewConfig(
// 			config.WithSource(vaultSource),
// 			config.PollInterval(10*time.Second),
// 		)}
// 		if save := migrateVault(vaultConfig, defaultConfig); save {
// 			Save(common.PYDIO_SYSTEM_USERNAME, "Upgrade configs to vault")
// 		}
// 	})
// 	return vaultConfig
// }

func RegisterVaultKey(s ...string) {
	registeredVaultKeys = append(registeredVaultKeys, configx.FormatPath(s))
}

func NewKeyForSecret() string {
	return uuid.New()
}

func GetSecret(uuid string) configx.Values {
	return stdvault.Val(uuid)
}

func SetSecret(uuid string, val string) {
	// if GetRemoteSource() {
	// 	remote.UpdateRemote("vault", val, uuid)
	// 	return
	// }

	stdvault.Val(uuid).Set(val)
	// vaultSource.Set(uuid, val, true)
}

func DelSecret(uuid string) {
	stdvault.Val(uuid).Del()
}
