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

// Package role is in charge of managing user roles
package role

import (
	"context"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
)

// DAO interface
type DAO interface {
	dao.DAO
	resources.DAO

	Add(role *idm.Role) (*idm.Role, bool, error)
	Delete(query sql.Enquirer) (numRows int64, e error)
	Search(query sql.Enquirer, output *[]*idm.Role) error
	Count(query sql.Enquirer) (int32, error)
}

func NewDAO(ctx context.Context, o dao.DAO) (dao.DAO, error) {
	switch o.(type) {
	case sql.DAO:
		dialector := sqlite.Open(o.Dsn())
		db, err := gorm.Open(dialector, &gorm.Config{
			//DisableForeignKeyConstraintWhenMigrating: true,
			FullSaveAssociations: true,
		})
		if err != nil {
			return nil, err
		}
		return &sqlimpl{db: db}, nil
	}
	return nil, dao.UnsupportedDriver(o)
}
