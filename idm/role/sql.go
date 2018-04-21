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
	"fmt"
	"strings"
	"time"

	"github.com/gobuffalo/packr"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/resources"
)

var (
	queries = map[string]string{
		"AddRole":    `insert into idm_roles (uuid, label, team_role, group_role, user_role, last_updated, auto_applies) values (?,?,?,?,?,?,?)`,
		"UpdateRole": `update idm_roles set label=?, team_role=?, group_role=?, user_role=?, last_updated=?, auto_applies=? where uuid= ?`,
		"GetRole":    `select * from idm_roles where uuid = ?`,
		"Exists":     `select count(uuid) from idm_roles where uuid = ?`,
		"DeleteRole": `delete from idm_roles where uuid = ?`,
	}

	search  = `select * from idm_roles`
	count   = `select count(uuid) from idm_roles`
	deleteQ = `delete from idm_roles`
)

// Impl of the Mysql interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options config.Map) error {

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

	_, err := migrate.Exec(s.DB(), s.Driver(), migrations, migrate.Up)
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Bool("prepare", true) {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// Add to the mysql DB
func (s *sqlimpl) Add(role *idm.Role) (*idm.Role, bool, error) {

	var update bool
	if role.Uuid != "" {
		exists := s.GetStmt("Exists").QueryRow(role.Uuid)
		count := new(int)
		if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
			update = true
		}
	} else {
		role.Uuid = uuid.NewUUID().String()
	}
	if role.Label == "" {
		return nil, false, errors.BadRequest(common.SERVICE_ROLE, "Role cannot have an empty label")
	}
	if role.LastUpdated == 0 {
		role.LastUpdated = int32(time.Now().Unix())
	}
	var err error
	if !update {
		_, err = s.GetStmt("AddRole").Exec(
			role.Uuid,
			role.Label,
			role.IsTeam,
			role.GroupRole,
			role.UserRole,
			role.LastUpdated,
			strings.Join(role.AutoApplies, ","),
		)
	} else {
		_, err = s.GetStmt("UpdateRole").Exec(
			role.Label,
			role.IsTeam,
			role.GroupRole,
			role.UserRole,
			role.LastUpdated,
			strings.Join(role.AutoApplies, ","),
			role.Uuid,
		)
	}
	if err != nil {
		return nil, false, err
	}
	return role, update, nil

}

func (s *sqlimpl) Count(query sql.Enquirer) (int32, error) {

	queryString, err := s.buildSearchQuery(query, false, true, false)
	if err != nil {
		return 0, err
	}

	res := s.DB().QueryRow(queryString)
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

// Search in the mysql DB
func (s *sqlimpl) Search(query sql.Enquirer, roles *[]*idm.Role) error {

	queryString, err := s.buildSearchQuery(query, true, false, false)
	if err != nil {
		return err
	}

	// log.Logger(context.Background()).Debug("Decoded SQL query: " + queryString)
	//log.Logger(context.Background()).Info("Search Roles: "+queryString, zap.Any("subjects", query.GetResourcePolicyQuery().GetSubjects()))

	res, err := s.DB().Query(queryString)
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
		)
		for _, a := range strings.Split(autoApplies, ",") {
			role.AutoApplies = append(role.AutoApplies, a)
		}
		if policies, e := s.GetPoliciesForResource(role.Uuid); e == nil {
			role.Policies = policies
		} else {
			log.Logger(context.Background()).Error("Error while loading resource policies", zap.Error(e))
		}
		*roles = append(*roles, role)
	}

	return nil
}

// Deleteete from the mysql DB
func (s *sqlimpl) Delete(query sql.Enquirer) (int64, error) {

	queryString, err := s.buildSearchQuery(query, false, false, true)
	if err != nil {
		return 0, err
	}

	res, err := s.DB().Exec(queryString)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rows, nil
}

func (s *sqlimpl) buildSearchQuery(query sql.Enquirer, withLimit bool, countOnly bool, delete bool) (string, error) {

	var wheres []string

	if query.GetResourcePolicyQuery() != nil {
		resourceString := s.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
		if resourceString != "" {
			wheres = append(wheres, resourceString)
		}
	}
	if whereString := sql.NewDAOQuery(query, new(queryConverter)).String(); len(whereString) != 0 {
		wheres = append(wheres, whereString)
	}
	whereString := sql.JoinWheresWithParenthesis(wheres, "AND")

	limitString := ""
	if withLimit && query.GetLimit() > -1 {
		offset, limit := int64(0), int64(0)
		if query.GetOffset() > 0 {
			offset = query.GetOffset()
		}
		if query.GetLimit() == 0 {
			// Default limit
			limit = 100
		} else {
			limit = query.GetLimit()
		}
		limitString = fmt.Sprintf(" limit %v,%v", offset, limit)
	}

	queryString := ""
	if countOnly {
		queryString = count + whereString
	} else if delete {
		queryString = deleteQ + whereString + limitString
	} else {
		queryString = search + whereString + limitString
	}

	//	fmt.Println(queryString)

	return queryString, nil
}

type queryConverter idm.RoleSingleQuery

func (c *queryConverter) Convert(val *any.Any) (string, bool) {

	q := new(idm.RoleSingleQuery)

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		log.Logger(context.Background()).Debug(fmt.Sprintf("Any: %s - %s", val.TypeUrl, val.String()))
		log.Logger(context.Background()).Error("could not unmarshal RoleSingleQuery", zap.Error(err))
		return "false", false
	}
	var wheres []string
	if len(q.Uuid) > 0 {
		w := sql.GetQueryValueFor("uuid", q.Uuid...)
		if len(q.Uuid) > 1 {
			w = fmt.Sprintf("(%s)", w)
		}
		wheres = append(wheres, w)
	}
	if len(q.Label) > 0 {
		wheres = append(wheres, sql.GetQueryValueFor("label", q.Label))
	}
	if q.IsGroupRole {
		if q.Not {
			wheres = append(wheres, "group_role=0")
		} else {
			wheres = append(wheres, "group_role=1")
		}
	}
	if q.IsUserRole {
		if q.Not {
			wheres = append(wheres, "user_role=0")
		} else {
			wheres = append(wheres, "user_role=1")
		}
	}
	if q.IsTeam {
		if q.Not {
			wheres = append(wheres, "team_role=0")
		} else {
			wheres = append(wheres, "team_role=1")
		}
	}
	if q.HasAutoApply {
		if q.Not {
			wheres = append(wheres, "auto_applies = ''")
		} else {
			wheres = append(wheres, "auto_applies <> ''")
		}
	}

	return strings.Join(wheres, " and "), true
}
