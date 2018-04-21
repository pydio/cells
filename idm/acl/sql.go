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

package acl

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gobuffalo/packr"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/sql"
)

var (
	queries = map[string]string{
		"AddACL":          `insert into idm_acls (action_name, action_value, role_id, workspace_id, node_id) values (?, ?, ?, ?, ?)`,
		"AddACLNode":      `insert into idm_acl_nodes (uuid) values (?)`,
		"AddACLRole":      `insert into idm_acl_roles (uuid) values (?)`,
		"AddACLWorkspace": `insert into idm_acl_workspaces (name) values (?)`,
		"GetACLNode":      `select id from idm_acl_nodes where uuid = ?`,
		"GetACLRole":      `select id from idm_acl_roles where uuid = ?`,
		"GetACLWorkspace": `select id from idm_acl_workspaces where name = ?`,
		"CleanWorkspaces": `DELETE FROM idm_acl_workspaces WHERE id != -1 and id NOT IN (select distinct(workspace_id) from idm_acls)`,
		"CleanRoles":      `DELETE FROM idm_acl_roles WHERE id != -1 and id NOT IN (select distinct(role_id) from idm_acls)`,
		"CleanNodes":      `DELETE FROM idm_acl_nodes WHERE id != -1 and id NOT IN (select distinct(node_id) from idm_acls)`,
	}

	search  = `select a.id, n.uuid, a.action_name, a.action_value, r.uuid, w.name from idm_acls a, idm_acl_nodes n, idm_acl_workspaces w, idm_acl_roles r where (n.id = a.node_id and w.id = a.workspace_id and r.id = a.role_id) `
	deleteQ = `delete from idm_acls`
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options config.Map) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/acl/migrations"),
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
func (dao *sqlimpl) Add(in interface{}) error {

	val, ok := in.(*idm.ACL)
	if !ok {
		return errors.New("Wrong type")
	}

	if val.Action == nil {
		return errors.New("Missing action value")
	}

	workspaceID := "-1"
	if val.WorkspaceID != "" {
		id, err := dao.addWorkspace(val.WorkspaceID)
		if err != nil {
			return err
		}
		workspaceID = id
	}

	nodeID := "-1"
	if val.NodeID != "" {
		id, err := dao.addNode(val.NodeID)
		if err != nil {
			return err
		}
		nodeID = id
	}

	roleID := "-1"
	if val.RoleID != "" {
		id, err := dao.addRole(val.RoleID)
		if err != nil {
			return err
		}
		roleID = id
	}
	log.Logger(context.Background()).Debug("AddACL",
		zap.String("r", roleID), zap.String("w", workspaceID), zap.String("n", nodeID), zap.Any("value", val))
	res, err := dao.GetStmt("AddACL").Exec(val.Action.Name, val.Action.Value, roleID, workspaceID, nodeID)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	val.ID = fmt.Sprintf("%d", id)

	return nil
}

// Search in the mysql DB
func (dao *sqlimpl) Search(query sql.Enquirer, acls *[]interface{}) error {

	whereString := sql.NewDAOQuery(query, new(queryConverter)).String()

	//	whereString, _ := query.Build(new(queryConverter))

	if len(whereString) != 0 {
		whereString = " and " + whereString
	}

	offset, limit := int64(0), int64(0)
	if query.GetOffset() > 0 {
		offset = query.GetOffset()
	}
	if query.GetLimit() == 0 {
		// Default limit
		limit = 100
	}

	limitString := fmt.Sprintf(" limit %v,%v", offset, limit)
	if query.GetLimit() == -1 {
		limitString = ""
	}

	queryString := search + whereString + limitString

	//log.Logger(context.Background()).Debug("SQL SEARCH", zap.String("q", queryString))

	res, err := dao.DB().Query(queryString)
	if err != nil {
		return err
	}

	defer res.Close()
	for res.Next() {
		val := new(idm.ACL)
		action := new(idm.ACLAction)

		res.Scan(
			&val.ID,
			&val.NodeID,
			&action.Name,
			&action.Value,
			&val.RoleID,
			&val.WorkspaceID,
		)

		val.Action = action

		*acls = append(*acls, val)
	}

	return nil
}

// Del from the mysql DB
func (dao *sqlimpl) Del(query sql.Enquirer) (int64, error) {

	whereString := sql.NewDAOQuery(query, new(queryConverter)).String()

	if len(whereString) == 0 || len(strings.Trim(whereString, "()")) == 0 {
		return 0, errors.New("Empty condition for Delete, this is too broad a query!")
	}

	if len(whereString) != 0 {
		whereString = " where " + whereString
	}

	//log.Logger(context.Background()).Debug("DELETE WHERE", zap.String("w", whereString))
	queryString := deleteQ + whereString

	res, err := dao.DB().Exec(queryString)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	if rows > 0 {
		// Perform clean up
		dao.GetStmt("CleanWorkspaces").Exec()
		dao.GetStmt("CleanRoles").Exec()
		dao.GetStmt("CleanNodes").Exec()
	}

	return rows, nil
}

func (dao *sqlimpl) addWorkspace(uuid string) (string, error) {

	res, err := dao.GetStmt("AddACLWorkspace").Exec(uuid)
	if err == nil {
		rows, err := res.RowsAffected()
		if err != nil {
			return "", err
		}

		if rows > 0 {
			id, err := res.LastInsertId()
			if err != nil {
				return "", err
			}

			return fmt.Sprintf("%d", id), nil
		}
	}

	row := dao.GetStmt("GetACLWorkspace").QueryRow(uuid)
	if row == nil {
		return "", err
	}

	var id string
	row.Scan(&id)

	return id, nil
}

func (dao *sqlimpl) addNode(uuid string) (string, error) {

	res, err := dao.GetStmt("AddACLNode").Exec(uuid)
	if err == nil {
		rows, err := res.RowsAffected()
		if err != nil {
			return "", err
		}

		if rows > 0 {
			id, err := res.LastInsertId()
			if err != nil {
				return "", err
			}

			return fmt.Sprintf("%d", id), nil
		}
	}

	// Checking we didn't have a duplicate
	row := dao.GetStmt("GetACLNode").QueryRow(uuid)
	if row == nil {
		return "", err
	}

	var id string
	row.Scan(&id)

	return id, nil
}

func (dao *sqlimpl) addRole(uuid string) (string, error) {

	res, err := dao.GetStmt("AddACLRole").Exec(uuid)
	if err == nil {
		rows, err := res.RowsAffected()
		if err != nil {
			return "", err
		}

		if rows > 0 {
			id, err := res.LastInsertId()
			if err != nil {
				return "", err
			}

			return fmt.Sprintf("%d", id), nil
		}
	}

	// Checking we didn't have a duplicate
	row := dao.GetStmt("GetACLRole").QueryRow(uuid)
	if row == nil {
		return "", err
	}

	var id string
	row.Scan(&id)

	return id, nil
}

type queryConverter idm.ACLSingleQuery

func (c *queryConverter) Convert(val *any.Any) (string, bool) {

	q := new(idm.ACLSingleQuery)

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		return "", false
	}

	var wheres []string

	if len(q.RoleIDs) > 0 {
		list := strings.Join(applyMapping(q.RoleIDs, quote), ",")

		if list != "" {
			wheres = append(wheres, fmt.Sprintf("role_id in (select id from idm_acl_roles where uuid in (%s))", list))
		}
	}

	if len(q.WorkspaceIDs) > 0 {
		list := strings.Join(applyMapping(q.WorkspaceIDs, quote), ",")
		if list != "" {
			wheres = append(wheres, fmt.Sprintf("workspace_id in (select id from idm_acl_workspaces where name in (%s))", list))
		}
	}

	if len(q.NodeIDs) > 0 {
		list := strings.Join(applyMapping(q.NodeIDs, quote), ",")
		if list != "" {
			wheres = append(wheres, fmt.Sprintf("node_id in (select id from idm_acl_nodes where uuid in (%s))", list))
		}
	}

	// Special case for Actions
	if len(q.Actions) > 0 {
		actionsByName := make(map[string][]string) // actionName => actionValues
		for _, act := range q.Actions {
			values, exists := actionsByName[act.Name]
			if !exists {
				values = []string{}
			}
			if act.Value != "" {
				values = append(values, act.Value)
			}
			actionsByName[act.Name] = values
		}

		var orWheres []string
		for actName, actValues := range actionsByName {
			var actionWheres []string

			actionWheres = append(actionWheres, sql.GetQueryValueFor("action_name", actName))
			if len(actValues) > 0 {
				actionWheres = append(actionWheres, sql.GetQueryValueFor("action_value", actValues...))
				orWheres = append(orWheres, "("+strings.Join(actionWheres, " AND ")+")")
			} else {
				orWheres = append(orWheres, strings.Join(actionWheres, ""))
			}
		}
		if len(orWheres) > 1 {
			wheres = append(wheres, "("+strings.Join(orWheres, " OR ")+")")
		} else {
			wheres = append(wheres, strings.Join(orWheres, ""))
		}
	}

	return strings.Join(wheres, " AND "), true
}

// Internal helper functions

func quote(v string) string {
	if v == "" {
		return ""
	}
	return fmt.Sprintf(`"%s"`, v)
}

func applyMapping(vs []string, f func(string) string) []string {
	vsm := make([]string, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}
