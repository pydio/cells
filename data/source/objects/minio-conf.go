/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package objects

import (
	"os"
	"path/filepath"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/minio-srv/cmd"
)

func CreateMinioConfigFile(serviceId string, accessKey string, secretKey string) (configDir string, err error) {

	var e error
	configDir, e = config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceDataObjects)
	if e != nil {
		return "", e
	}

	gatewayDir := filepath.Join(configDir, serviceId)
	gatewayFile := filepath.Join(gatewayDir, "config.json")

	// Create path to folder
	if _, err := os.Stat(gatewayFile); err != nil && os.IsNotExist(err) {
		e := os.MkdirAll(gatewayDir, 0755)
		if e != nil {
			return "", e
		}
	} else {
		// File exists: remove it and recreate (config may have changed)
		if e := os.Remove(gatewayFile); e != nil {
			return "", e
		}
	}

	configuration := cmd.CreateEmptyMinioConfig()
	configuration.Credential.AccessKey = accessKey
	configuration.Credential.SecretKey = secretKey

	// Create basic config file
	data, _ := json.Marshal(configuration)
	if file, e := os.OpenFile(gatewayFile, os.O_CREATE|os.O_WRONLY, 0755); e == nil {
		defer file.Close()
		file.Write(data)
	} else {
		return "", e
	}

	return gatewayDir, nil

}

func DeleteMinioConfigDir(serviceId string) error {

	configDir, e := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceDataObjects)
	if e != nil {
		return e
	}

	gatewayDir := filepath.Join(configDir, serviceId)
	return os.RemoveAll(gatewayDir)

}
