package config

import (
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/hashicorp/go-version"
	"github.com/ory/hydra/x"

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
	configsMigrations = append(configsMigrations, renameServices1, setDefaultConfig, forceDefaultConfig, dsnRemoveAllowNativePassword, updateLeCaURL)
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

func setDefaultConfig(config *Config) (bool, error) {
	var save bool

	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	secret, err := x.GenerateSecret(32)
	if err != nil {
		return false, err
	}
	var syncRedirects = []string{
		"http://localhost:3000/servers/callback", // SYNC UX DEBUG PORT
	}
	// Allow a range of 30 ports for cells-sync [3636::3666]
	for i := 0; i <= 30; i++ {
		syncRedirects = append(syncRedirects, fmt.Sprintf("http://localhost:%d/servers/callback", 3636+i))
	}
	oAuthStaticConfig := map[string]interface{}{
		"client_id":      "cells-sync",
		"client_name":    "cells-sync",
		"grant_types":    []string{"authorization_code", "refresh_token"},
		"redirect_uris":  syncRedirects,
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}
	configKeys := map[string]interface{}{
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_HOST": "localhost",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_PORT": "9980",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_SSL":  true,
		"services/" + oauthSrv + "/secret":                    string(secret),
		"services/" + oauthSrv + "/staticClients":             []map[string]interface{}{oAuthStaticConfig},
	}

	for path, def := range configKeys {
		paths := strings.Split(path, "/")
		val := config.Get(paths...)
		var data interface{}
		if e := val.Scan(&data); e == nil && data == nil {
			fmt.Printf("[Configs] Upgrading: setting default config %s to %v\n", path, def)
			config.Set(def, paths...)
			save = true
		}
	}

	return save, nil
}

// updateLeCaURL changes the URL of acme API endpoint for Let's Encrypt certificate generation to v2 if it is used.
func updateLeCaURL(config *Config) (bool, error) {

	caURLKey := "cert/proxy/caUrl"
	caURLOldValue := "https://acme-v01.api.letsencrypt.org/directory"
	caURLNewValue := "https://acme-v02.api.letsencrypt.org/directory"

	paths := strings.Split(caURLKey, "/")
	val := config.Get(paths...)

	var data interface{}
	save := false
	if e := val.Scan(&data); e == nil && data != nil {
		ov := data.(string)
		if ov == caURLOldValue {
			fmt.Printf("[Configs] Upgrading: rather use acme v2 API to generate Let's Encrypt certificates\n")
			config.Set(caURLNewValue, paths...)
			save = true
		}
	}
	return save, nil
}

func forceDefaultConfig(config *Config) (bool, error) {
	var save bool
	authSrv := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH
	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	srvUrl := config.Get("defaults", "url").String("")
	if srvUrl == "" {
		return false, nil
	}

	configKeys := map[string]interface{}{
		"services/" + authSrv + "/dex/issuer":   srvUrl + "/auth/dex",
		"services/" + authSrv + "/dex/web/http": srvUrl + "/auth/dex",
		"services/" + oauthSrv + "/issuer":      srvUrl + "/oidc/",
	}

	for path, def := range configKeys {
		paths := strings.Split(path, "/")
		val := config.Get(paths...)
		var data interface{}
		if val.Scan(&data); data != def {
			fmt.Printf("[Configs] Upgrading: setting default config %s to %v\n", path, def)
			config.Set(def, paths...)
			save = true
		}
	}

	return save, nil
}

// dsnRemoveAllowNativePassword removes this part from default DSN
func dsnRemoveAllowNativePassword(config *Config) (bool, error) {
	testFile := filepath.Join(ApplicationWorkingDir(ApplicationDirServices), common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CONFIG, "version")
	if data, e := ioutil.ReadFile(testFile); e == nil && len(data) > 0 {
		ref, _ := version.NewVersion("1.4.1")
		if v, e2 := version.NewVersion(strings.TrimSpace(string(data))); e2 == nil && v.LessThan(ref) {
			dbId := config.Get("defaults", "database").String("")
			if dbId != "" {
				if dsn := config.Get("databases", dbId, "dsn").String(""); dsn != "" && strings.Contains(dsn, "allowNativePasswords=false\u0026") {
					dsn = strings.Replace(dsn, "allowNativePasswords=false\u0026", "", 1)
					fmt.Println("[Configs] Upgrading DSN to support new MySQL authentication plugin")
					config.Set(dsn, "databases", dbId, "dsn")
					return true, nil
				}
			}
		}
	}
	return false, nil
}

// Do not append to the standard migration, it is called directly inside the
// Vault/once.Do() routine, otherwise it locks config
func migrateVault(vault *Config, defaultConfig *Config) bool {
	var save bool

	for _, path := range registeredVaultKeys {
		confValue := defaultConfig.Get(path...).String("")
		if confValue != "" && vault.Get(confValue).String("") == "" {
			u := NewKeyForSecret()
			fmt.Printf("[Configs] Upgrading %s to vault key %s\n", strings.Join(path, "/"), u)
			vaultSource.Set(u, confValue, true)
			defaultConfig.Set(u, path...)
			save = true
		}
	}

	return save
}
