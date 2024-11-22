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

// Package key provides a persistence layer for user key.
package key

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/service"
)

var Drivers = service.StorageDrivers{}

// DAO is a protocol for user key storing
type DAO interface {
	Migrate(ctx context.Context) error
	SaveKey(ctx context.Context, key *encryption.Key, version ...int) error
	GetKey(ctx context.Context, owner string, KeyID string) (*encryption.Key, int, error)
	ListKeys(ctx context.Context, owner string) ([]*encryption.Key, error)
	DeleteKey(ctx context.Context, owner string, keyID string) error
}
