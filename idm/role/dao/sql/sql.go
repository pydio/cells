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
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/storage/sql"
	resources2 "github.com/pydio/cells/v4/common/storage/sql/resources"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/role"
)

func init() {
	role.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) (role.DAO, error) {
	return &sqlimpl{
		AbstractResources: sql.NewAbstractResources(db).WithModels(func() []any {
			return []any{&idm.Role{}}
		}),
	}, nil
}

// Impl of the SQL interface
type sqlimpl struct {
	*sql.AbstractResources
}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(ctx context.Context, role *idm.Role) (*idm.Role, bool, error) {
	if role.Label == "" {
		return nil, false, errors.WithMessage(errors.InvalidParameters, "Role cannot have an empty label")
	}

	if role.LastUpdated == 0 {
		role.LastUpdated = int32(time.Now().Unix())
	}

	if role.Uuid == "" {
		role.Uuid = uuid.New()
	}

	var update bool
	exist := &idm.Role{Uuid: role.Uuid}
	var er error
	session := s.Session(ctx)
	if t := session.First(exist); t.Error == nil {
		update = true
		if tx := session.Updates(role); tx.Error != nil {
			er = tx.Error
		}
	} else {
		if tx := session.Create(role); tx.Error != nil {
			er = tx.Error
		}
	}
	return role, update, er
}

func (s *sqlimpl) Count(ctx context.Context, query service.Enquirer) (int32, error) {
	session := s.Session(ctx)
	rqb, err := resources2.PrepareQueryBuilder(&idm.Role{}, s.Resources, session.NamingStrategy)
	if err != nil {
		return 0, err
	}
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), rqb).Build(ctx, session)
	if er != nil {
		return 0, er
	}

	var count int64

	tx := db.Model(&idm.Role{}).Count(&count)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return int32(count), nil
}

// Search in the SQL DB.
func (s *sqlimpl) Search(ctx context.Context, query service.Enquirer, roles *[]*idm.Role) error {

	session := s.Session(ctx)
	rqb, err := resources2.PrepareQueryBuilder(&idm.Role{}, s.Resources, session.NamingStrategy)
	if err != nil {
		return err
	}
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), rqb).Build(ctx, session)
	if er != nil {
		return er
	}

	var roleORMs []*idm.Role

	tx := db.Model(&idm.Role{}).Find(&roleORMs)
	if tx.Error != nil {
		return tx.Error
	}

	for _, roleORM := range roleORMs {
		*roles = append(*roles, (*idm.Role)(roleORM))
	}

	return nil
}

// Delete from the SQL DB
func (s *sqlimpl) Delete(ctx context.Context, query service.Enquirer) (int64, error) {
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryBuilder)).Build(ctx, s.Session(ctx))
	if er != nil {
		return 0, er
	}

	tx := db.Model(&idm.Role{}).Delete(&idm.Role{})
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

type queryBuilder idm.RoleSingleQuery

func (c *queryBuilder) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	q := new(idm.RoleSingleQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return db, false, nil
	}
	count := 0

	if len(q.Uuid) > 0 {
		count++
		db = sql.GormConvertString(db, q.Not, "uuid", q.Uuid...)
	}
	if len(q.Label) > 0 {
		count++
		db = sql.GormConvertString(db, q.Not, "label", q.Label)
	}
	if q.IsGroupRole {
		count++
		if q.Not {
			db = db.Not(map[string]interface{}{"group_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"group_role": 1})
		}
	}
	if q.IsUserRole {
		count++
		if q.Not {
			db = db.Not(map[string]interface{}{"user_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"user_role": 1})
		}
	}
	if q.IsTeam {
		count++
		if q.Not {
			db = db.Not(map[string]interface{}{"team_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"team_role": 1})
		}
	}
	if q.HasAutoApply {
		count++
		if q.Not {
			db = db.Where(map[string]interface{}{"auto_applies": ""})
		} else {
			db = db.Not(map[string]interface{}{"auto_applies": ""})
		}
	}

	return db, count > 0, nil
}
