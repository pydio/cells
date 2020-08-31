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
	"fmt"
	"path/filepath"
	"time"

	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
)

var (
	std = New(micro.NewLocalSource(filepath.Join(PydioConfigDir, PydioConfigFile)))
)

func Register(store Store) {
	std = store
}

type Store interface {
	configx.Entrypoint

	configx.Watcher

	// Save with context
	Save(string, string) error // Should we not do it in a function ?
}

// New creates a configuration provider with in-memory access
func New(store configx.KVStore) Store {
	im := configx.NewMap()

	v := store.Get()

	// we initialise the store and save it in memory for easy access
	if v != nil {
		v.Scan(&im)
	}

	return &config{
		im:    im,
		store: store,
	}
}

// Config holds the main structure of a configuration
type config struct {
	im    configx.Values  // in-memory data
	store configx.KVStore // underlying storage
}

// Save the config in the underlying storage
func (c *config) Save(ctxUser string, ctxMessage string) error {
	// if GetRemoteSource() {
	// 	return nil
	// }

	data := c.im.Map()

	// We'll see what we do about that
	if err := c.store.Set(data); err != nil {
		return err
	}

	if VersionsStore != nil {
		if err := VersionsStore.Put(&filex.Version{
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

// Watch for config changes for a specific path or underneath
func (c *config) Watch(path ...string) (configx.Receiver, error) {
	watcher, ok := c.store.(configx.Watcher)
	if !ok {
		return nil, fmt.Errorf("no watchers")
	}

	return watcher.Watch(path...)
}

// Get access to the underlying structure at a certain path
func (c *config) Get() configx.Value {
	return c.im.Get()
}

// Set new values at a certain path
func (c *config) Set(v interface{}) error {
	// tmpConfig := Config{Config: config.NewConfig(config.WithSource(memory.NewSource(Default().Bytes())))}
	// tmpConfig.Set(val, path...)

	// // Make sure to init vault
	// Vault()

	// // Filter values
	// hasFilter := false
	// for _, p := range registeredVaultKeys {
	// 	savedUuid := Default().Get(p...).String("")
	// 	newConfig := tmpConfig.Get(p...).String("")
	// 	if newConfig != savedUuid {
	// 		hasFilter = true
	// 		if savedUuid != "" {
	// 			vaultSource.Delete(savedUuid, true)
	// 		}
	// 		if newConfig != "" {
	// 			// Replace value with a secret Uuid
	// 			fmt.Println("Replacing config value with a secret UUID", strings.Join(p, "/"))
	// 			newUuid := NewKeyForSecret()
	// 			e := vaultSource.Set(newUuid, newConfig, true)
	// 			if e != nil {
	// 				fmt.Println("Something went wrong when saving file!", e.Error())
	// 			}
	// 			tmpConfig.Set(newUuid, p...)
	// 		}
	// 	}
	// }

	// if hasFilter {
	// 	// Replace fully from tmp
	// 	// Does not work probably due to a bug in the underlying TP library
	// 	// Default().Set(tmpConfig.Get())

	// 	// Rather explicitly replace all values.
	// 	var all map[string]interface{}
	// 	json.Unmarshal(tmpConfig.Bytes(), &all)
	// 	for k, v := range all {
	// 		ApplicationConfig.Val(k).Set(v)
	// 	}
	// } else {
	// Just update default config
	return c.im.Set(v)
	// }
}

// Del value at a certain path
func (c *config) Del() error {
	// if GetRemoteSource() {
	// 	remote.DeleteRemote("config", path...)
	// 	return
	// }
	return c.im.Del()
}

func (c *config) Val(k ...configx.Key) configx.Values {
	return c.im.Val(k...)
}

// These fonctions use the standard config

// Save the config in the hard store
func Save(ctxUser string, ctxMessage string) error {
	return std.Save(ctxUser, ctxMessage)
}

// Watch for config changes for a specific path or underneath
func Watch(path ...string) (configx.Receiver, error) {
	return std.Watch(path...)
}

// Get access to the underlying structure at a certain path
func Get(path ...string) configx.Values {
	return std.Val(path)
}

// Set new values at a certain path
func Set(val interface{}, path ...string) {
	std.Val(path).Set(val)
}

// Del value at a certain path
func Del(path ...string) {
	std.Val(path).Del()
}
