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
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strings"

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/go-phpfpm-detect/fpm"
)

// Frontends
type frontendsConfig struct {
	Hosts    string
	Login    string
	Password string
	Confirm  string
}

func restoreProgress(in chan float64, done chan bool, publisher func(event *InstallProgressEvent)) {
	start := float64(40)
	end := float64(90)
	lastStep := float64(0)
	for {
		select {
		case pg := <-in:
			step := math.Floor(pg * 10) // Send only increments by 10%
			if step != lastStep {
				newPg := start + pg*(end-start)
				publisher(&InstallProgressEvent{
					Progress: int(newPg),
					Message:  fmt.Sprintf("Deploying interface assets: %d%% done...", int(step*10)),
				})
			}
			lastStep = step
		case <-done:
			return
		}
	}
}

func actionFrontendsAdd(c *install.InstallConfig) error {

	conf := &frontendsConfig{
		Hosts:    c.GetFrontendHosts(),
		Login:    c.GetFrontendLogin(),
		Password: c.GetFrontendPassword(),
		Confirm:  c.GetFrontendRepeatPassword(),
	}

	if conf.Login != "" && conf.Password != "" && conf.Confirm == conf.Password {
		sEnc := base64.StdEncoding.EncodeToString([]byte(conf.Login + "||||" + conf.Password))
		config.Set(sEnc, "defaults", "root")
	}

	// TODO REMOVE
	config.Set(conf.Hosts, "defaults", "fronts")
	config.Set(conf.Hosts, "services", "pydio.frontends", "allowed")

	config.Save("cli", "Install / Setting Frontend settings")

	// Creating log dir
	logsFolder := filepath.Join(config.ApplicationDataDir(), "logs")
	e := os.MkdirAll(logsFolder, 0755)

	return e
}

func checkPhpFpm(installConfig *install.InstallConfig) *install.CheckResult {

	requiredPhpVersion, _ := version.NewVersion("7.0")
	requiredPhpExtensions := []string{"dom", "curl", "intl", "gd"}

	var checkError error
	var configs *fpm.PhpFpmConfig
	var e error
	if installConfig.FpmAddress != "" {
		configs = &fpm.PhpFpmConfig{
			ListenAddress: installConfig.FpmAddress,
		}
		if strings.Contains(installConfig.FpmAddress, ":") {
			configs.ListenNetwork = "tcp"
		} else {
			configs.ListenNetwork = "unix"
		}
		e = fpm.DetectByDirectConnection(configs)
	} else {
		configs, e = fpm.DetectFpmInfos()
	}

	if e != nil {
		checkError = e
	} else {
		folder := filepath.Join(config.ApplicationDataDir(), "static", "pydio", "phptest")
		os.MkdirAll(folder, 0777)
		fpm.DetectPhpInfos(configs, folder)
		os.Remove(folder)
		detectedVersion, e := version.NewVersion(configs.PhpVersion)
		if e != nil {
			checkError = fmt.Errorf("Could not get php Version: (got %s, expecting version %s or higher)", configs.PhpVersion, requiredPhpVersion.String())
			configs.PhpExtensions = []string{}
		} else if detectedVersion.LessThan(requiredPhpVersion) {
			checkError = fmt.Errorf("Detected FPM but wrong PHP version: %s (expecting version %s or higher)", configs.PhpVersion, requiredPhpVersion.String())
			configs.PhpExtensions = []string{}
		} else {
			var missingExt []string
			var okExt []string
			for _, ext := range requiredPhpExtensions {
				found := false
				for _, detected := range configs.PhpExtensions {
					if detected == ext {
						found = true
						break
					}
				}
				if !found {
					missingExt = append(missingExt, ext)
				} else {
					okExt = append(okExt, ext)
				}
			}
			if len(missingExt) > 0 {
				checkError = fmt.Errorf("Detected FPM but there are some missing extensions : %s", strings.Join(missingExt, ","))
			}
			configs.PhpExtensions = okExt
		}
	}

	var checkResult *install.CheckResult
	var jsonData = make(map[string]interface{})
	if configs != nil {
		jsonData["fpm"] = configs
	}
	if checkError != nil {
		jsonData["error"] = checkError.Error()
		data, _ := json.Marshal(jsonData)
		checkResult = &install.CheckResult{
			Name:       "PHP",
			Success:    false,
			JsonResult: string(data),
		}
	} else {
		data, _ := json.Marshal(jsonData)
		checkResult = &install.CheckResult{
			Name:       "PHP",
			Success:    true,
			JsonResult: string(data),
		}
	}

	return checkResult

}
