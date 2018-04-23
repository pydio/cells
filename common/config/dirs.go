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
	"log"
	"os"
	"path/filepath"

	"github.com/shibukawa/configdir"
	"runtime"
)

// ApplicationDataDir creates a local file to store pydio system data
func ApplicationDataDir() string {

	vendor := "Pydio"
	if runtime.GOOS == "linux" {
		vendor = "pydio"
	}
	appName := "cells"
	configDirs := configdir.New(vendor, appName)
	folders := configDirs.QueryFolders(configdir.Global)
	if len(folders) == 0 {
		folders = configDirs.QueryFolders(configdir.Local)
	}
	f := folders[0].Path
	if err := os.MkdirAll(f, 0777); err != nil {
		log.Fatal("Could not create local data dir - please check that you have the correct permissions for the folder -", f)
	}

	return f
}

// ServiceDataDir returns the applicationdir/services/serviceName and creates it if
// it does not exists
func ServiceDataDir(serviceName string) (string, error) {
	dir := filepath.Join(ApplicationDataDir(), "services", serviceName)
	return dir, os.MkdirAll(dir, 0755)
}
