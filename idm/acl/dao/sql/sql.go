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
	"errors"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/acl"
)

func init() {
	acl.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) acl.DAO {
	return &sqlimpl{DB: db}
}

type ACL struct {
	ID          int64     `gorm:"primaryKey;column:id;autoIncrement;"`
	ActionName  string    `gorm:"column:action_name;type:varchar(500)"`
	ActionValue string    `gorm:"column:action_value;type:varchar(500)"`
	RoleID      int       `gorm:"column:role_id;default:-1;"`
	WorkspaceID int       `gorm:"column:workspace_id; default: -1"`
	NodeID      int       `gorm:"column:node_id; default: -1"`
	Role        Role      `gorm:"foreignKey:RoleID"`
	Workspace   Workspace `gorm:"foreignKey:WorkspaceID"`
	Node        Node      `gorm:"foreignKey:NodeID"`
	Expiry      time.Time `gorm:"column:expire_at;type:timestamp;default:null"`
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
	DB *gorm.DB

	once *sync.Once
}

func (*ACL) TableName(namer schema.Namer) string {
	return namer.TableName("acls")
}

func (*Role) TableName(namer schema.Namer) string {
	return namer.TableName("acl_roles")
}

func (*Workspace) TableName(namer schema.Namer) string {
	return namer.TableName("acl_workspaces")
}

func (*Node) TableName(namer schema.Namer) string {
	return namer.TableName("acl_nodes")
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	s.instance(ctx) //.AutoMigrate(&ACL{}, &Role{}, &Workspace{}, &Node{})

	return nil
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.AutoMigrate(&ACL{}, &Role{}, &Workspace{}, &Node{})
	})

	return db
}

// Add inserts an ACL to the underlying SQL DB
func (s *sqlimpl) Add(ctx context.Context, in interface{}) error {
	return s.addWithDupCheck(ctx, in, true)
}

// addWithDupCheck insert and override existing value if it's a
// duplicate key and the ACL is expired
func (s *sqlimpl) addWithDupCheck(ctx context.Context, in interface{}, check bool) error {

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

		tx := s.instance(ctx).Where(workspace).FirstOrCreate(&workspace)
		if tx.Error != nil {
			return tx.Error
		}
	}

	node := Node{UUID: val.GetNodeID()}
	if node.UUID != "" {
		tx := s.instance(ctx).Where(node).FirstOrCreate(&node)
		if tx.Error != nil {
			return tx.Error
		}
	}

	role := Role{UUID: val.GetRoleID()}
	if role.UUID != "" {
		tx := s.instance(ctx).Where(role).FirstOrCreate(&role)
		if tx.Error != nil {
			return tx.Error
		}
	}

	log.Logger(ctx).Debug("AddACL", zap.String("r", role.UUID), zap.String("w", workspace.UUID), zap.String("n", node.UUID), zap.Any("value", val))

	acl := ACL{
		ActionName:  val.Action.Name,
		ActionValue: val.Action.Value,
		Role:        role,
		Workspace:   workspace,
		Node:        node,
	}

	tx := s.instance(ctx).Create(&acl)
	if tx.Error != nil {
		return tx.Error
	}

	val.ID = fmt.Sprintf("%v", acl.ID)

	// TODO - duplicate
	/*
		OLD CODE WAS
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
	*/

	return nil
}

// Search in the underlying SQL DB.
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer, out *[]interface{}, period *acl.ExpirationPeriod) error {
	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.instance(ctx))
	if er != nil {
		return er
	}
	// Legacy - TODO
	//
	//if period != nil {
	//	expressions = append(expressions, dao.expirationToGoqu(period, a).Expressions()...)
	//} else {
	//	// By default, exclude all expired ACLs
	//	expressions = append(expressions,
	//		goqu.Or(
	//			a.Col("expires_at").IsNull(),
	//			a.Col("expires_at").Gt(dao.valueForTime(time.Now())),
	//		),
	//	)
	//}
	var acls []ACL

	tx := db.Preload("Role").Preload("Workspace").Preload("Node").Find(&acls)
	if tx.Error != nil {
		return tx.Error
	}

	for _, acl := range acls {
		val := new(idm.ACL)
		action := new(idm.ACLAction)

		val.ID = fmt.Sprintf("%d", acl.ID)
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
func (s *sqlimpl) SetExpiry(ctx context.Context, query sql.Enquirer, t time.Time, period *acl.ExpirationPeriod) (int64, error) {

	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.instance(ctx))
	if er != nil {
		return 0, er
	}

	if period != nil {
		if !period.End.IsZero() {
			db = db.Where("expiry_date < ?", period.End)
		}
		if !period.Start.IsZero() {
			db = db.Where("expiry_date > ?", period.Start)
		}
	}

	tx := db.Updates(&ACL{Expiry: t})
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

// Del from the sql DB.
func (s *sqlimpl) Del(ctx context.Context, query sql.Enquirer, period *acl.ExpirationPeriod) (int64, error) {

	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.instance(ctx))
	if er != nil {
		return 0, er
	}

	if period != nil {
		if !period.End.IsZero() {
			db = db.Where("expiry_date < ?", period.End)
		}
		if !period.Start.IsZero() {
			db = db.Where("expiry_date > ?", period.Start)
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

func (c *queryConverter) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	q := new(idm.ACLSingleQuery)

	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false, nil
	}
	count := 0

	if len(q.RoleIDs) > 0 {
		count++
		subQuery := db.Session(&gorm.Session{NewDB: true}).Model(&Role{}).Select("id").Where("uuid IN (?)", q.GetRoleIDs())
		db = db.Where("role_id IN (?)", subQuery)
	}

	if len(q.WorkspaceIDs) > 0 {
		count++
		subQuery := db.Session(&gorm.Session{NewDB: true}).Model(&Workspace{}).Select("id").Where("uuid IN (?)", q.GetWorkspaceIDs())
		db = db.Where("workspace_id IN (?)", subQuery)
	}

	if len(q.NodeIDs) > 0 {
		count++
		subQuery := db.Session(&gorm.Session{NewDB: true}).Model(&Node{}).Select("id").Where("uuid IN (?)", q.GetNodeIDs())
		db = db.Where("node_id IN (?)", subQuery)
	}

	// Reproducing old code that was creating ORs for all actions, and handling case where Value can be empty or multiple
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
		for actName, actValues := range actionsByName {
			if len(actValues) > 0 {
				tx1 := db.Session(&gorm.Session{NewDB: true})
				if len(actValues) == 1 {
					db = db.Or(tx1.Where("action_name=?", actName).Where("action_value=?", actValues[0]))
				} else {
					db = db.Or(tx1.Where("action_name=?", actName).Where("action_value IN ?", actValues))
				}
			} else {
				db = db.Or("action_name=?", actName)
			}
			count++
		}
	}

	return db, count > 0, nil
}
