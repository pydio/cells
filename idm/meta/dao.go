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

// Package meta add persistence layer for meta data defined by the end users to enrich the nodes.
//
// Meta data might be defined by an admin and modified by normal end-users.
// Typically, to manage bookmarks or ratings.
package meta

import (
	"context"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/idm/meta/namespace"
)

// DAO interface
type DAO interface {
	dao.DAO
	resources.DAO

	GetNamespaceDao() namespace.DAO

	Set(meta *idm.UserMeta) (*idm.UserMeta, string, error)
	Del(meta *idm.UserMeta) (prevValue string, e error)
	Search(query sql.Enquirer) ([]*idm.UserMeta, error)
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

		nsDAO, err := namespace.NewDAO(ctx, o)
		if err != nil {
			return nil, err
		}

		return &sqlimpl{
			db:           db,
			resourcesDAO: resourcesDAO.(resources.DAO),
			nsDAO:        nsDAO.(namespace.DAO),
		}, nil
	}
	return nil, dao.UnsupportedDriver(o)
}
