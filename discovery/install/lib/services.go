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

	config.Set(c.GetExternalMicro(), "services", common.SERVICE_MICRO_API, "port")
	config.Set(c.GetExternalGateway(), "services", common.SERVICE_GATEWAY_DATA, "port")
	config.Set(c.GetExternalWebsocket(), "services", common.SERVICE_GATEWAY_NAMESPACE_+common.SERVICE_WEBSOCKET, "port")
	config.Set(c.GetExternalFrontPlugins(), "services", common.SERVICE_WEB_NAMESPACE_+common.SERVICE_FRONT_STATICS, "port")
	config.Set(c.GetExternalDAV(), "services", common.SERVICE_GATEWAY_DAV, "port")
	config.Set(c.GetExternalWOPI(), "services", common.SERVICE_GATEWAY_WOPI, "port")

	config.Set(fmt.Sprintf("http://127.0.0.1:%s/dex", c.GetExternalDex()), "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex", "issuer")
	config.Set(fmt.Sprintf("0.0.0.0:%s", c.GetExternalDex()), "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex", "web", "http")

	dexStaticClient := &DexClient{
		Id:                     c.GetExternalDexID(),
		Name:                   c.GetExternalDexID(),
		Secret:                 c.GetExternalDexSecret(),
		RedirectURIs:           []string{"http://127.0.0.1:5555/callback"},
		IdTokensExpiry:         "10m",
		RefreshTokensExpiry:    "30m",
		OfflineSessionsSliding: true,
	}
	config.Set([]*DexClient{dexStaticClient}, "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex", "staticClients")

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
