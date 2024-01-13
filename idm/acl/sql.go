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
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/log"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"strconv"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
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

type ACL struct {
	ID          int       `gorm:"primaryKey; column:id; autoIncrement;"`
	ActionName  string    `gorm:"column:action_name"`
	ActionValue string    `gorm:"column:action_value"`
	RoleID      int       `gorm:"column:role_id; default: -1"`
	WorkspaceID int       `gorm:"column:workspace_id; default: -1"`
	NodeID      int       `gorm:"column:node_id; default: -1"`
	Role        Role      `gorm:"foreignKey:RoleID"`
	Workspace   Workspace `gorm:"foreignKey:WorkspaceID"`
	Node        Node      `gorm:"foreignKey:NodeID"`
	Expiry      time.Time `gorm:"expiry_date"`
}

type Role struct {
	ID   int    `gorm:"primaryKey; column:id; autoIncrement;"`
	UUID string `gorm:"column:uuid; unique"`
}

type Workspace struct {
	ID   int    `gorm:"primaryKey; column:id; autoIncrement;"`
	UUID string `gorm:"column:uuid; unique"`
}

type Node struct {
	ID   int    `gorm:"primaryKey; column:id; autoIncrement;"`
	UUID string `gorm:"column:uuid; unique"`
}

type sqlimpl struct {
	// sql.DAO

	db       *gorm.DB
	instance func(ctx context.Context) *gorm.DB
}

func (s *sqlimpl) Name() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) ID() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Metadata() map[string]string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) As(i interface{}) bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Driver() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Dsn() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) GetConn(ctx context.Context) (dao.Conn, error) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) SetConn(ctx context.Context, conn dao.Conn) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) CloseConn(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Prefix() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) LocalAccess() bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Stats() map[string]interface{} {
	//TODO implement me
	panic("implement me")
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	db := s.db

	s.instance = func(ctx context.Context) *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}) }

	s.instance(ctx).AutoMigrate(&ACL{}, &Role{}, &Workspace{}, &Node{})

	return nil
}

// Add inserts an ACL to the underlying SQL DB
func (s *sqlimpl) Add(in interface{}) error {
	return s.addWithDupCheck(in, true)
}

// addWithDupCheck insert and override existing value if it's a
// duplicate key and the ACL is expired
func (s *sqlimpl) addWithDupCheck(in interface{}, check bool) error {

	val, ok := in.(*idm.ACL)
	if !ok {
		return errors.New("Wrong type")
	}

	if val.Action == nil {
		return errors.New("Missing action value")
	}

	workspace := Workspace{UUID: val.GetWorkspaceID()}
	if workspace.UUID != "" {
		workspace.UUID = val.GetWorkspaceID()

		tx := s.instance(context.TODO()).FirstOrCreate(&workspace)
		if tx.Error != nil {
			return tx.Error
		}
	}

	node := Node{UUID: val.GetNodeID()}
	if node.UUID != "" {
		tx := s.instance(context.TODO()).FirstOrCreate(&node)
		if tx.Error != nil {
			return tx.Error
		}
	}

	role := Role{UUID: val.GetRoleID()}
	if role.UUID != "" {
		tx := s.instance(context.TODO()).FirstOrCreate(&role)
		if tx.Error != nil {
			return tx.Error
		}
	}

	log.Logger(context.Background()).Debug("AddACL", zap.String("r", role.UUID), zap.String("w", workspace.UUID), zap.String("n", node.UUID), zap.Any("value", val))

	acl := ACL{
		ActionName:  val.Action.Name,
		ActionValue: val.Action.Value,
		Role:        role,
		Workspace:   workspace,
		Node:        node,
	}

	tx := s.instance(context.TODO()).Create(&acl)
	if tx.Error != nil {
		return tx.Error
	}

	val.ID = strconv.Itoa(acl.ID)

	// TODO - duplicate

	return nil
}

// Search in the underlying SQL DB.
func (s *sqlimpl) Search(query sql.Enquirer, out *[]interface{}, period *ExpirationPeriod) error {
	db := sql.NewGormQueryBuilder(query, new(queryConverter)).Build(s.instance(context.TODO())).(*gorm.DB)

	if query.GetOffset() > 0 {
		db.Offset(int(query.GetOffset()))
	}
	if query.GetLimit() > 0 {
		db.Limit(int(query.GetLimit()))
	}

	var acls []ACL

	tx := db.Find(&acls)
	if tx.Error != nil {
		return tx.Error
	}

	for _, acl := range acls {
		val := new(idm.ACL)
		action := new(idm.ACLAction)

		val.ID = strconv.Itoa(acl.ID)
		val.NodeID = acl.Node.UUID
		val.RoleID = acl.Role.UUID
		val.WorkspaceID = acl.Workspace.UUID

		action.Name = acl.ActionName
		action.Value = acl.ActionValue

		val.Action = action
		*out = append(*out, val)
	}

	return nil
}

// SetExpiry sets an expiry timestamp on the acl
func (s *sqlimpl) SetExpiry(query sql.Enquirer, t time.Time, period *ExpirationPeriod) (int64, error) {

	db := sql.NewGormQueryBuilder(query, new(queryConverter)).Build(s.instance(context.TODO())).(*gorm.DB)

	if period != nil {
		if !period.End.IsZero() {
			db.Where("expiry_date < ?", period.End)
		}
		if !period.Start.IsZero() {
			db.Where("expiry_date > ?", period.Start)
		}
	}

	tx := db.Updates(&ACL{Expiry: t})
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

// Del from the sql DB.
func (s *sqlimpl) Del(query sql.Enquirer, period *ExpirationPeriod) (int64, error) {

	db := sql.NewGormQueryBuilder(query, new(queryConverter)).Build(s.instance(context.TODO())).(*gorm.DB)

	if period != nil {
		if !period.End.IsZero() {
			db.Where("expiry_date < ?", period.End)
		}
		if !period.Start.IsZero() {
			db.Where("expiry_date > ?", period.Start)
		}
	}

	tx := db.Delete(&ACL{})
	if tx.Error != nil {
		return 0, tx.Error
	}

	/*if tx.RowsAffected > 0 {

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
	}*/

	return tx.RowsAffected, nil
}

type queryConverter idm.ACLSingleQuery

func (c *queryConverter) Convert(val *anypb.Any, in any) (out any, ok bool) {

	q := new(idm.ACLSingleQuery)

	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false
	}

	db := in.(*gorm.DB)

	if len(q.RoleIDs) > 0 {
		db = db.Where("role_id in (?)", db.Model(&Role{}).Where("uuid IN ?", q.GetRoleIDs()))
	}

	if len(q.WorkspaceIDs) > 0 {
		db = db.Where("workspace_id IN ?", db.Model(&Workspace{}).Where("uuid IN ?", q.GetWorkspaceIDs()))
	}

	if len(q.NodeIDs) > 0 {
		db = db.Where("node_id IN ?", db.Model(&Node{}).Where("uuid IN ?", q.GetNodeIDs()))
	}

	// Special case for Actions
	if len(q.Actions) > 0 {
		var args [][]interface{}

		for _, act := range q.Actions {
			args = append(args, []interface{}{act.GetName(), act.GetValue()})
		}

		db = db.Where("(action_name, action_value) IN ?", args)
	}

	return db, true
}
