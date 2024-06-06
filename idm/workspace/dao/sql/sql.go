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

package sql

import (
	"context"
	"fmt"
	"sync"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/idm/workspace"
)

type resourcesDAO resources.DAO

func init() {
	workspace.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) workspace.DAO {
	resDAO := resources.NewDAO(db)
	return &sqlimpl{
		db:           db,
		resourcesDAO: resDAO,
	}
}

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

	var exSlug string
	exist := &idm.Workspace{UUID: workspace.UUID}
	if tx := s.instance(ctx).First(exist); tx.Error == nil {
		exSlug = exist.Slug
	}
	if (exSlug == "" || exSlug != workspace.Slug) && s.slugExists(ctx, workspace.Slug) {
		index := 1
		baseSlug := workspace.Slug
		testSlug := fmt.Sprintf("%s-%v", baseSlug, index)
		for {
			if !s.slugExists(ctx, testSlug) {
				break
			}
			index++
			testSlug = fmt.Sprintf("%s-%v", baseSlug, index)
		}
		workspace.Slug = testSlug
	}

	tx := s.instance(ctx).FirstOrCreate(workspace)
	if err := tx.Error; err != nil {
		return false, err
	}

	return tx.RowsAffected == 0, nil
}

// slugExists check in the DB if the slug already exists.
func (s *sqlimpl) slugExists(ctx context.Context, slug string) bool {
	if slug == common.PydioDocstoreBinariesNamespace || slug == common.PydioThumbstoreNamespace || slug == common.PydioVersionsNamespace {
		return true
	}
	if common.IsReservedIdmWorkspaceSlug(slug) {
		return true
	}
	var count int64
	s.instance(ctx).Model(idm.Workspace{}).Where("slug = ?", slug).Count(&count)
	return count > 0
}

// Search searches
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer, workspaces *[]interface{}) error {

	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
	if er != nil {
		return er
	}

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

	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
	if er != nil {
		return 0, er
	}
	tx := db.Delete(&idm.Workspace{})

	return tx.RowsAffected, tx.Error
}

type queryBuilder idm.WorkspaceSingleQuery

func (c *queryBuilder) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	q := new(idm.WorkspaceSingleQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false, nil
	}
	count := 0

	if len(q.Uuid) > 0 {
		count++
		db = sql.GormConvertString(db, q.Not, "uuid", q.Uuid)
	}

	if len(q.Slug) > 0 {
		count++
		db = sql.GormConvertString(db, q.Not, "slug", q.Slug)
	}

	if len(q.Label) > 0 {
		count++
		db = sql.GormConvertString(db, q.Not, "label", q.Label)
	}

	if q.Scope != idm.WorkspaceScope_ANY {
		count++
		if q.Not {
			db = db.Not(map[string]interface{}{"scope": q.Scope})
		} else {
			db = db.Where(map[string]interface{}{"scope": q.Scope})
		}
	}

	if q.LastUpdated != "" {
		if lt, d, e := q.ParseLastUpdated(); e == nil {
			ref := int32(time.Now().Add(-d).Unix())
			count++
			if lt || q.Not {
				db = db.Where("last_updated < ?", ref)
			} else {
				db = db.Where("last_updated > ?", ref)
			}
		} else {
			return db, false, e
		}
	}

	if q.HasAttribute != "" {
		count++
		db = sql.GormConvertString(db, q.Not, "attributes", "*"+q.HasAttribute+":*")
	}
	if q.AttributeName != "" && q.AttributeValue != "" {
		count++
		db = sql.GormConvertString(db, q.Not, "attributes", "*"+q.AttributeName+":"+q.AttributeValue+":*")
	}

	return db, count > 0, nil

}
