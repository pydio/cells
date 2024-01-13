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

package meta

import (
	"context"
	"embed"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/meta/namespace"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddMeta":      `insert into idm_usr_meta (uuid, node_uuid, namespace, owner, timestamp, format, data) values (?, ?,?,?,?,?,?)`,
		"UpdateMeta":   `update idm_usr_meta set node_uuid=?, namespace=?, owner=?, timestamp=?, format=?, data=? WHERE uuid=?`,
		"Exists":       `select uuid, data from idm_usr_meta where node_uuid=? and namespace=? and owner=?`,
		"ExistsByUuid": `select data from idm_usr_meta where uuid=?`,
		"DeleteMeta":   `delete from idm_usr_meta where uuid=?`,
	}
)

type resourcesDAO resources.DAO

// Impl of the SQL interface
type sqlimpl struct {
	db *gorm.DB

	instance func() *gorm.DB

	resourcesDAO

	nsDAO namespace.DAO
}

func (dao *sqlimpl) Name() string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) ID() string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) Metadata() map[string]string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) As(i interface{}) bool {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) Driver() string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) Dsn() string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) GetConn(ctx context.Context) (dao.Conn, error) {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) SetConn(ctx context.Context, conn dao.Conn) {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) CloseConn(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) Prefix() string {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) LocalAccess() bool {
	//TODO implement me
	panic("implement me")
}

func (dao *sqlimpl) Stats() map[string]interface{} {
	//TODO implement me
	panic("implement me")
}

type Meta struct {
	UUID      string                    `gorm:"primaryKey; column:uuid"`
	NodeUUID  string                    `gorm:"column:node_uuid; uniqueIndex:idm_user_meta_u1;"`
	Namespace string                    `gorm:"column:namespace; uniqueIndex:idm_user_meta_u1;"`
	Owner     string                    `gorm:"column:owner; uniqueIndex:idm_user_meta_u1;"`
	Timestamp int32                     `gorm:"column:timestamp"`
	Format    string                    `gorm:"column:format"`
	Data      []byte                    `gorm:"column:data"`
	Policies  []*service.ResourcePolicy `gorm:"-"`
}

func (u *Meta) As(res *idm.UserMeta) *idm.UserMeta {
	res.Uuid = u.UUID
	res.NodeUuid = u.NodeUUID
	res.Namespace = u.Namespace
	res.Policies = u.Policies
	res.JsonValue = string(u.Data)

	return res
}

func (u *Meta) From(res *idm.UserMeta) *Meta {
	u.UUID = res.Uuid
	u.NodeUUID = res.NodeUuid
	u.Namespace = res.Namespace
	u.Owner = extractOwner(res.Policies)
	u.Policies = res.Policies
	u.Data = []byte(res.JsonValue)
	u.Format = "json"
	u.Timestamp = int32(time.Now().Unix())

	return u
}

func (u *Meta) BeforeCreate(tx *gorm.DB) (err error) {
	u.UUID = uuid.New()

	return
}

func (dao *sqlimpl) GetNamespaceDao() namespace.DAO {
	return dao.nsDAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// super
	db := s.db

	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_meta") }

	s.instance().AutoMigrate(&Meta{})

	if err := s.resourcesDAO.Init(ctx, options); err != nil {
		return err
	}

	if err := s.nsDAO.Init(ctx, options); err != nil {
		return err
	}

	return nil
}

// Set adds or updates a UserMeta to the DB
func (s *sqlimpl) Set(meta *idm.UserMeta) (*idm.UserMeta, string, error) {
	target := (&Meta{}).From(meta)
	old := (&Meta{}).From(meta)
	prev := ""
	update := false

	// Attempting to create
	tx := s.instance().Clauses(clause.OnConflict{DoNothing: true}).Create(old)
	if tx.Error != nil {
		return nil, "", tx.Error
	}

	if tx.RowsAffected == 0 {
		target.UUID = old.UUID

		prev = string(target.Data)

		update = true
		tx := s.instance().Where(&Meta{UUID: old.UUID}).Updates(target)
		if tx.Error != nil {
			return nil, "", tx.Error
		}
	} else {
		target = old
	}

	meta = target.As(meta)

	var err error
	if len(meta.Policies) > 0 {
		for _, p := range meta.Policies {
			p.Resource = meta.Uuid
		}
		err = s.resourcesDAO.AddPolicies(update, meta.Uuid, meta.Policies)
	}

	return meta, prev, err
}

// Del deletes meta by their Id.
func (s *sqlimpl) Del(meta *idm.UserMeta) (previousValue string, e error) {
	target := (&Meta{}).From(meta)
	old := &Meta{}

	if tx := s.instance().Where(&Meta{UUID: target.UUID, Owner: target.Owner, Namespace: target.Namespace, NodeUUID: target.NodeUUID}).Find(&old); tx.Error != nil {
		return "", tx.Error
	}

	previousValue = string(old.Data)

	if tx := s.instance().Delete(&old); tx.Error != nil {
		return "", tx.Error
	}

	if e := s.resourcesDAO.DeletePoliciesForResource(old.UUID); e != nil {
		return "", e
	}

	return previousValue, nil
}

// Search meta on their conditions
// func (s *sqlimpl) Search(metaIds []string, nodeUuids []string, namespace string, ownerSubject string, resourceQuery *service.ResourcePolicyQuery) ([]*idm.UserMeta, error) {
func (s *sqlimpl) Search(query sql.Enquirer) ([]*idm.UserMeta, error) {

	db := sql.NewGormQueryBuilder(query, new(queryBuilder), s.resourcesDAO.(sql.Converter)).Build(s.instance()).(*gorm.DB)

	var metas []*Meta

	tx := db.Find(&metas)
	if tx.Error != nil {
		return nil, tx.Error
	}

	var res []*idm.UserMeta
	for _, meta := range metas {
		m := meta.As(&idm.UserMeta{})
		if policies, e := s.resourcesDAO.GetPoliciesForResource(m.Uuid); e == nil {
			m.Policies = policies
		} else {
			log.Logger(context.Background()).Error("cannot load resource policies for uuid: "+m.Uuid, zap.Error(e))
		}

		res = append(res, m)
	}

	return res, nil
}

func extractOwner(policies []*service.ResourcePolicy) (owner string) {
	for _, policy := range policies {
		if policy.Action == service.ResourcePolicyAction_OWNER {
			return policy.Subject
		}
	}
	return ""
}

type queryBuilder idm.SearchUserMetaRequest

func (c *queryBuilder) Convert(val *anypb.Any, in any) (out any, ok bool) {

	db, ok := in.(*gorm.DB)
	if !ok {
		return in, false
	}

	db = db.Session(&gorm.Session{})

	q := new(idm.SearchUserMetaRequest)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return in, false
	}

	if len(q.MetaUuids) > 0 {
		db = db.Where("uuid in ?", q.MetaUuids)
	}
	if len(q.NodeUuids) > 0 {
		db = db.Where("node_uuid in ?", q.NodeUuids)
	}
	if q.Namespace != "" {
		db = db.Where("namespace = ?", q.Namespace)
	}
	if q.ResourceSubjectOwner != "" {
		db = db.Where("owner = ?", q.ResourceSubjectOwner)
	}

	out = db
	ok = true

	return
}
