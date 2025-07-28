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

	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/runtime"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/net"
)

var (
	PartialDefaultConfig *install.InstallConfig
)

// MergeWithDefaultConfig merges a parsed config (from yaml or json) with missing fields
// values from Default config.
func MergeWithDefaultConfig(conf *install.InstallConfig) error {
	def := GenerateDefaultConfig()
	var target map[string]interface{}
	// Create a generic view of the default and unmarshall conf into it
	defM, _ := json.Marshal(def)
	if e := json.Unmarshal(defM, &target); e != nil {
		return e
	}
	// Avoid duplicating sites
	site := conf.ProxyConfig
	conf.ProxyConfig = nil
	confM, _ := json.Marshal(conf)
	if e := json.Unmarshal(confM, &target); e != nil {
		return e
	}
	// Remarsh / unmarsh to an install config
	final, _ := json.Marshal(&target)
	if e := json.Unmarshal(final, &conf); e != nil {
		return e
	}
	conf.ProxyConfig = site
	if conf.FrontendPassword != "" {
		conf.FrontendRepeatPassword = conf.FrontendPassword
	}
	return nil
}

// GenerateDefaultConfig creates InstallConfig with default values
func GenerateDefaultConfig() *install.InstallConfig {

	if PartialDefaultConfig != nil {
		return PartialDefaultConfig
	}

	c := &install.InstallConfig{}
	c.DbConnectionType = "tcp"
	c.DbTCPHostname = "127.0.0.1"
	c.DbTCPPort = "3306"
	c.DbTCPName = "cells"
	c.DbTCPUser = "root"
	c.DbTCPPassword = ""
	c.DbSocketFile = "/tmp/mysql.sock"
	c.DbSocketName = "cells"
	c.DbSocketUser = "root"
	c.DbSocketPassword = ""
	c.DbManualDSN = "mysql://root@tcp(127.0.0.1:3306)/cells?parseTime=true"
	c.DsName = "pydiods1"
	c.DsPort = fmt.Sprintf("%d", net.GetAvailablePort())
	c.DsFolder = runtime.ApplicationWorkingDir(runtime.ApplicationDirData)
	c.FrontendApplicationTitle = "Pydio Cells"
	c.FrontendDefaultLanguage = "en-us"
	c.FrontendLogin = "admin"
	c.FrontendPassword = ""
	c.FrontendRepeatPassword = ""
	c.CheckResults = []*install.CheckResult{}

	return c
}
