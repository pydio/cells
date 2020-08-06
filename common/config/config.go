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

package config

import (
	"time"

	"github.com/pydio/cells/common/config/file"
	"github.com/pydio/cells/x/configx"
)

var (
	ApplicationConfig configx.Values = configx.NewMap()
)

func SetApplicationConfig(scan configx.Scanner) {
	scan.Scan(&ApplicationConfig)
}

// SaveConfigs sends configuration to a local file.
func Save(ctxUser string, ctxMessage string) error {
	if GetRemoteSource() {
		return nil
	}
	return saveConfig(defaultConfig, ctxUser, ctxMessage)
}

func saveConfig(config *Config, ctxUser string, ctxMessage string) error {

	var data map[string]interface{}
	err := config.Unmarshal(&data)
	if err != nil {
		return err
	}

	if err := file.Save(GetJsonPath(), data); err != nil {
		return err
	}

	if VersionsStore != nil {
		if err := VersionsStore.Put(&file.Version{
			Date: time.Now(),
			User: ctxUser,
			Log:  ctxMessage,
			Data: data,
		}); err != nil {
			return err
		}
	}

	return nil
}
