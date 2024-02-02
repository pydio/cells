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
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql/resources"
	"gorm.io/gorm"
)

const (
	ReservedNamespaceBookmark = "bookmark"
)

// DAO interface
type DAO interface {
	resources.DAO

	Add(ctx context.Context, ns *idm.UserMetaNamespace) error
	Del(ctx context.Context, ns *idm.UserMetaNamespace) (e error)
	List(ctx context.Context) (map[string]*idm.UserMetaNamespace, error)
}

func NewDAO(db *gorm.DB) DAO {
	resourcesDAO := resources.NewDAO(db)
	return &sqlimpl{db: db, resourcesDAO: resourcesDAO}
}
