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

	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	registeredVaultKeys []string
)

// RegisterVaultKey adds a key to the configuration so that the value
// associated with the key is swapped to an encrypted value
func RegisterVaultKey(s ...string) {
	registeredVaultKeys = append(registeredVaultKeys, configx.FormatPath(s))
}

// NewKeyForSecret creates a new random key
func NewKeyForSecret() string {
	return uuid.New()
}

// GetSecret returns the non encrypted value for a uuid
func GetSecret(ctx context.Context, uuid string) configx.Values {
	if uuid == "" {
		return configx.New()
	}
	return propagator.MustWithHint[Store](ctx, VaultKey, "vault").Val(uuid)
}

// SetSecret set the value for a uuid in the vault
func SetSecret(ctx context.Context, uuid string, val string) error {
	v := propagator.MustWithHint[Store](ctx, VaultKey, "vault")
	if er := v.Val(uuid).Set(val); er == nil {
		return v.Save("system ", "saving "+uuid)
	} else {
		return er
	}
}

// DelSecret deletes the value of a uuid in the vault
func DelSecret(ctx context.Context, uuid string) error {
	v := propagator.MustWithHint[Store](ctx, VaultKey, "vault")
	if er := v.Val(uuid).Del(); er == nil {
		return v.Save("system", "deleting "+uuid)
	} else {
		return er
	}
}
