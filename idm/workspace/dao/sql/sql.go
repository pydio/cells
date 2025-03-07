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
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/storage/sql"
	resources2 "github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/idm/workspace"
)

type Resources resources2.DAO

func init() {
	workspace.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) workspace.DAO {
	return &sqlimpl{
		AbstractResources: sql.NewAbstractResources(db).WithModels(func() []any {
			return []any{&idm.Workspace{}}
		}),
	}
}

// Impl of the SQL interface
type sqlimpl struct {
	*sql.AbstractResources
}

// Add to the SQL DB.
func (s *sqlimpl) Add(ctx context.Context, in interface{}) (bool, error) {

	ws, ok := in.(*idm.Workspace)
	if !ok {
		return false, errors.WithMessage(errors.InvalidParameters, "Wrong input type")
	}

	var exSlug string
	exist := &idm.Workspace{UUID: ws.UUID}
	session := s.Session(ctx)
	isUpdate := false
	if tx := session.First(exist); tx.Error == nil {
		exSlug = exist.Slug
		isUpdate = true
	}
	if (exSlug == "" || exSlug != ws.Slug) && s.slugExists(ctx, ws.Slug) {
		index := 1
		baseSlug := ws.Slug
		testSlug := fmt.Sprintf("%s-%v", baseSlug, index)
		for {
			if !s.slugExists(ctx, testSlug) {
				break
			}
			index++
			testSlug = fmt.Sprintf("%s-%v", baseSlug, index)
		}
		ws.Slug = testSlug
	}

	if tx := session.Clauses(clause.OnConflict{UpdateAll: true}).Create(ws); tx.Error != nil {
		return false, tx.Error
	}

	return isUpdate, nil
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
	s.Session(ctx).Model(idm.Workspace{}).Where("slug = ?", slug).Count(&count)
	return count > 0
}

// Search searches
func (s *sqlimpl) Search(ctx context.Context, query service.Enquirer, workspaces *[]interface{}) error {

	rqb, er := resources2.PrepareQueryBuilder(&idm.Workspace{}, s.Resources, s.Session(ctx).NamingStrategy)
	if er != nil {
		return er
	}
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), rqb).Build(ctx, s.Session(ctx))
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
func (s *sqlimpl) Del(ctx context.Context, query service.Enquirer) (int64, error) {

	rqb, er := resources2.PrepareQueryBuilder(&idm.Workspace{}, s.Resources, s.Session(ctx).NamingStrategy)
	if er != nil {
		return 0, er
	}
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), rqb).Build(ctx, s.Session(ctx))
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
		db = sql.GormConvertString(db, q.Not, "attributes", `*"`+q.HasAttribute+`":*`)
	}
	if q.AttributeName != "" && q.AttributeValue != "" {
		count++
		db = sql.GormConvertString(db, q.Not, "attributes", `*"`+q.AttributeName+`":"`+q.AttributeValue+`"*`)
	}

	return db, count > 0, nil

}
