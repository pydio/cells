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

package role

import (
	"context"
	"embed"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"strings"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddRole":    `insert into idm_roles (uuid, label, team_role, group_role, user_role, last_updated, auto_applies, override) values (?,?,?,?,?,?,?,?)`,
		"UpdateRole": `update idm_roles set label=?, team_role=?, group_role=?, user_role=?, last_updated=?, auto_applies=?, override=? where uuid= ?`,
		"GetRole":    `select * from idm_roles where uuid = ?`,
		"Exists":     `select count(uuid) from idm_roles where uuid = ?`,
		"DeleteRole": `delete from idm_roles where uuid = ?`,
	}
)

// Impl of the SQL interface
type sqlimpl struct {
	// *sql.Handler

	db *gorm.DB

	instance func() *gorm.DB

	*resources.ResourcesGORM
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	db := s.db
	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_roles") }

	s.instance().AutoMigrate(&idm.RoleORM{})

	s.ResourcesGORM = &resources.ResourcesGORM{DB: s.db}
	s.ResourcesGORM.Init(ctx, options)

	/* super
	if er := s.DAO.Init(ctx, options); er != nil {
		return er
	}

	// Preparing the resources
	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_roles.uuid").(*resources.ResourcesSQL)
	if err := s.ResourcesSQL.Init(ctx, options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_role_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}*/

	return nil
}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(role *idm.Role) (*idm.Role, bool, error) {
	if role.Label == "" {
		return nil, false, errors.BadRequest(common.ServiceRole, "Role cannot have an empty label")
	}

	if role.LastUpdated == 0 {
		role.LastUpdated = int32(time.Now().Unix())
	}

	tx := s.instance().FirstOrCreate((*idm.RoleORM)(role), (*idm.RoleORM)(role))
	if tx.Error != nil {
		return nil, false, tx.Error
	}

	update := tx.RowsAffected > 0

	return role, update, nil
}

func (s *sqlimpl) Count(query sql.Enquirer) (int32, error) {

	db := sql.NewGormQueryBuilder(query, new(queryBuilder), s.ResourcesGORM).Build(s.instance()).(*gorm.DB)

	var count int64

	tx := db.Count(&count)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return int32(count), nil
}

// Search in the SQL DB.
func (s *sqlimpl) Search(query sql.Enquirer, roles *[]*idm.Role) error {
	db := sql.NewGormQueryBuilder(query, new(queryBuilder), s.ResourcesGORM).Build(s.instance()).(*gorm.DB)

	var roleORMs []*idm.RoleORM

	tx := db.Find(&roleORMs)
	if tx.Error != nil {
		return tx.Error
	}

	for _, roleORM := range roleORMs {
		*roles = append(*roles, (*idm.Role)(roleORM))
	}

	return nil
}

// Delete from the SQL DB
func (s *sqlimpl) Delete(query sql.Enquirer) (int64, error) {
	db := sql.NewGormQueryBuilder(query, new(queryBuilder)).Build(s.instance()).(*gorm.DB)

	tx := db.Delete(&idm.RoleORM{})
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

type queryBuilder idm.RoleSingleQuery

func (c *queryBuilder) Convert(val *anypb.Any, in any) (out any, ok bool) {

	db, ok := in.(*gorm.DB)
	if !ok {
		return in, false
	}

	q := new(idm.RoleSingleQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return in, false
	}

	if len(q.Uuid) > 0 {
		if q.Not {
			db = db.Not(map[string]interface{}{"uuid": q.Uuid})
		} else {
			db = db.Where(map[string]interface{}{"uuid": q.Uuid})
		}
	}
	if len(q.Label) > 0 {
		var c interface{}
		if strings.Contains(q.Label, "*") {
			c = clause.Like{Column: "label", Value: strings.Replace(q.Label, "*", "%", -1)}
		} else {
			c = clause.Eq{Column: "label", Value: q.Label}
		}
		if q.Not {
			db = db.Not(c)
		} else {
			db = db.Where(c)
		}
	}
	if q.IsGroupRole {
		if q.Not {
			db = db.Not(map[string]interface{}{"group_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"group_role": 1})
		}
	}
	if q.IsUserRole {
		if q.Not {
			db = db.Not(map[string]interface{}{"user_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"user_role": 1})
		}
	}
	if q.IsTeam {
		if q.Not {
			db = db.Not(map[string]interface{}{"team_role": 1})
		} else {
			db = db.Where(map[string]interface{}{"team_role": 1})
		}
	}
	if q.HasAutoApply {
		if q.Not {
			db = db.Where(map[string]interface{}{"auto_applies": ""})
		} else {
			db = db.Not(map[string]interface{}{"auto_applies": ""})
		}
	}

	out = db
	ok = true

	return
}
