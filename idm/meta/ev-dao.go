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

var EntityValueDrivers = service.StorageDrivers{}

// EntityValueDAO interface for managing meta entities and their values
type EntityValueDAO interface {
	resources.DAO

	MigrateEV(ctx context.Context) error

	// CreateEntityValues Entity Value operations
	CreateEntityValues(ctx context.Context, values []*idm.EntityValue) ([]*idm.EntityValue, error)
	CreateEntityValue(ctx context.Context, value *idm.EntityValue) (*idm.EntityValue, error)
	GetEntityValues(ctx context.Context, entityUuid string) ([]*idm.EntityValue, error)

	// LinkMetaValue Link operations
	LinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error)
	UnlinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error)
	GetMetaEntityValues(ctx context.Context, metaUuid string) ([]*idm.EntityValue, error)
	GetMetaEntityValuesMap(ctx context.Context, metaUuids []string) (map[string][]*idm.EntityValue, error)
}
