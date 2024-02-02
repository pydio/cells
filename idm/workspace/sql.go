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

package workspace

import (
	"context"
	"embed"
	"gorm.io/gorm"
	"sync"
	"time"

	goqu "github.com/doug-martin/goqu/v9"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddWorkspace":            `replace into idm_workspaces (uuid, label, description, attributes, slug, scope, last_updated) values (?, ?, ?, ?, ?, ?, ?)`,
		"GetWorkspace":            `select uuid from idm_workspaces where uuid = ?`,
		"ExistsWorkspace":         `select uuid, slug from idm_workspaces where uuid = ?`,
		"ExistsWorkspaceWithSlug": `select count(uuid) from idm_workspaces where slug = ?`,
	}
)

type resourcesDAO resources.DAO

// Impl of the SQL interface
type sqlimpl struct {
	db *gorm.DB

	once *sync.Once

	resourcesDAO
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.AutoMigrate(&idm.Workspace{})
	})

	return db
}

// Init handler for the SQL DAO
//func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {
//
//	// super
//	//if er := s.DAO.Init(ctx, options); er != nil {
//	//	return er
//	//}
//
//	db := s.db
//
//	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_roles") }
//
//	s.instance().AutoMigrate(&idm.WorkspaceORM{})
//
//	s.ResourcesGORM = &resources.ResourcesGORM{DB: s.db}
//	s.ResourcesGORM.Init(ctx, options)
//
//	return nil
//}

// Add to the SQL DB.
func (s *sqlimpl) Add(ctx context.Context, in interface{}) (bool, error) {

	workspace, ok := in.(*idm.Workspace)
	if !ok {
		return false, errors.BadRequest(common.ServiceWorkspace, "Wrong type")
	}

	tx := s.instance(ctx).FirstOrCreate(workspace)
	if err := tx.Error; err != nil {
		return false, err
	}

	return tx.RowsAffected > 0, nil
}

// slugExists check in the DB if the slug already exists.
func (s *sqlimpl) slugExists(ctx context.Context, slug string) bool {
	if slug == common.PydioDocstoreBinariesNamespace || slug == common.PydioThumbstoreNamespace || slug == common.PydioVersionsNamespace {
		return true
	}
	if common.IsReservedIdmWorkspaceSlug(slug) {
		return true
	}

	tx := s.instance(ctx).First(&idm.Workspace{Slug: slug})

	return tx.RowsAffected > 0
}

// Search searches
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer, workspaces *[]interface{}) error {

	db := sql.NewGormQueryBuilder(query, new(queryBuilder), s.resourcesDAO.(sql.Converter)).Build(ctx, s.instance(ctx)).(*gorm.DB)

	var workspaceORMs []*idm.Workspace

	tx := db.Find(&workspaceORMs)
	if tx.Error != nil {
		return tx.Error
	}

	for _, workspaceORM := range workspaceORMs {
		*workspaces = append(*workspaces, (*idm.Workspace)(workspaceORM))
	}

	return nil
}

// Del from the SQL DB
func (s *sqlimpl) Del(ctx context.Context, query sql.Enquirer) (int64, error) {

	db := sql.NewGormQueryBuilder(query, new(queryBuilder), s.resourcesDAO.(sql.Converter)).Build(ctx, s.instance(ctx)).(*gorm.DB)

	tx := db.Delete(&idm.Workspace{})

	return tx.RowsAffected, tx.Error
}

type queryBuilder idm.WorkspaceSingleQuery

func (c *queryBuilder) Convert(ctx context.Context, val *anypb.Any, in any) (out any, ok bool) {
	db, ok := in.(*gorm.DB)
	if !ok {
		return
	}

	q := new(idm.WorkspaceSingleQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false
	}

	var expressions []goqu.Expression

	if len(q.Uuid) > 0 {
		if q.Not {
			db.Not(map[string]interface{}{"uuid": q.Uuid})
		} else {
			db.Where(map[string]interface{}{"uuid": q.Uuid})
		}
	}

	if len(q.Slug) > 0 {
		if q.Not {
			db.Not(map[string]interface{}{"slug": q.Slug})
		} else {
			db.Where(map[string]interface{}{"slug": q.Slug})
		}
	}

	if len(q.Label) > 0 {
		if q.Not {
			db.Not(map[string]interface{}{"label": q.Label})
		} else {
			db.Where(map[string]interface{}{"label": q.Label})
		}
	}

	if q.Scope != idm.WorkspaceScope_ANY {
		expressions = append(expressions, goqu.C("scope").Eq(q.Scope))
	}

	if q.LastUpdated != "" {
		if lt, d, e := q.ParseLastUpdated(); e == nil {
			ref := int32(time.Now().Add(-d).Unix())
			if lt || q.Not {
				db.Where("last_updated < ?", ref)
			} else {
				db.Where("last_updated > ?", ref)
			}
		}
	}

	if q.HasAttribute != "" {
		if q.Not {
			db.Not("attributes LIKE ?", "%"+q.HasAttribute+":%")
		} else {
			db.Where("attributes LIKE ?", "%"+q.HasAttribute+":%")
		}
	}
	if q.AttributeName != "" && q.AttributeValue != "" {
		if q.Not {
			db.Not("attributes LIKE ?", "%"+q.AttributeName+":"+q.AttributeValue+":%")
		} else {
			db.Where("attributes LIKE ?", "%"+q.AttributeName+":"+q.AttributeValue+":%")
		}
	}

	if len(expressions) == 0 {
		return nil, true
	}
	return goqu.And(expressions...), true

}
