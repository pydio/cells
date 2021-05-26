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
	"runtime"

	"github.com/shibukawa/configdir"
)

type ApplicationDirType int

const (
	ApplicationDirData ApplicationDirType = iota
	ApplicationDirLogs
	ApplicationDirServices
)

// ApplicationWorkingDir creates a local file to store pydio system data
func ApplicationWorkingDir(dirType ...ApplicationDirType) string {

	var f string
	var d ApplicationDirType = -1 // Set unknown value!
	if len(dirType) > 0 {
		d = dirType[0]
	}
	if len(dirType) == 0 && os.Getenv("CELLS_WORKING_DIR") != "" {
		f = os.Getenv("CELLS_WORKING_DIR")
	} else if d == ApplicationDirData && os.Getenv("CELLS_DATA_DIR") != "" {
		f = os.Getenv("CELLS_DATA_DIR")
	} else if d == ApplicationDirLogs && os.Getenv("CELLS_LOG_DIR") != "" {
		f = os.Getenv("CELLS_LOG_DIR")
	} else if d == ApplicationDirServices && os.Getenv("CELLS_SERVICES_DIR") != "" {
		f = os.Getenv("CELLS_SERVICES_DIR")
	} else {
		var vendor string
		switch runtime.GOOS {
		case "linux", "freebsd":
			vendor = "pydio"
		default:
			vendor = "Pydio"
		}
		appName := "cells"
		configDirs := configdir.New(vendor, appName)
		folders := configDirs.QueryFolders(configdir.Global)
		if len(folders) == 0 {
			folders = configDirs.QueryFolders(configdir.Local)
		}
		f = folders[0].Path
		if len(dirType) > 0 {
			// Recheck base folder
			if os.Getenv("CELLS_WORKING_DIR") != "" {
				f = os.Getenv("CELLS_WORKING_DIR")
			}
			switch d {
			case ApplicationDirData:
				f = filepath.Join(f, "data")
			case ApplicationDirLogs:
				f = filepath.Join(f, "logs")
			case ApplicationDirServices:
				f = filepath.Join(f, "services")
			}
		}
	}

	if err := os.MkdirAll(f, 0755); err != nil {
		log.Fatal("Could not create local data dir - please check that you have the correct permissions for the folder -", f)
	}

	return f
}

// ServiceDataDir returns the applicationdir/services/serviceName and creates it if
// it does not exists
func ServiceDataDir(serviceName string) (string, error) {
	dir := filepath.Join(ApplicationWorkingDir(ApplicationDirServices), serviceName)
	return dir, os.MkdirAll(dir, 0755)
}
