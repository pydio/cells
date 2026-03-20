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

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
)

var EntityDrivers = service.StorageDrivers{}

// MetaEntityDAO interface for managing meta entities and their values
type MetaEntityDAO interface {
	resources.DAO

	MigrateEntity(ctx context.Context) error

	// Entity operations
	CreateEntity(ctx context.Context, entity *idm.MetaEntity) (*idm.MetaEntity, error)
	SetEntities(ctx context.Context, entities []*idm.MetaEntity) ([]*idm.MetaEntity, error)
	GetEntity(ctx context.Context, entityUuid string) (*idm.MetaEntity, error)
}
