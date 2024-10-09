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
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/acl"
)

func init() {
	acl.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) acl.DAO {
	return &sqlimpl{
		Abstract: sql.NewAbstract(db),
	}
}

type ACL struct {
	ID          int64      `gorm:"primaryKey;column:id;autoIncrement;"`
	ActionName  string     `gorm:"column:action_name;type:varchar(500);uniqueIndex:acls_u1"`
	ActionValue string     `gorm:"column:action_value;type:varchar(500)"`
	RoleID      int        `gorm:"column:role_id;default:-1;uniqueIndex:acls_u1"`
	WorkspaceID int        `gorm:"column:workspace_id; default: -1;uniqueIndex:acls_u1"`
	NodeID      int        `gorm:"column:node_id; default: -1;uniqueIndex:acls_u1"`
	Role        Role       `gorm:"foreignKey:RoleID"`
	Workspace   Workspace  `gorm:"foreignKey:WorkspaceID"`
	Node        Node       `gorm:"foreignKey:NodeID"`
	Creation    time.Time  `gorm:"column:created_at;type:timestamp;default:current_timestamp;"`
	Expiry      *time.Time `gorm:"column:expires_at;type:timestamp;default:null"`
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
	*sql.Abstract

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

func (s *sqlimpl) Migrate(ctx context.Context) error {
	db := s.Session(ctx)
	if er := db.AutoMigrate(&ACL{}, &Role{}, &Workspace{}, &Node{}); er != nil {
		return er
	}
	// Create default "-1" values for each tables
	tx := db.Save(&Role{ID: -1})
	tx = db.Save(&Workspace{ID: -1})
	tx = db.Save(&Node{ID: -1})
	return tx.Error
}

// Add inserts an ACL to the underlying SQL DB
func (s *sqlimpl) Add(ctx context.Context, in interface{}) error {
	return s.addWithDupCheck(ctx, s.Session(ctx), in, true)
}

// addWithDupCheck insert and override existing value if it's a
// duplicate key and the ACL is expired
func (s *sqlimpl) addWithDupCheck(ctx context.Context, session *gorm.DB, in interface{}, check bool) error {

	val, ok := in.(*idm.ACL)
	if !ok {
		return errors.WithMessage(errors.SqlDAO, "Wrong type")
	}

	if val.Action == nil {
		return errors.WithMessage(errors.SqlDAO, "Missing action value")
	}

	workspace := Workspace{UUID: val.GetWorkspaceID()}
	if workspace.UUID != "" {
		workspace.UUID = val.GetWorkspaceID()
		if tx := session.Where(workspace).FirstOrCreate(&workspace); tx.Error != nil {
			return tx.Error
		}
	}

	node := Node{UUID: val.GetNodeID()}
	if node.UUID != "" {
		if tx := session.Where(node).FirstOrCreate(&node); tx.Error != nil {
			return tx.Error
		}
	}

	role := Role{UUID: val.GetRoleID()}
	if role.UUID != "" {
		if tx := session.Where(role).FirstOrCreate(&role); tx.Error != nil {
			return tx.Error
		}
	}

	log.Logger(ctx).Debug("AddACL", zap.String("r", role.UUID), zap.String("w", workspace.UUID), zap.String("n", node.UUID), zap.Any("value", val))

	a := &ACL{
		ActionName:  val.Action.Name,
		ActionValue: val.Action.Value,
		Role:        role,
		Workspace:   workspace,
		Node:        node,
	}

	if tx := session.Create(a); tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrDuplicatedKey) && check {
			if tx = session.Where("expires_at IS NOT NULL AND expires_at < ?", time.Now()).Where(a).Delete(a); tx.Error == nil && tx.RowsAffected > 0 {
				fmt.Println("[AddACL] Replacing one duplicate row that was in fact expired")
				return s.addWithDupCheck(ctx, session, in, false)
			}
		}
		return tx.Error
	}

	val.ID = fmt.Sprintf("%v", a.ID)

	return nil
}

// Search in the underlying SQL DB.
func (s *sqlimpl) Search(ctx context.Context, query service.Enquirer, out *[]interface{}, period *acl.ExpirationPeriod) error {
	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.Session(ctx))
	if er != nil {
		return er
	}

	var acls []ACL
	db = db.Preload("Role").Preload("Workspace").Preload("Node")
	if period != nil {
		db = s.wherePeriod(db, period)
	} else {
		db = db.Where("expires_at IS NULL or expires_at > ?", time.Now())
	}

	tx := db.Find(&acls)
	if tx.Error != nil {
		return tx.Error
	}

	for _, a := range acls {
		val := new(idm.ACL)
		action := new(idm.ACLAction)

		val.ID = fmt.Sprintf("%d", a.ID)
		val.NodeID = a.Node.UUID
		val.RoleID = a.Role.UUID
		val.WorkspaceID = a.Workspace.UUID

		action.Name = a.ActionName
		action.Value = a.ActionValue

		val.Action = action
		*out = append(*out, val)
	}

	return nil
}

// SetExpiry sets an expiry timestamp on the acl
func (s *sqlimpl) SetExpiry(ctx context.Context, query service.Enquirer, t *time.Time, period *acl.ExpirationPeriod) (int64, error) {

	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.Session(ctx))
	if er != nil {
		return 0, er
	}

	if period != nil {
		db = s.wherePeriod(db, period)
	}

	tx := db.Model(ACL{}).Update("Expiry", t)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

// Del from the sql DB.
func (s *sqlimpl) Del(ctx context.Context, query service.Enquirer, period *acl.ExpirationPeriod) (int64, error) {

	db, er := service.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.Session(ctx))
	if er != nil {
		return 0, er
	}

	if period != nil {
		db = s.wherePeriod(db, period)
	}

	tx := db.Delete(&ACL{})
	if tx.Error != nil {
		return 0, tx.Error
	}

	if tx.RowsAffected > 0 {
		newInstance := s.Session(ctx)
		subQuery := newInstance.Session(&gorm.Session{}).Model(&ACL{}).Distinct("workspace_id")
		if cleanTx := newInstance.Where("id != -1").Not("id IN (?)", subQuery).Delete(&Workspace{}); cleanTx.Error == nil {
			log.Logger(ctx).Debugf("Cleaned %d workspaces", cleanTx.RowsAffected)
		} else {
			return 0, cleanTx.Error
		}

		subQuery2 := newInstance.Session(&gorm.Session{}).Model(&ACL{}).Distinct("node_id")
		if cleanTx := newInstance.Where("id != -1").Not("id IN (?)", subQuery2).Delete(&Node{}); cleanTx.Error == nil {
			log.Logger(ctx).Debugf("Cleaned %d nodes", cleanTx.RowsAffected)
		} else {
			return 0, cleanTx.Error
		}

		subQuery3 := newInstance.Session(&gorm.Session{}).Model(&ACL{}).Distinct("role_id")
		if cleanTx := newInstance.Where("id != -1").Not("id IN (?)", subQuery3).Delete(&Role{}); cleanTx.Error == nil {
			log.Logger(ctx).Debugf("Cleaned %d roles", cleanTx.RowsAffected)
		} else {
			return 0, cleanTx.Error
		}
	}

	return tx.RowsAffected, nil
}

func (s *sqlimpl) wherePeriod(db *gorm.DB, period *acl.ExpirationPeriod) *gorm.DB {
	if period == nil {
		return db
	}
	if !period.End.IsZero() {
		db = db.Where("expires_at < ?", period.End)
	}
	if !period.Start.IsZero() {
		db = db.Where("expires_at > ?", period.Start)
	}
	return db
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

		tx := db.Session(&gorm.Session{NewDB: true})
		for actName, actValues := range actionsByName {
			if len(actValues) > 0 {
				tx1 := db.Session(&gorm.Session{NewDB: true})
				if len(actValues) == 1 {
					tx = tx.Or(tx1.Where("action_name=?", actName).Where("action_value=?", actValues[0]))
				} else {
					tx = tx.Or(tx1.Where("action_name=?", actName).Where("action_value IN ?", actValues))
				}
			} else {
				tx = tx.Or("action_name=?", actName)
			}
			count++
		}
		db = db.Where(tx)
	}

	return db, count > 0, nil
}
