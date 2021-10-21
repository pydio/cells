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
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"
	"gopkg.in/doug-martin/goqu.v4"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/resources"
	"github.com/pydio/cells/x/configx"
)

var (
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
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options configx.Values) error {

	// super
	s.DAO.Init(options)

	// Preparing the resources
	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_roles.uuid").(*resources.ResourcesSQL)
	if err := s.ResourcesSQL.Init(options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/role/migrations"),
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
	}

	return nil
}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(role *idm.Role) (*idm.Role, bool, error) {

	var update bool
	if role.Uuid != "" {
		stmt, er := s.GetStmt("Exists")
		if er != nil {
			return nil, false, er
		}
		exists := stmt.QueryRow(role.Uuid)
		count := new(int)
		if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
			update = true
		}
	} else {
		role.Uuid = uuid.NewUUID().String()
	}
	if role.Label == "" {
		return nil, false, errors.BadRequest(common.ServiceRole, "Role cannot have an empty label")
	}
	if role.LastUpdated == 0 {
		role.LastUpdated = int32(time.Now().Unix())
	}

	if !update {
		stmt, er := s.GetStmt("AddRole")
		if er != nil {
			return nil, false, er
		}
		if _, err := stmt.Exec(
			role.Uuid,
			role.Label,
			role.IsTeam,
			role.GroupRole,
			role.UserRole,
			role.LastUpdated,
			strings.Join(role.AutoApplies, ","),
			role.ForceOverride,
		); err != nil {
			return nil, false, err
		}
	} else {
		stmt, er := s.GetStmt("UpdateRole")
		if er != nil {
			return nil, false, er
		}
		if _, err := stmt.Exec(
			role.Label,
			role.IsTeam,
			role.GroupRole,
			role.UserRole,
			role.LastUpdated,
			strings.Join(role.AutoApplies, ","),
			role.ForceOverride,
			role.Uuid,
		); err != nil {
			return nil, false, err
		}
	}
	return role, update, nil

}

func (s *sqlimpl) Count(query sql.Enquirer) (int32, error) {

	queryString, args, err := s.buildSearchQuery(query, true, false)
	if err != nil {
		return 0, err
	}

	res := s.DB().QueryRow(queryString, args...)
	if err != nil {
		return 0, err
	}
	count := new(int32)
	if err := res.Scan(&count); err != sql.ErrNoRows {
		return *count, nil
	} else {
		return 0, nil
	}

}

// Search in the SQL DB.
func (s *sqlimpl) Search(query sql.Enquirer, roles *[]*idm.Role) error {

	queryString, args, err := s.buildSearchQuery(query, false, false)
	if err != nil {
		return err
	}

	// log.Logger(context.Background()).Debug("Decoded SQL query: " + queryString)
	//log.Logger(context.Background()).Info("Search Roles: "+queryString, zap.Any("subjects", query.GetResourcePolicyQuery().GetSubjects()))
	res, err := s.DB().Query(queryString, args...)
	if err != nil {
		return err
	}

	defer res.Close()
	for res.Next() {
		role := new(idm.Role)
		autoApplies := ""
		res.Scan(
			&role.Uuid,
			&role.Label,
			&role.IsTeam,
			&role.GroupRole,
			&role.UserRole,
			&role.LastUpdated,
			&autoApplies,
			&role.ForceOverride,
		)
		role.AutoApplies = append(role.AutoApplies, strings.Split(autoApplies, ",")...)
		if policies, e := s.GetPoliciesForResource(role.Uuid); e == nil {
			role.Policies = policies
		} else {
			return e
			//log.Logger(context.Background()).Error("Error while loading resource policies", zap.Error(e))
		}
		*roles = append(*roles, role)
	}

	return nil
}

// Delete from the SQL DB
func (s *sqlimpl) Delete(query sql.Enquirer) (int64, error) {

	queryString, args, err := s.buildSearchQuery(query, false, true)
	if err != nil {
		return 0, err
	}

	res, err := s.DB().Exec(queryString, args...)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rows, nil
}

func (s *sqlimpl) buildSearchQuery(query sql.Enquirer, countOnly bool, delete bool) (string, []interface{}, error) {

	ex := sql.NewQueryBuilder(query, new(queryBuilder)).Expression(s.Driver())

	if delete {
		return sql.DeleteStringFromExpression("idm_roles", s.Driver(), ex)
	} else {

		resourceExpr, e := s.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
		if e != nil {
			return "", nil, e
		}
		if countOnly {
			return sql.CountStringFromExpression("idm_roles", "uuid", s.Driver(), query, ex, resourceExpr)
		} else {
			return sql.QueryStringFromExpression("idm_roles", s.Driver(), query, ex, resourceExpr, -1)
		}
	}
}

type queryBuilder idm.RoleSingleQuery

func (c *queryBuilder) Convert(val *any.Any, driver string) (goqu.Expression, bool) {

	q := new(idm.RoleSingleQuery)
	if err := ptypes.UnmarshalAny(val, q); err != nil {
		return nil, false
	}
	var expressions []goqu.Expression
	if len(q.Uuid) > 0 {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "uuid", q.Uuid...))
	}
	if len(q.Label) > 0 {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "label", q.Label))
	}
	if q.IsGroupRole {
		if q.Not {
			expressions = append(expressions, goqu.I("group_role").Eq(0))
		} else {
			expressions = append(expressions, goqu.I("group_role").Eq(1))
		}
	}
	if q.IsUserRole {
		if q.Not {
			expressions = append(expressions, goqu.I("user_role").Eq(0))
		} else {
			expressions = append(expressions, goqu.I("user_role").Eq(1))
		}
	}
	if q.IsTeam {
		if q.Not {
			expressions = append(expressions, goqu.I("team_role").Eq(0))
		} else {
			expressions = append(expressions, goqu.I("team_role").Eq(1))
		}
	}
	if q.HasAutoApply {
		if q.Not {
			expressions = append(expressions, goqu.I("auto_applies").Eq(""))
		} else {
			expressions = append(expressions, goqu.I("auto_applies").Neq(""))
		}
	}

	if len(expressions) == 0 {
		return nil, true
	}
	return goqu.And(expressions...), true

}
