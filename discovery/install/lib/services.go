/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package lib

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/ory/hydra/x"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

type DexClient struct {
	Id                     string
	Name                   string
	Secret                 string
	RedirectURIs           []string
	IdTokensExpiry         string
	RefreshTokensExpiry    string
	OfflineSessionsSliding bool
}

func actionConfigsSet(c *install.InstallConfig) error {
	save := false
	url := config.Get("defaults", "url").String("")

	// OAuth web
	oauthWeb := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	config.Set(fmt.Sprintf("%s/oidc/", url), "services", oauthWeb, "issuer")

	secret, err := x.GenerateSecret(32)
	if err != nil {
		return err
	}
	config.Set(string(secret), "services", oauthWeb, "secret")

	// Adding the config for activities and chat
	acDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY)
	chatDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT)

	// Easy finding usage of srvUrl
	configKeys := map[string]interface{}{
		"services/" + oauthWeb + "/issuer":                                                  url + "/oidc/",
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY + "/driver": "boltdb",
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY + "/dsn":    filepath.Join(acDir, "activities.db"),
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT + "/driver":     "boltdb",
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT + "/dsn":        filepath.Join(chatDir, "chat.db"),
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

	configSliceKeys := map[string][]string{
		"services/" + oauthWeb + "/insecureRedirects": []string{url + "/auth/callback"},
	}

	for path, def := range configSliceKeys {
		paths := strings.Split(path, "/")
		val := config.Get(paths...)
		var data []string

		if val.Scan(&data); !stringSliceEqual(data, def) {
			fmt.Printf("[Configs] Upgrading: setting default config %s to %v\n", path, def)
			config.Set(def, paths...)
			save = true
		}
	}

	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 config.DefaultOAuthClientID,
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{url + "/auth/callback"},
		"post_logout_redirect_uris": []string{url + "/auth/logout"},
		"response_types":            []string{"code", "token", "id_token"},
		"scope":                     "openid email profile pydio offline",
	}

	statics := config.Get("services", oauthWeb, "staticClients")
	var data []map[string]interface{}
	if err := statics.Scan(&data); err == nil {
		var saveStatics bool
		var addCellsFrontend = true
		for _, static := range data {
			if clientID, ok := static["client_id"].(string); addCellsFrontend && ok {
				if clientID == config.DefaultOAuthClientID {
					addCellsFrontend = false
				}
			}

			for _, n := range []string{"redirect_uris", "post_logout_redirect_uris"} {
				if redirs, ok := static[n].([]interface{}); ok {
					var newRedirs []string
					for _, redir := range redirs {
						if strings.HasSuffix(redir.(string), "/oauth2/oob") && redir.(string) != url+"/oauth2/oob" {
							newRedirs = append(newRedirs, url+"/oauth2/oob")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/callback") && redir.(string) != url+"/auth/callback" {
							newRedirs = append(newRedirs, url+"/auth/callback")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/logout") && redir.(string) != url+"/auth/logout" {
							newRedirs = append(newRedirs, url+"/auth/logout")
							saveStatics = true
						} else {
							newRedirs = append(newRedirs, redir.(string))
						}
					}
					static[n] = newRedirs
				}
			}
		}
		if addCellsFrontend {
			data = append([]map[string]interface{}{oAuthFrontendConfig}, data...)
			saveStatics = true
		}
		if saveStatics {
			fmt.Println("[Configs] Upgrading: updating staticClients")
			config.Set(data, "services", oauthWeb, "staticClients")
			save = true
		}
	}

	if save {
		config.Save("cli", "Install / Setting Dex default settings")
	}

	return nil
}

func stringSliceEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}
