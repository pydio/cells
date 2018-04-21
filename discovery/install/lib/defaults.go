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
	"github.com/pydio/cells/common/utils"
)

func GenerateDefaultConfig() *install.InstallConfig {

	c := &install.InstallConfig{}
	c.DbConnectionType = "tcp"
	c.DbTCPHostname = "localhost"
	c.DbTCPPort = "3306"
	c.DbTCPName = "pydio"
	c.DbTCPUser = "root"
	c.DbTCPPassword = ""
	c.DbSocketFile = "/tmp/mysql.sock"
	c.DbSocketName = "pydio"
	c.DbSocketUser = "root"
	c.DbSocketPassword = ""
	c.DbManualDSN = "root@tcp(localhost=3306)/pydio"
	c.DsName = "pydiods1"
	c.DsPort = fmt.Sprintf("%d", utils.GetAvailablePort())
	c.DsFolder = filepath.Join(config.ApplicationDataDir(), "data")
	c.ExternalMicro = fmt.Sprintf("%d", config.Get("ports", common.SERVICE_MICRO_API).Int(0)) // Micro is already set !!
	c.ExternalGateway = fmt.Sprintf("%d", utils.GetAvailablePort())
	c.ExternalWebsocket = fmt.Sprintf("%d", utils.GetAvailablePort())
	c.ExternalFrontPlugins = fmt.Sprintf("%d", utils.GetAvailablePort())
	c.ExternalDex = fmt.Sprintf("%d", utils.GetAvailablePort())
	c.ExternalDexID = "pydio-frontend"
	c.ExternalDexSecret = utils.Randkey(24)
	c.FrontendHosts = "localhost,127.0.0.1,::1"
	c.FrontendLogin = "admin"
	c.FrontendPassword = ""
	c.FrontendRepeatPassword = ""
	c.InternalUrl = config.Get("internalUrl").String("")
	c.CheckResults = []*install.CheckResult{
		checkPhpFpm(c),
	}

	return c
}
