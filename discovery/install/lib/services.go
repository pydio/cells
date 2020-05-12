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

	// OAuth web
	oauthWeb := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	secret, err := x.GenerateSecret(32)
	if err != nil {
		return err
	}

	// Adding the config for activities and chat
	acDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY)
	chatDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT)

	// Easy finding usage of srvUrl
	configKeys := map[string]interface{}{
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY + "/driver": "boltdb",
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_ACTIVITY + "/dsn":    filepath.Join(acDir, "activities.db"),
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT + "/driver":     "boltdb",
		"databases/" + common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_CHAT + "/dsn":        filepath.Join(chatDir, "chat.db"),
		"services/" + oauthWeb + "/insecureRedirects":                                       []string{"#insecure_binds...#/auth/callback"},
		"services/" + oauthWeb + "/secret":                                                  string(secret),
	}

	for path, def := range configKeys {
		paths := strings.Split(path, "/")
		val := config.Get(paths...)
		var data interface{}
		if val.Scan(&data); data != def {
			config.Set(def, paths...)
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
