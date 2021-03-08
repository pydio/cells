package config

import (
	"fmt"

	"github.com/pkg/errors"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
)

type versionStore struct {
	filex.VersionsStore
	store configx.Entrypoint
}

// NewVersionStore based on a file Version Store and a store
func NewVersionStore(vs filex.VersionsStore, store configx.Entrypoint) configx.Entrypoint {
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

	version, ok := data.(*filex.Version)
	if !ok {
		return errors.New("Could not save version")
	}

	if err := v.store.Set(version.Data); err != nil {
		return err
	}

	if err := VersionsStore.Put(version); err != nil {
		return err
	}

	return nil
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
