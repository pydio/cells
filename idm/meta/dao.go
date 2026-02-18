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
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
	"google.golang.org/protobuf/types/known/structpb"
)

var Drivers = service.StorageDrivers{}

// DAO interface
type DAO interface {
	resources.DAO
	GetNamespaceDao() NamespaceDAO
	GetEntityValueDao() EntityValueDAO

	Migrate(ctx context.Context) error
	Set(ctx context.Context, meta *idm.UserMeta) (*idm.UserMeta, string, error)
	Del(ctx context.Context, meta *idm.UserMeta) (prevValue string, e error)
	Search(ctx context.Context, query service2.Enquirer) ([]*idm.UserMeta, error)
	GetMeta(ctx context.Context, nodeUuid string, namespace string) (*idm.UserMeta, error)
}

const (
	ReservedNamespaceBookmark = "bookmark"
)

// NamespaceDAO interface
type NamespaceDAO interface {
	resources.DAO

	Upsert(ctx context.Context, ns *idm.UserMetaNamespace) (error, bool)
	Del(ctx context.Context, ns *idm.UserMetaNamespace) (e error)
	List(ctx context.Context) (map[string]*idm.UserMetaNamespace, error)
	GetJSONSchema(ctx context.Context) (*structpb.Struct, error)
	GetNamespaceSchemaSample(ctx context.Context, fieldType string, namespace string, format string) (*structpb.Struct, error)
}

// EntityValueDAO interface for managing meta entities and their values
type EntityValueDAO interface {
	resources.DAO

	Migrate(ctx context.Context) error

	// Entity operations
	CreateEntity(ctx context.Context, entity *idm.MetaEntity) (*idm.MetaEntity, error)
	SetEntities(ctx context.Context, entities []*idm.MetaEntity) ([]*idm.MetaEntity, error)
	GetEntity(ctx context.Context, entityUuid string) (*idm.MetaEntity, error)

	// Entity Value operations
	CreateEntityValues(ctx context.Context, values []*idm.EntityValue) ([]*idm.EntityValue, error)
	CreateEntityValue(ctx context.Context, value *idm.EntityValue) (*idm.EntityValue, error)
	GetEntityValues(ctx context.Context, entityUuid string) ([]*idm.EntityValue, error)
	DeleteEntity(ctx context.Context, entityUuid string) (*idm.DeleteEntityValuesResponse, error)

	// Link operations
	LinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error)
	UnlinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error)
	GetMetaEntityValues(ctx context.Context, metaUuid string) ([]*idm.EntityValue, error)
	GetMetaEntityValuesForMetas(ctx context.Context, metaUuids []string) (map[string][]*idm.EntityValue, error)
}
