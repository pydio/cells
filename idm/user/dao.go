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

// Package user implements basic user and group persistence layer.
//
// It is currently backed by a SQL db.
package user

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/idm"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/sql/index"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
)

var Drivers = service.StorageDrivers{}

// DAO interface
type DAO interface {
	resources.DAO
	index.DAO

	Migrate(ctx context.Context) error

	// Add creates or updates a user in the underlying repository.
	// It returns the resulting user, a true flag in case of an update
	// of an existing user and/or an error if something went wrong.

	Add(context.Context, interface{}) (interface{}, []*idm.User, error)
	Del(context.Context, service2.Enquirer, chan *idm.User) (numRows int64, e error)
	Search(context.Context, service2.Enquirer, *[]interface{}, ...bool) error
	Count(context.Context, service2.Enquirer, ...bool) (int, error)
	Bind(ctx context.Context, userName string, password string) (*idm.User, error)
	CleanRole(ctx context.Context, roleId string) error
	TouchUser(ctx context.Context, userUuid string) error
	LoginModifiedAttr(ctx context.Context, oldName, newName string) (int64, error)
}
