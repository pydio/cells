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
	"time"

	"github.com/pydio/cells/v5/common/config/revisions"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type wrappedStore Store

type versionStore struct {
	revisions.Store
	wrappedStore
}

func RevisionsStore(ctx context.Context) revisions.Store {
	return propagator.MustWithHint[revisions.Store](ctx, RevisionsKey, "revisions")
}

type RevisionsStoreOptions struct {
	Debounce time.Duration
}

type RevisionsStoreOption func(o *RevisionsStoreOptions)

func WithDebounce(d time.Duration) RevisionsStoreOption {
	return func(o *RevisionsStoreOptions) {
		o.Debounce = d
	}
}

type RevisionsProvider interface {
	AsRevisionsStore(...RevisionsStoreOption) (Store, revisions.Store)
}

// NewVersionStore based on a file Version Store and a wrappedStore
func NewVersionStore(vs revisions.Store, store Store) Store {
	return &versionStore{
		vs,
		store,
	}
}

// Val of the path
func (v *versionStore) Val(path ...string) configx.Values {
	return v.wrappedStore.Val(path...)
}

// Get access to the underlying structure at a certain path
func (v *versionStore) Get(wo ...configx.WalkOption) any {
	return v.wrappedStore.Get(wo...)
}

// Set new value
func (v *versionStore) Set(value interface{}) error {
	return v.wrappedStore.Set(value)
}

// Del version wrappedStore
func (v *versionStore) Del() error {
	return v.wrappedStore.Del()
}

// Watch config changes under a path
func (v *versionStore) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	watcher, ok := v.wrappedStore.(watch.Watcher)
	if !ok {
		return nil, fmt.Errorf("no watchers")
	}

	return watcher.Watch(opts...)
}

func (v *versionStore) As(out any) bool { return false }

func (v *versionStore) Close(ctx context.Context) error {
	return v.wrappedStore.Close(ctx)
}

func (v *versionStore) Done() <-chan struct{} {
	return v.wrappedStore.Done()
}

// Save the config in the underlying storage
func (v *versionStore) Save(ctxUser string, ctxMessage string) error {
	data := v.wrappedStore.Val().Map()

	if err := v.Store.Put(&revisions.Version{
		Date: time.Now(),
		User: ctxUser,
		Log:  ctxMessage,
		Data: data,
	}); err != nil {
		return err
	}

	return v.wrappedStore.Save(ctxUser, ctxMessage)
}

func (v *versionStore) Lock() {
	v.wrappedStore.Lock()
}

func (v *versionStore) Unlock() {
	v.wrappedStore.Unlock()
}
