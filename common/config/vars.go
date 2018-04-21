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

	"github.com/pydio/cells/common/config/envvar"
)

var (
	PydioConfigDir  = ApplicationDataDir()
	PydioConfigFile = "pydio.json"

	configMutex   = &sync.Mutex{}
	defaultConfig *Config

	once sync.Once
	done uint32
)

// Config wrapper around micro Config
type Config struct {
	config.Config
}

func init() {
	copySampleConfig(filepath.Join(PydioConfigDir, PydioConfigFile))
}

// Default Config with initialisation
func Default() *Config {
	once.Do(func() {
		defaultConfig = &Config{config.NewConfig(
			// config.WithSource(newEnvSource()),
			config.WithSource(newLocalSource()),
		)}
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

func setConfigsInFile(filename string, data interface{}) error {

	f, err := os.OpenFile(filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(fmt.Sprintf("%s", data)); err != nil {
		return err
	}

	return nil
}

// func newConfig() *Config {
// 	dir := ApplicationDataDir()
//
// 	copySampleConfig(filepath.Join(dir, pydioConfigFile))
//
// 	// Setting the sources
// 	// 1 . From the sample file
// 	// 2 . From the local save
// 	// 3 . From the server save
// 	src1 := file.NewSource(config.SourceName(filepath.Join(dir, pydioConfigFile)))
// 	src2 := NewSource(config.SourceClient(defaults.NewClient()))
//
// 	// Create a default config handle with the 3 sources
// 	return &Config{
// 		Config: config.NewConfig(
// 			config.WithSource(src2),
// 			config.WithSource(src1),
// 			config.PollInterval(5*time.Second),
// 		)}
// }

func (c *Config) Unmarshal(val interface{}) error {
	return c.Config.Get().Scan(&val)
}

func (c *Config) UnmarshalKey(key string, val interface{}) error {
	return c.Config.Get(key).Scan(&val)
}

func copySampleConfig(filename string) {

	if _, err := os.Stat(filename); err == nil {
		return
	}

	dst, err := os.Create(filename)
	if err != nil {
		return
	}

	defer dst.Close()

	_, err = dst.WriteString(SampleConfig)

	if err != nil {
		fmt.Println("Config copy failed")
		os.Exit(1)
	}

	err = dst.Sync()
	if err != nil {
		fmt.Println("Could not sync config file")
		os.Exit(1)
	}
}

func watchConfig() {
}

// GetFile that contain the local config
func GetFile() string {
	return filepath.Join(PydioConfigDir, PydioConfigFile)
}
