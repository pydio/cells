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
	"time"

	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
	"github.com/pydio/go-os/config"
)

var (
	std Store = New(micro.New(config.NewConfig(config.WithSource(memory.NewSource(memory.WithJSON([]byte{}))))))
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
func New(store configx.Entrypoint) Store {
	im := configx.New(configx.WithJSON())

	v := store.Get()

	// we initialise the store and save it in memory for easy access
	if v != nil {
		v.Scan(&im)
	}

	go func() {
		watcher, ok := store.(configx.Watcher)
		if !ok {
			return
		}

		w, err := watcher.Watch()
		if err != nil {
			return
		}

		for {
			resp, err := w.Next()
			if err != nil {
				continue
			}

			resp.Scan(&im)
		}
	}()

	return &cacheconfig{
		im:    im,
		store: store,
	}
}

// Config holds the main structure of a configuration
type cacheconfig struct {
	im    configx.Values     // in-memory data
	store configx.Entrypoint // underlying storage
}

// Save the config in the underlying storage
func (c *cacheconfig) Save(ctxUser string, ctxMessage string) error {
	// Retrieving the value in the map
	data := c.im.Map()

	// And saving it to the store
	if err := c.store.Set(&filex.Version{
		Date: time.Now(),
		User: ctxUser,
		Log:  ctxMessage,
		Data: data,
	}); err != nil {
		return err
	}

	return nil
}

// Watch for config changes for a specific path or underneath
func (c *cacheconfig) Watch(path ...string) (configx.Receiver, error) {
	watcher, ok := c.store.(configx.Watcher)
	if !ok {
		return nil, fmt.Errorf("no watchers")
	}

	return watcher.Watch(path...)
}

// Get access to the underlying structure at a certain path
func (c *cacheconfig) Get() configx.Value {
	return c.im.Get()
}

// Set new values at a certain path
func (c *cacheconfig) Set(v interface{}) error {
	return c.store.Set(v)
}

// Del value at a certain path
func (c *cacheconfig) Del() error {
	return c.im.Del()
}

func (c *cacheconfig) Val(k ...string) configx.Values {
	return &cacheValues{c.im.Val(k...), c.store, k}
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
	return std.Val(path...)
}

// Set new values at a certain path
func Set(val interface{}, path ...string) error {
	fmt.Println(path, val)
	return std.Val(path...).Set(val)
}

// Del value at a certain path
func Del(path ...string) {
	std.Val(path...).Del()
}

type cacheValues struct {
	configx.Values
	store configx.Entrypoint
	path  []string
}

// We store it in the cache and in the store
func (c *cacheValues) Set(v interface{}) error {

	err := c.Values.Set(v)
	if err != nil {
		return err
	}

	return c.store.Val(c.path...).Set(v)
}
