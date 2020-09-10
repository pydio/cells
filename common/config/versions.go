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

func NewVersionStore(vs filex.VersionsStore, store configx.Entrypoint) configx.Entrypoint {
	return &versionStore{
		vs,
		store,
	}
}

func (v *versionStore) Val(path ...string) configx.Values {
	return v.store.Val(path...)
}

func (v *versionStore) Get() configx.Value {
	return v.store.Get()
}

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

func (v *versionStore) Del() error {
	return v.store.Del()
}

func (v *versionStore) Watch(path ...string) (configx.Receiver, error) {
	watcher, ok := v.store.(configx.Watcher)
	if !ok {
		return nil, fmt.Errorf("no watchers")
	}

	return watcher.Watch(path...)
}
