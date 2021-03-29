package config

import (
	"fmt"
	"time"

	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
)

type versionStore struct {
	filex.VersionsStore
	store Store
}

// NewVersionStore based on a file Version Store and a store
func NewVersionStore(vs filex.VersionsStore, store Store) Store {
	return &versionStore{
		vs,
		store,
	}
}

// RegisterVersionStore sets the default version store
func RegisterVersionStore(store filex.VersionsStore) {
	VersionsStore = store
}

// Val of the path
func (v *versionStore) Val(path ...string) configx.Values {
	return v.store.Val(path...)
}

// Get access to the underlying structure at a certain path
func (v *versionStore) Get() configx.Value {
	return v.store.Get()
}

// Set new value
func (v *versionStore) Set(data interface{}) error {
	return v.store.Set(data)
}

// Del version store
func (v *versionStore) Del() error {
	return v.store.Del()
}

// Watch config changes under a path
func (v *versionStore) Watch(path ...string) (configx.Receiver, error) {
	watcher, ok := v.store.(configx.Watcher)
	if !ok {
		return nil, fmt.Errorf("no watchers")
	}

	return watcher.Watch(path...)
}

// Save the config in the underlying storage
func (v *versionStore) Save(ctxUser string, ctxMessage string) error {
	data := v.store.Get().Map()

	if err := VersionsStore.Put(&filex.Version{
		Date: time.Now(),
		User: ctxUser,
		Log:  ctxMessage,
		Data: data,
	}); err != nil {
		return err
	}

	return v.store.Save(ctxUser, ctxMessage)
}
