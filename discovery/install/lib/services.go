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

	url := config.Get("defaults", "url").String("")
	authGrpc := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH

	config.Set(fmt.Sprintf("%s/auth/dex", url), "services", authGrpc, "dex", "issuer")
	config.Set(fmt.Sprintf("%s/auth/dex", url), "services", authGrpc, "dex", "web", "http")

	// Rewrite Dex Static Clients
	dexStaticClient := &DexClient{
		Id:                     c.GetExternalDexID(),
		Name:                   c.GetExternalDexID(),
		Secret:                 c.GetExternalDexSecret(),
		RedirectURIs:           []string{fmt.Sprintf("%s/login/callback", url)},
		IdTokensExpiry:         "10m",
		RefreshTokensExpiry:    "30m",
		OfflineSessionsSliding: true,
	}
	config.Set([]*DexClient{dexStaticClient}, "services", authGrpc, "dex", "staticClients")

	// OAuth web
	oauthWeb := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	config.Set(fmt.Sprintf("%s/oidc/", url), "services", oauthWeb, "issuer")

	secret, err := x.GenerateSecret(32)
	if err != nil {
		return err
	}
	config.Set(string(secret), "services", oauthWeb, "secret")

	// OIDC Static client - special case for srvUrl/oauth2/oob url
	statics := config.Get("services", oauthWeb, "staticClients")
	var data []map[string]interface{}
	if err := statics.Scan(&data); err == nil {
		var saveStatics bool
		for _, static := range data {
			if redirs, ok := static["redirect_uris"].([]interface{}); ok {
				var newRedirs []string
				for _, redir := range redirs {
					if strings.HasSuffix(redir.(string), "/oauth2/oob") && redir.(string) != url+"/oauth2/oob" {
						newRedirs = append(newRedirs, url+"/oauth2/oob")
						saveStatics = true
					} else {
						newRedirs = append(newRedirs, redir.(string))
					}
				}
				static["redirect_uris"] = newRedirs
			}
		}
		if saveStatics {
			config.Set(data, "services", oauthWeb, "staticClients")
		}
	}

	// Adding the config for activities and chat
	// TODO - make it better
	acDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY)
	if e != nil {
		return e
	}
	config.Set(map[string]string{
		"driver": "boltdb",
		"dsn":    filepath.Join(acDir, "activities.db"),
	}, "databases", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACTIVITY)

	chatDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT)
	if e != nil {
		return e
	}
	config.Set(map[string]string{
		"driver": "boltdb",
		"dsn":    filepath.Join(chatDir, "chat.db"),
	}, "databases", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CHAT)

	config.Save("cli", "Install / Setting Dex default settings")

	return nil
}
