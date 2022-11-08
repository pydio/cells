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
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/utils/configx"
)

// Vault returns the default vault
func Vault() configx.Entrypoint {
	return stdvault
}

// RegisterVault sets the default vault
func RegisterVault(store Store) {
	stdvault = store
}

// Config holds the main structure of a configuration
type vault struct {
	config Store
	vault  Store
}

// NewVault creates a new vault with a standard config store and a vault store
func NewVault(vaultStore, configStore Store) Store {
	return &vault{
		configStore,
		vaultStore,
	}
}

func (v *vault) Close() error {
	if err := v.config.Close(); err != nil {
		return err
	}

	if err := v.vault.Close(); err != nil {
		return err
	}

	return nil
}

func (v *vault) Done() <-chan struct{} {
	return v.config.Done()
}

// Save the config in the underlying storage
func (v *vault) Save(ctxUser string, ctxMessage string) error {
	if err := v.vault.Save(ctxUser, ctxMessage); err != nil {
		return err
	}
	return v.config.Save(ctxUser, ctxMessage)
}

func (v *vault) NewLocker(name string) sync.Locker {
	configLocker := v.config.NewLocker(name)
	vaultLocker := v.vault.NewLocker(name)

	return &vaultStoreLocker{
		configLocker: configLocker,
		vaultLocker:  vaultLocker,
	}
}

type vaultStoreLocker struct {
	configLocker sync.Locker
	vaultLocker  sync.Locker
}

func (v *vaultStoreLocker) Lock() {
	if v.configLocker != nil {
		v.configLocker.Lock()
	}
	if v.vaultLocker != nil {
		v.vaultLocker.Lock()
	}
}
func (v *vaultStoreLocker) Unlock() {
	if v.configLocker != nil {
		v.configLocker.Unlock()
	}
	if v.vaultLocker != nil {
		v.vaultLocker.Unlock()
	}
}

// Get access to the underlying structure at a certain path
func (v *vault) Get() configx.Value {
	return v.vault.Get()
}

// Set new value
func (v *vault) Set(val interface{}) error {
	return v.config.Set(val)
}

// Val of the path
func (v *vault) Val(s ...string) configx.Values {
	return &vaultvalues{strings.Join(s, "/"), v.config.Val(s...), v.vault.Val()}
}

// Watch changes to the path
func (v *vault) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	return v.config.Watch(opts...)
}

// Del the value
func (v *vault) Del() error {
	return v.config.Del()
}

type vaultvalues struct {
	path string
	configx.Values
	vault configx.Values
}

// Val of the path
func (v *vaultvalues) Val(s ...string) configx.Values {
	return &vaultvalues{v.path + "/" + strings.Join(s, "/"), v.Values.Val(s...), v.vault.Val()}
}

// Get retrieves the value as saved in the config (meaning the uuid if it is a registered key)
// Data will need to be retrieved from the vault via other means
func (v *vaultvalues) Get() configx.Value {
	return v.Values
}

// Set ensures that the keys that have been target are saved encrypted in the vault
func (v *vaultvalues) Set(val interface{}) error {
	// Checking we have a registered value
	for _, p := range registeredVaultKeys {
		if v.path == p {
			return v.set(val)
		}

		if strings.HasPrefix(p, v.path) {
			// First removing keys that don't exist anymore
			current := v.Values.Map()

			// Need to loop through all below
			switch m := val.(type) {
			case map[string]string:
				for k := range current {
					if _, ok := m[k]; !ok {
						if err := v.Values.Val(k).Del(); err != nil {
							return err
						}
					}
				}

				for mm, vv := range m {
					if err := (&vaultvalues{v.path + "/" + mm, v.Values.Val(mm), v.vault}).Set(vv); err != nil {
						return err
					}
				}
				return nil
			case map[string]interface{}:
				for k := range current {
					if _, ok := m[k]; !ok {
						if err := v.Values.Val(k).Del(); err != nil {
							return err
						}
					}
				}

				for mm, vv := range m {
					if err := (&vaultvalues{v.path + "/" + mm, v.Values.Val(mm), v.vault}).Set(vv); err != nil {
						return err
					}
				}
				return nil
			}
		}
	}

	vval, ok := val.(configx.Values)
	if ok {
		if vval.Get() == nil {
			// Nothing to set
			return nil
		}
		return v.Values.Set(vval.Get())
	}

	return v.Values.Set(val)
}

// Default value
func (v *vaultvalues) Default(i interface{}) configx.Value {
	return v.Get().Default(i)
}

// Bool value
func (v *vaultvalues) Bool() bool {
	return v.Get().Bool()
}

// Int value
func (v *vaultvalues) Int() int {
	return v.Get().Int()
}

// Int64 value
func (v *vaultvalues) Int64() int64 {
	return v.Get().Int64()
}

// Bytes value
func (v *vaultvalues) Bytes() []byte {
	return v.Get().Bytes()
}

// Duration value
func (v *vaultvalues) Duration() time.Duration {
	return v.Get().Duration()
}

// String value
func (v *vaultvalues) String() string {
	return v.Get().Default("").String()
}

// StringMap value
func (v *vaultvalues) StringMap() map[string]string {
	return v.Get().StringMap()
}

// StringArray value
func (v *vaultvalues) StringArray() []string {
	return v.Get().StringArray()
}

// Slice value
func (v *vaultvalues) Slice() []interface{} {
	return v.Get().Slice()
}

// Map value
func (v *vaultvalues) Map() map[string]interface{} {
	return v.Get().Map()
}

// MarshalJSON
func (v *vaultvalues) MarshalJSON() ([]byte, error) {
	return []byte(v.Values.String()), nil
}

func (v *vaultvalues) set(val interface{}) error {
	uuid := v.Values.String()

	// Get the current value and do nothing if it hasn't change
	current := v.vault.Val(uuid)

	if current.String() == val.(string) || uuid == val.(string) {
		// already set
		return nil
	}

	// Removing old value if it was set
	if uuid != "" {
		if current.String() != "" {
			if err := current.Del(); err != nil {
				return err
			}
		}
	}

	uuid = NewKeyForSecret()

	err := v.Values.Set(uuid)
	if err != nil {
		return err
	}

	// Do we need to set a new key each time it changes ?
	return v.vault.Val(uuid).Set(val)
}
