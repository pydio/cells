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
	"strings"
	"time"

	"github.com/pydio/cells/x/configx"
)

func Vault() configx.Values {
	return configx.NewMap()
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
	for _, p := range registeredVaultKeys {
		if strings.Join(s, "/") == p {
			return &vaultvalues{v.config.Val(s...), v.vault.Val()}
		}
	}

	return v.config.Val(s...)
}

func (v *vault) Watch(k ...string) (configx.Receiver, error) {
	return nil, nil
}

// Del value at a certain path
func (v *vault) Del() error {
	return v.config.Del()
}

type vaultvalues struct {
	configx.Values
	vault configx.Values
}

func (v *vaultvalues) Get() configx.Value {
	uuid := v.Values.String()
	return v.vault.Val(uuid).Get()
}

func (v *vaultvalues) Set(val interface{}) error {
	uuid := v.Values.String()
	if uuid == "" {
		uuid = NewKeyForSecret()
	}

	err := v.Values.Set(uuid)
	if err != nil {
		return err
	}

	// Do we need to set a new key each time it changes ?
	v.vault.Val(uuid).Set(val)

	return nil
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
	return v.Get().String()
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
