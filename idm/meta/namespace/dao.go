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

// Package namespace provides operations for managing user-metadata namespaces
package namespace

import (
	"context"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
)

const (
	ReservedNamespaceBookmark = "bookmark"
)

// DAO interface
type DAO interface {
	resources.DAO

	Add(ns *idm.UserMetaNamespace) error
	Del(ns *idm.UserMetaNamespace) (e error)
	List() (map[string]*idm.UserMetaNamespace, error)
}

func NewDAO(ctx context.Context, o dao.DAO) (dao.DAO, error) {
	switch v := o.(type) {
	case sql.DAO:
		dialector := sqlite.Open(v.Dsn())
		db, err := gorm.Open(dialector, &gorm.Config{
			//DisableForeignKeyConstraintWhenMigrating: true,
			FullSaveAssociations: true,
			Logger:               logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			return nil, err
		}

		resourcesDAO, err := resources.NewDAO(ctx, o)
		if err != nil {
			return nil, err
		}

		return &sqlimpl{db: db, resourcesDAO: resourcesDAO.(resources.DAO)}, nil
	}
	return nil, dao.UnsupportedDriver(o)
}
