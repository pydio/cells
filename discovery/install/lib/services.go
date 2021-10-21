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
	oauthWeb := common.ServiceWebNamespace_ + common.ServiceOAuth
	secret, err := x.GenerateSecret(32)
	if err != nil {
		return err
	}

	// Adding the config for activities and chat
	acDir, _ := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceActivity)
	chatDir, _ := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceChat)

	// Easy finding usage of srvUrl
	if err := config.SetDatabase(common.ServiceGrpcNamespace_+common.ServiceActivity, "boltdb", filepath.Join(acDir, "activities.db")); err != nil {
		return err
	}
	if err := config.SetDatabase(common.ServiceGrpcNamespace_+common.ServiceChat, "boltdb", filepath.Join(acDir, "chat.db")); err != nil {
		return err
	}

	// Easy finding usage of srvUrl
	configKeys := map[string]interface{}{
		"databases/" + common.ServiceGrpcNamespace_ + common.ServiceActivity + "/driver": "boltdb",
		"databases/" + common.ServiceGrpcNamespace_ + common.ServiceActivity + "/dsn":    filepath.Join(acDir, "activities.db"),
		"databases/" + common.ServiceGrpcNamespace_ + common.ServiceChat + "/driver":     "boltdb",
		"databases/" + common.ServiceGrpcNamespace_ + common.ServiceChat + "/dsn":        filepath.Join(chatDir, "chat.db"),
		"services/" + oauthWeb + "/insecureRedirects":                                    []string{"#insecure_binds...#/auth/callback"},
		"services/" + oauthWeb + "/secret":                                               string(secret),
	}

	for path, def := range configKeys {
		val := config.Get(path)
		var data interface{}
		if val.Scan(&data); data != def {
			val.Set(def)
			save = true
		}
	}

	if save {
		config.Save("cli", "Install / Setting Dex default settings")
	}

	return nil
}
