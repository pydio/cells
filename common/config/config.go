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
	"sync"

	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	std Store
)

// Register the default config store
func Register(store Store) {
	std = store
}

type configKey struct{}

var (
	ContextKey = configKey{}
)

func init() {
	runtimecontext.RegisterGenericInjector[Store](ContextKey)
}

// Store defines the functionality a config must provide
type Store interface {
	configx.Entrypoint
	configx.Watcher
	Close() error
	Done() <-chan struct{}
	Saver
	sync.Locker
}

type DistributedStore interface {
	NewLocker(name string) sync.Locker
}

type Saver interface {
	Save(string, string) error
}

// Save the config in the hard store
func Save(ctxUser string, ctxMessage string) error {
	if err := std.Save(ctxUser, ctxMessage); err != nil {
		return err
	}

	return nil
}

// Watch for config changes for a specific path or underneath
func Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	return std.Watch(opts...)
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

// Temp
func Main() Store {
	return std
}
