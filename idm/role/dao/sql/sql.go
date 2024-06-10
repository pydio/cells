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
	"sync"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/role"
)

func init() {
	role.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) (role.DAO, error) {
	return &sqlimpl{
		db:           db,
		resourcesDAO: resources.NewDAO(db),
	}, nil
}

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
		db.AutoMigrate(&idm.Role{})
	})

	return db
}

// Init handler for the SQL DAO
//func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {
//
//	db := s.db
//	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_roles") }
//
//	s.instance().AutoMigrate(&idm.RoleORM{})
//
//	s.ResourcesGORM = &resources.ResourcesGORM{DB: s.db}
//	s.ResourcesGORM.Init(ctx, options)
//
//	/* super
//	if er := s.DAO.Init(ctx, options); er != nil {
//		return er
//	}
//
//	// Preparing the resources
//	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_roles.uuid").(*resources.ResourcesSQL)
//	if err := s.ResourcesSQL.Init(ctx, options); err != nil {
//		return err
//	}
//
//	// Doing the database migrations
//	migrations := &sql.FSMigrationSource{
//		Box:         statics.AsFS(migrationsFS, "migrations"),
//		Dir:         s.MySQLDriver(),
//		TablePrefix: s.Prefix(),
//	}
//
//	_, err := sql.ExecMigration(s.DB(), s.MySQLDriver(), migrations, migrate.Up, "idm_role_")
//	if err != nil {
//		return err
//	}
//
//	// Preparing the db statements
//	if options.Val("prepare").Default(true).Bool() {
//		for key, query := range queries {
//			if err := s.Prepare(key, query); err != nil {
//				return err
//			}
//		}
//	}*/
//
//	return nil
//}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(ctx context.Context, role *idm.Role) (*idm.Role, bool, error) {
	if role.Label == "" {
		return nil, false, serviceerrors.BadRequest(common.ServiceRole, "Role cannot have an empty label")
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
	if t := s.instance(ctx).First(exist); t.Error == nil {
		update = true
		if tx := s.instance(ctx).Updates(role); tx.Error != nil {
			er = tx.Error
		}
	} else {
		if tx := s.instance(ctx).Create(role); tx.Error != nil {
			er = tx.Error
		}
	}
	return role, update, er
}

func (s *sqlimpl) Count(ctx context.Context, query sql.Enquirer) (int32, error) {

	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
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
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer, roles *[]*idm.Role) error {
	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
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
func (s *sqlimpl) Delete(ctx context.Context, query sql.Enquirer) (int64, error) {
	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder)).Build(ctx, s.instance(ctx))
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
