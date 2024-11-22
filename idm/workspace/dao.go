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

// Package workspace implements workspace persistence layer.
//
// It is currently backed by a SQL db.
package workspace

import (
	"context"

	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
)

var Drivers = service.StorageDrivers{}

// DAO interface
type DAO interface {
	resources.DAO

	Migrate(ctx context.Context) error

	// Add creates or updates a workspace in the database.
	// It returns true in case of an update.
	Add(context.Context, interface{}) (bool, error)
	Del(context.Context, service2.Enquirer) (numRows int64, e error)
	Search(context.Context, service2.Enquirer, *[]interface{}) error
}
