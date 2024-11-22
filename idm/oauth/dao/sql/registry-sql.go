/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package sql

import (
	"context"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/idm/oauth"
)

func init() {
	oauth.RegistryDrivers.Register(NewRegistryDAO)
}

func NewRegistryDAO(ctx context.Context, db *gorm.DB) oauth.Registry {
	cd := &oauth.AbstractRegistry{}
	cd.Storage = newPersister(ctx, db, cd)
	return cd
}
