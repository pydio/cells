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
	"context"
	"fmt"
	"runtime"
	"sync"

	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
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
	propagator.RegisterKeyInjector[Store](ContextKey)
}

// Store defines the functionality a config must provide
type Store interface {
	configx.Entrypoint
	configx.Watcher
	As(out any) bool
	Close(ctx context.Context) error
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

func fromCtxWithCheck(ctx context.Context) Store {
	var s Store
	if ctx == nil || !propagator.Get(ctx, ContextKey, &s) {
		er := "No config found in context"
		if ctx == nil {
			er = "empty context when looking for context"
		}
		pc, file, line, ok := runtime.Caller(2)
		if ok {
			if fn := runtime.FuncForPC(pc); fn != nil {
				fmt.Printf(er+", using default store %s - %s:%d\n", fn.Name(), file, line)
				return std
			}
		}
		fmt.Println(er + ", using default store")
		return std
	}
	return s
}

// Save the config in the hard store
func Save(ctx context.Context, ctxUser string, ctxMessage string) error {
	if err := fromCtxWithCheck(ctx).Save(ctxUser, ctxMessage); err != nil {
		return err
	}

	return nil
}

// Watch for config changes for a specific path or underneath
func Watch(ctx context.Context, opts ...configx.WatchOption) (configx.Receiver, error) {
	return fromCtxWithCheck(ctx).Watch(opts...)
}

// Get access to the underlying structure at a certain path
func Get(ctx context.Context, path ...string) configx.Values {
	return fromCtxWithCheck(ctx).Val(path...)
}

// Set new values at a certain path
func Set(ctx context.Context, val interface{}, path ...string) error {
	return fromCtxWithCheck(ctx).Val(path...).Set(val)
}

// Del value at a certain path
func Del(ctx context.Context, path ...string) {
	fromCtxWithCheck(ctx).Val(path...).Del()
}

// GetAndWatch applies a callback on a current value, then watch for its changes and re-apply
// TODO : watcher should be cancellable with context
func GetAndWatch(ctx context.Context, configPath []string, callback func(values configx.Values)) {
	var ii []interface{}
	for _, s := range configPath {
		ii = append(ii, s)
	}
	values := Get(ctx, configx.FormatPath(ii...))
	callback(values)
	go func() {
		watcher, err := Watch(ctx, configx.WithPath(configPath...))
		if err != nil {
			return
		}
		for {
			event, wErr := watcher.Next()
			if wErr != nil {
				break
			}
			if event != nil {
				if val, ok := event.(configx.Values); ok {
					callback(val)
				}
			}
		}
		watcher.Stop()
	}()
}

// Temp
func Main() Store {
	return std
}
