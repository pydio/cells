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

package config

import (
	"fmt"
	"time"

	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/go-os/config"
)

var (
	std   Store = New(micro.New(config.NewConfig(config.WithSource(memory.NewSource(memory.WithJSON([]byte{}))))))
	local Store = std
)

// Register the default config store
func Register(store Store) {
	std = store
}

// RegisterLocal registers local store
func RegisterLocal(store Store) {
	local = store
}

// Store defines the functionality a config must provide
type Store interface {
	configx.Entrypoint

	configx.Watcher

	// Save with context
	Save(string, string) error // Should we not do it in a function ?
}

// New creates a configuration provider with in-memory access
func New(store configx.Entrypoint) Store {
	ret := &cacheconfig{
		store: store,
	}

	v := store.Get()

	// we initialise the store and save it in memory for easy access
	if v != nil {
		im := configx.New(configx.WithJSON())
		im.Set(v)
		ret.im = im
	} else {
		im := configx.New(configx.WithJSON())
		ret.im = im
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
				<-time.After(10 * time.Second)
				continue
			}

			ret.im.Set(resp)
		}
	}()

	return ret
}

// These fonctions use the standard config

// Save the config in the hard store
func Save(ctxUser string, ctxMessage string) error {
	er := std.Save(ctxUser, ctxMessage)
	if er != nil {
		fmt.Println("Cannot save config", er)
	}
	return er
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
	return std.Val(path...).Set(val)
}

// Del value at a certain path
func Del(path ...string) {
	std.Val(path...).Del()
}

// Config holds the main structure of a configuration
type cacheconfig struct {
	im    configx.Values     // in-memory data
	store configx.Entrypoint // underlying storage
}

// Save the config in the underlying storage
func (c *cacheconfig) Save(ctxUser string, ctxMessage string) error {
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
	if c.im == nil {
		return nil
	}
	return c.im.Get()
}

// Set new values at a certain path
func (c *cacheconfig) Set(v interface{}) error {
	return c.store.Set(v)
}

// Del value at a certain path
func (c *cacheconfig) Del() error {
	return c.store.Del()
}

func (c *cacheconfig) Val(k ...string) configx.Values {
	return &cacheValues{c.im, c.store, k}
}

type cacheValues struct {
	configx.Values
	store configx.Entrypoint
	path  []string
}

func (c *cacheValues) Val(s ...string) configx.Values {
	path := configx.StringToKeys(append(c.path, s...)...)
	return &cacheValues{c.Values, c.store, path}
}

func (c *cacheValues) Get() configx.Value {
	return c.Values.Val(c.path...).Get()
}

// We store it in the cache and in the store
func (c *cacheValues) Set(v interface{}) error {
	err := c.Values.Val(c.path...).Set(v)
	if err != nil {
		return err
	}

	return c.store.Val(c.path...).Set(v)
}

func (c *cacheValues) Del() error {
	err := c.Values.Val(c.path...).Del()
	if err != nil {
		return err
	}

	return c.store.Val(c.path...).Del()
}

func (c *cacheValues) Default(i interface{}) configx.Value {
	return c.Values.Val(c.path...).Default(i)
}

func (c *cacheValues) String() string {
	return c.Values.Val(c.path...).String()
}

func (c *cacheValues) MarshalJSON() ([]byte, error) {
	return []byte(c.Values.Val(c.path...).String()), nil
}

func (c *cacheValues) Bool() bool {
	return c.Values.Val(c.path...).Bool()
}
func (c *cacheValues) Bytes() []byte {
	return c.Values.Val(c.path...).Bytes()
}
func (c *cacheValues) Int() int {
	return c.Values.Val(c.path...).Int()
}
func (c *cacheValues) Int64() int64 {
	return c.Values.Val(c.path...).Int64()
}
func (c *cacheValues) Duration() time.Duration {
	return c.Values.Val(c.path...).Duration()
}
func (c *cacheValues) StringMap() map[string]string {
	return c.Values.Val(c.path...).StringMap()
}
func (c *cacheValues) StringArray() []string {
	return c.Values.Val(c.path...).StringArray()
}
func (c *cacheValues) Slice() []interface{} {
	return c.Values.Val(c.path...).Slice()
}
func (c *cacheValues) Map() map[string]interface{} {
	return c.Values.Val(c.path...).Map()
}
func (c *cacheValues) Scan(i interface{}) error {
	return c.Values.Val(c.path...).Scan(i)
}
