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
	"sync"

	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type configKey struct{}

type vaultKey struct{}

type revisionsKey struct{}

var (
	ContextKey   = configKey{}
	VaultKey     = vaultKey{}
	RevisionsKey = revisionsKey{}
)

func init() {
	propagator.RegisterKeyInjector[Store](ContextKey)
	propagator.RegisterKeyInjector[Store](VaultKey)
	propagator.RegisterKeyInjector[Store](RevisionsKey)
}

// Store defines the functionality a config must provide
type Store interface {
	configx.Storer
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

// Save the config in the hard wrappedStore
func Save(ctx context.Context, ctxUser string, ctxMessage string) error {
	if err := propagator.MustWithHint[Store](ctx, ContextKey, "config").Save(ctxUser, ctxMessage); err != nil {
		return err
	}

	return nil
}

// Watch for config changes for a specific path or underneath
func Watch(ctx context.Context, opts ...configx.WatchOption) (configx.Receiver, error) {
	return propagator.MustWithHint[Store](ctx, ContextKey, "config").Watch(opts...)
}

// WatchCombined watches for different config paths
func WatchCombined(ctx context.Context, paths [][]string, opts ...configx.WatchOption) (configx.Receiver, error) {
	cfg := propagator.MustWithHint[Store](ctx, ContextKey, "config")
	var rr []configx.Receiver
	for _, path := range paths {
		oo := append([]configx.WatchOption{configx.WithPath(path...)}, opts...)
		if r, e := cfg.Watch(oo...); e != nil {
			return nil, e
		} else {
			rr = append(rr, r)
		}
	}
	return configx.NewCombinedWatcher(rr), nil
}

// Get access to the underlying structure at a certain path
func Get(ctx context.Context, path ...string) configx.Values {
	return propagator.MustWithHint[Store](ctx, ContextKey, "config").Context(ctx).Val(path...)
}

// Set new values at a certain path
func Set(ctx context.Context, val interface{}, path ...string) error {
	return propagator.MustWithHint[Store](ctx, ContextKey, "config").Context(ctx).Val(path...).Set(val)
}

// Del value at a certain path
func Del(ctx context.Context, path ...string) {
	propagator.MustWithHint[Store](ctx, ContextKey, "config").Context(ctx).Val(path...).Del()
}

// GetAndWatch applies a callback on a current value, then watch for its changes and re-apply
// TODO : watcher should be cancellable with context
func GetAndWatch(store Store, configPath []string, callback func(values configx.Values)) {
	var ii []interface{}
	for _, s := range configPath {
		ii = append(ii, s)
	}
	values := store.Val(configx.FormatPath(ii...))
	if values.Get() != nil {
		callback(values)
	}
	go func() {
		watcher, err := store.Watch(configx.WithPath(configPath...))
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
