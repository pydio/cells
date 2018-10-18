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

// Package configs provides tools for managing configurations
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/micro/go-config/reader"
	"github.com/pydio/go-os/config"
	"github.com/pydio/go-os/config/source/file"

	"encoding/json"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config/envvar"
	file2 "github.com/pydio/cells/common/config/file"
)

var (
	PydioConfigDir  = ApplicationDataDir()
	PydioConfigFile = "pydio.json"

	VersionsStore file2.VersionsStore
	defaultConfig *Config
	once          sync.Once
)

// Config wrapper around micro Config
type Config struct {
	config.Config
}

func init() {
	var e error
	VersionsStore, e = file2.NewStore(PydioConfigDir)
	if e != nil {
		//log.Println("Could not open versions store", e)
	}
	written, err := file2.WriteIfNotExists(filepath.Join(PydioConfigDir, PydioConfigFile), SampleConfig)
	if err != nil {
		fmt.Println("Error while trying to create default config file")
		os.Exit(1)
	}
	if written && VersionsStore != nil {
		var data interface{}
		if e := json.Unmarshal([]byte(SampleConfig), data); e == nil {
			VersionsStore.Put(&file2.Version{
				User: "cli",
				Date: time.Now(),
				Log:  "Initialize with sample config",
				Data: data,
			})
		}
	}
}

// Default Config with initialisation
func Default() *Config {
	once.Do(func() {
		defaultConfig = &Config{config.NewConfig(
			// config.WithSource(newEnvSource()),
			config.WithSource(newLocalSource()),
		)}
		if save, e := UpgradeConfigsIfRequired(defaultConfig); e == nil && save {
			saveConfig(defaultConfig, common.PYDIO_SYSTEM_USERNAME, "Configs upgrades applied")
			fmt.Println("[Configs] successfully saved config after upgrade")
		} else if e != nil {
			fmt.Errorf("[Configs] something whent wrong while upgrading configs: %s", e.Error())
		}
	})
	return defaultConfig
}

func newEnvSource() config.Source {
	return envvar.NewSource(
		config.SourceName("PYDIO"),
	)
}

func newLocalSource() config.Source {
	return file.NewSource(
		config.SourceName(filepath.Join(PydioConfigDir, PydioConfigFile)),
	)
}

func Get(path ...string) reader.Value {
	return Default().Get(path...)
}

func Set(val interface{}, path ...string) {
	Default().Set(val, path...)
}

func Del(path ...string) {
	Default().Del(path...)
}

// func newConfig() *Config {
// 	dir := ApplicationDataDir()
//
// 	copySampleConfig(filepath.Join(dir, pydioConfigFile))
//
// 	// Setting the sources
// 	// 1 . From the sample file
// 	// 2 . From the local save
// 	src1 := file.NewSource(config.SourceName(filepath.Join(dir, pydioConfigFile)))
//
// 	// Create a default config handle with the 3 sources
// 	return &Config{
// 		Config: config.NewConfig(
// 			config.WithSource(src2),
// 			config.PollInterval(5*time.Second),
// 		)}
// }

func (c *Config) Unmarshal(val interface{}) error {
	return c.Config.Get().Scan(&val)
}

func (c *Config) UnmarshalKey(key string, val interface{}) error {
	return c.Config.Get(key).Scan(&val)
}

func watchConfig() {
}

// GetJsonPath build path for json that contain the local config
func GetJsonPath() string {
	return filepath.Join(PydioConfigDir, PydioConfigFile)
}
