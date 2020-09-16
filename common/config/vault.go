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
	"reflect"
	"strings"
	"time"

	"github.com/pydio/cells/x/configx"
)

func Vault() configx.Entrypoint {
	return stdvault
}

func RegisterVault(store Store) {
	stdvault = store
}

// Config holds the main structure of a configuration
type vault struct {
	config Store
	vault  Store
}

func NewVault(configStore Store, vaultStore Store) Store {
	return &vault{
		configStore,
		vaultStore,
	}
}

// Save the config in the underlying storage
func (v *vault) Save(ctxUser string, ctxMessage string) error {
	return v.config.Save(ctxUser, ctxMessage)
}

// // Watch for config changes for a specific path or underneath
// func (v *vault) Watch(path ...string) (configx.Receiver, error) {
// 	return v.config.Watch(path...)
// }

// Get access to the underlying structure at a certain path
func (v *vault) Get() configx.Value {
	return v.vault.Get()
}

// Set new values at a certain path
func (v *vault) Set(val interface{}) error {
	return fmt.Errorf("not implemented")
}

func (v *vault) Val(s ...string) configx.Values {
	return &vaultvalues{strings.Join(s, "/"), v.config.Val(s...), v.vault.Val()}
}

func (v *vault) Watch(k ...string) (configx.Receiver, error) {
	return v.config.Watch(k...)
}

// Del value at a certain path
func (v *vault) Del() error {
	return v.config.Del()
}

type vaultvalues struct {
	path string
	configx.Values
	vault configx.Values
}

func (v *vaultvalues) Get() configx.Value {
	for _, p := range registeredVaultKeys {
		if v.path == p {
			uuid := v.Values.String()
			fmt.Println("uuid ? ", uuid)
			return v.vault.Val(uuid).Get()
		}
	}

	return v.Values.Default("")
}

func (v *vaultvalues) set(val interface{}) error {
	uuid := v.Values.String()
	if uuid == "" {
		uuid = NewKeyForSecret()
	}

	fmt.Println("v.Values ", reflect.TypeOf(v.Values), v.Values.String())
	err := v.Values.Set(uuid)
	if err != nil {
		return err
	}

	// Do we need to set a new key each time it changes ?
	return v.vault.Val(uuid).Set(val)
}

func (v *vaultvalues) Set(val interface{}) error {
	// Checking we have a registered value
	for _, p := range registeredVaultKeys {

		if v.path == p {
			fmt.Println(v.path, p)
			return v.set(val)
		}

		if strings.HasPrefix(p, v.path) {
			// Need to loop through all below
			switch m := val.(type) {
			case map[string]string:
				for mm, vv := range m {
					if err := (&vaultvalues{v.path + "/" + mm, v.Values.Val(mm), v.vault.Val()}).Set(vv); err != nil {
						return err
					}
				}
				return nil
			case map[string]interface{}:
				for mm, vv := range m {
					if err := (&vaultvalues{v.path + "/" + mm, v.Values.Val(mm), v.vault.Val()}).Set(vv); err != nil {
						return err
					}
				}
				return nil
			}
		}
	}

	fmt.Println("Setting val anyway ", v.path, val, reflect.TypeOf(v.Values))
	return v.Values.Set(val)
}

func (v *vaultvalues) Default(i interface{}) configx.Value {
	return v.Get().Default(i)
}
func (v *vaultvalues) Bool() bool {
	return v.Get().Bool()
}
func (v *vaultvalues) Int() int {
	return v.Get().Int()
}
func (v *vaultvalues) Int64() int64 {
	return v.Get().Int64()
}
func (v *vaultvalues) Bytes() []byte {
	return v.Get().Bytes()
}
func (v *vaultvalues) Duration() time.Duration {
	return v.Get().Duration()
}
func (v *vaultvalues) String() string {
	return v.Get().Default("").String()
}
func (v *vaultvalues) StringMap() map[string]string {
	return v.Get().StringMap()
}
func (v *vaultvalues) StringArray() []string {
	return v.Get().StringArray()
}
func (v *vaultvalues) Slice() []interface{} {
	return v.Get().Slice()
}
func (v *vaultvalues) Map() map[string]interface{} {
	return v.Get().Map()
}
