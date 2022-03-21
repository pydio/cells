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
	"embed"
	"errors"
	"fmt"
	"time"

	goqu "github.com/doug-martin/goqu/v9"
	"github.com/go-sql-driver/mysql"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddACL":                  `insert into idm_acls (action_name, action_value, role_id, workspace_id, node_id) values (?, ?, ?, ?, ?)`,
		"AddACLNode":              `insert into idm_acl_nodes (uuid) values (?)`,
		"AddACLRole":              `insert into idm_acl_roles (uuid) values (?)`,
		"AddACLWorkspace":         `insert into idm_acl_workspaces (name) values (?)`,
		"GetACLNode":              `select id from idm_acl_nodes where uuid = ?`,
		"GetACLRole":              `select id from idm_acl_roles where uuid = ?`,
		"GetACLWorkspace":         `select id from idm_acl_workspaces where name = ?`,
		"CleanWorkspaces":         `DELETE FROM idm_acl_workspaces WHERE id != -1 and id NOT IN (select distinct(workspace_id) from idm_acls)`,
		"CleanRoles":              `DELETE FROM idm_acl_roles WHERE id != -1 and id NOT IN (select distinct(role_id) from idm_acls)`,
		"CleanNodes":              `DELETE FROM idm_acl_nodes WHERE id != -1 and id NOT IN (select distinct(node_id) from idm_acls)`,
		"CleanDuplicateIfExpired": `DELETE FROM idm_acls WHERE action_name=? AND role_id=? AND workspace_id=? AND node_id=? AND expires_at IS NOT NULL AND expires_at < ?`,
	}
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (dao *sqlimpl) Init(options configx.Values) error {

	// super
	dao.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         dao.Driver(),
		TablePrefix: dao.Prefix(),
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Up, "idm_acl_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := dao.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// Add inserts an ACL to the underlying SQL DB
func (dao *sqlimpl) Add(in interface{}) error {
	return dao.addWithDupCheck(in, true)
}

// addWithDupCheck insert and override existing value if it's a
// duplicate key and the ACL is expired
func (dao *sqlimpl) addWithDupCheck(in interface{}, check bool) error {

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

	stmt, er := dao.GetStmt("AddACL")
	if er != nil {
		return er
	}

	res, err := stmt.Exec(val.Action.Name, val.Action.Value, roleID, workspaceID, nodeID)
	if err != nil {
		if mErr, ok := err.(*mysql.MySQLError); ok && mErr.Number == 1062 && check {
			// fmt.Println("GOT DUPLICATE ERROR", mErr.Error(), mErr.Message)
			// There is a duplicate : if it is expired, we can safely ignore it and replace it
			deleteStmt, dE := dao.GetStmt("CleanDuplicateIfExpired")
			if dE != nil {
				return dE
			}
			delRes, drE := deleteStmt.Exec(val.Action.Name, roleID, workspaceID, nodeID, time.Now())
			if drE != nil {
				return drE
			}
			if affected, e := delRes.RowsAffected(); e == nil && affected == 1 {
				// fmt.Println("[AddACL] Replacing one duplicate row that was in fact expired")
				return dao.addWithDupCheck(in, false)
			}
		}
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	val.ID = fmt.Sprintf("%d", id)

	return nil
}

// Search in the underlying SQL DB.
func (dao *sqlimpl) Search(query sql.Enquirer, acls *[]interface{}) error {

	db := goqu.New(dao.Driver(), dao.DB())

	n := goqu.T("n")
	w := goqu.T("w")
	r := goqu.T("r")
	a := goqu.T("a")

	expressions := []goqu.Expression{
		n.Col("id").Eq(a.Col("node_id")),
		w.Col("id").Eq(a.Col("workspace_id")),
		r.Col("id").Eq(a.Col("role_id")),
		goqu.Or(
			a.Col("expires_at").IsNull(),
			a.Col("expires_at").Gt(time.Now()),
		),
	}

	whereExpression := sql.NewQueryBuilder(query, new(queryConverter)).Expression(dao.Driver())
	if whereExpression != nil {
		expressions = append(expressions, whereExpression)
	}

	offset, limit := int64(0), int64(-1)
	if query.GetOffset() > 0 {
		offset = query.GetOffset()
	}
	if query.GetLimit() > 0 {
		limit = query.GetLimit()
	}

	dataset := db.From(
		goqu.T("idm_acls").As("a"),
		goqu.T("idm_acl_nodes").As("n"),
		goqu.T("idm_acl_workspaces").As("w"),
		goqu.T("idm_acl_roles").As("r"),
	).Prepared(true).Select(
		a.Col("id").As("acl_id"),
		n.Col("uuid").As("node_uuid"),
		a.Col("action_name").As("acl_action_name"),
		a.Col("action_value").As("acl_action_value"),
		r.Col("uuid").As("role_uuid"),
		w.Col("name").As("workspace_name"),
	)

	if limit > -1 {
		dataset = dataset.Offset(uint(offset)).Limit(uint(limit))
	}

	dataset = dataset.Where(expressions...)

	var items []struct {
		AclID          string `db:"acl_id"`
		NodeUUID       string `db:"node_uuid"`
		ACLActionName  string `db:"acl_action_name"`
		ACLActionValue string `db:"acl_action_value"`
		RoleUUID       string `db:"role_uuid"`
		WorkspaceName  string `db:"workspace_name"`
	}
	if err := dataset.ScanStructs(&items); err != nil {
		return err
	}

	for _, item := range items {
		val := new(idm.ACL)
		action := new(idm.ACLAction)

		val.ID = item.AclID
		val.NodeID = item.NodeUUID
		val.RoleID = item.RoleUUID
		val.WorkspaceID = item.WorkspaceName

		action.Name = item.ACLActionName
		action.Value = item.ACLActionValue

		val.Action = action
		*acls = append(*acls, val)
	}

	return nil
}

// SetExpiry sets an expiry timestamp on the acl
func (dao *sqlimpl) SetExpiry(query sql.Enquirer, t time.Time) (int64, error) {

	db := goqu.New(dao.Driver(), dao.DB())

	whereExpression := sql.NewQueryBuilder(query, new(queryConverter)).Expression(dao.Driver())

	dataset := db.From("idm_acls").Where(whereExpression).Update().Set(goqu.Record{"expires_at": t})

	res, err := dataset.Executor().Exec()
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rows, nil
}

// Del from the sql DB.
func (dao *sqlimpl) Del(query sql.Enquirer) (int64, error) {

	whereExpression := sql.NewQueryBuilder(query, new(queryConverter)).Expression(dao.Driver())
	queryString, args, err := sql.DeleteStringFromExpression("idm_acls", dao.Driver(), whereExpression)
	if err != nil {
		return 0, err
	}

	res, err := dao.DB().Exec(queryString, args...)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	if rows > 0 {
		// Perform clean up
		if stmt, er := dao.GetStmt("CleanWorkspaces"); er == nil {
			stmt.Exec()
		} else {
			return 0, er
		}

		if stmt, er := dao.GetStmt("CleanRoles"); er == nil {
			stmt.Exec()
		} else {
			return 0, er
		}

		if stmt, er := dao.GetStmt("CleanNodes"); er == nil {
			stmt.Exec()
		} else {
			return 0, er
		}
	}

	return rows, nil
}

func (dao *sqlimpl) addWorkspace(uuid string) (string, error) {

	stmt, er := dao.GetStmt("AddACLWorkspace")
	if er != nil {
		return "", er
	}
	res, err := stmt.Exec(uuid)
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

	var id string
	stmt, er = dao.GetStmt("GetACLWorkspace")
	if er != nil {
		return "", er
	}

	row := stmt.QueryRow(uuid)
	if row == nil {
		return "", fmt.Errorf("cannot not find acl for workspace %s", uuid)
	}
	er = row.Scan(&id)

	return id, er
}

func (dao *sqlimpl) addNode(uuid string) (string, error) {

	stmt, er := dao.GetStmt("AddACLNode")
	if er != nil {
		return "", er
	}
	res, err := stmt.Exec(uuid)
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
	var id string

	stmt, er = dao.GetStmt("GetACLNode")
	if er != nil {
		return "", er
	}
	row := stmt.QueryRow(uuid)
	if row == nil {
		return "", fmt.Errorf("can not find acl node %s", uuid)
	}
	er = row.Scan(&id)

	return id, er
}

func (dao *sqlimpl) addRole(uuid string) (string, error) {

	stmt, er := dao.GetStmt("AddACLRole")
	if er != nil {
		return "", er
	}

	res, err := stmt.Exec(uuid)
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
	var id string
	stmt, er = dao.GetStmt("GetACLRole")
	if er != nil {
		return "", er
	}
	row := stmt.QueryRow(uuid)
	if row == nil {
		return "", fmt.Errorf("cannot find acl role %s", uuid)
	}
	er = row.Scan(&id)

	return id, er
}

type queryConverter idm.ACLSingleQuery

func (c *queryConverter) Convert(val *anypb.Any, driver string) (goqu.Expression, bool) {

	q := new(idm.ACLSingleQuery)

	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false
	}

	db := goqu.New(driver, nil)
	var expressions []goqu.Expression

	if len(q.RoleIDs) > 0 {
		dataset := db.From("idm_acl_roles").Select("id")
		dataset = dataset.Where(sql.GetExpressionForString(false, "uuid", q.RoleIDs...))
		str, _, err := dataset.ToSQL()
		if err != nil {
			return nil, true
		}
		expressions = append(expressions, goqu.C("role_id").In(goqu.L(str)))
	}

	if len(q.WorkspaceIDs) > 0 {
		dataset := db.From("idm_acl_workspaces").Select("id")
		dataset = dataset.Where(sql.GetExpressionForString(false, "name", q.WorkspaceIDs...))
		str, _, err := dataset.ToSQL()
		if err != nil {
			return nil, true
		}
		expressions = append(expressions, goqu.C("workspace_id").In(goqu.L(str)))
	}

	if len(q.NodeIDs) > 0 {

		dataset := db.From("idm_acl_nodes").Select("id")
		dataset = dataset.Where(sql.GetExpressionForString(false, "uuid", q.NodeIDs...))
		str, _, err := dataset.ToSQL()
		if err != nil {
			return nil, true
		}
		expressions = append(expressions, goqu.C("node_id").In(goqu.L(str)))
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

		var orExpression []goqu.Expression
		//var orWheres []string
		for actName, actValues := range actionsByName {
			var actionAndExpression []goqu.Expression

			actionAndExpression = append(actionAndExpression, sql.GetExpressionForString(false, "action_name", actName))
			if len(actValues) > 0 {
				actionAndExpression = append(actionAndExpression, sql.GetExpressionForString(false, "action_value", actValues...))
				orExpression = append(orExpression, goqu.And(actionAndExpression...))
			} else {
				orExpression = append(orExpression, actionAndExpression...)
			}
		}
		expressions = append(expressions, goqu.Or(orExpression...))
	}

	return goqu.And(expressions...), true
}
