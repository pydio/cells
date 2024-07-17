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

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/meta"
)

type resourcesDAO resources.DAO

func init() {
	meta.Drivers.Register(NewDAO)
}

var (
	MetaErr = errors.RegisterBaseSentinel(errors.SqlDAO, "sql user-meta")
)

func tag(err error) error {
	return errors.Tag(err, MetaErr)
}

func NewDAO(db *gorm.DB) meta.DAO {
	resDAO := resources.NewDAO(db)
	nsDAO := NewNSDAO(db)

	return &sqlimpl{
		db:           db,
		resourcesDAO: resDAO,
		nsDAO:        nsDAO,
	}
}

// Impl of the SQL interface
type sqlimpl struct {
	db *gorm.DB

	once *sync.Once

	resourcesDAO

	nsDAO meta.NamespaceDAO
}

type Meta struct {
	UUID      string                    `gorm:"primaryKey; column:uuid; notNull;"`
	NodeUUID  string                    `gorm:"column:node_uuid;type:varchar(255); notNull; uniqueIndex:idm_user_meta_u1;"`
	Namespace string                    `gorm:"column:namespace;type:varchar(255); notNull; uniqueIndex:idm_user_meta_u1;"`
	Owner     string                    `gorm:"column:owner;type:varchar(255); uniqueIndex:idm_user_meta_u1;"`
	Timestamp int32                     `gorm:"column:timestamp"`
	Format    string                    `gorm:"column:format;type:varchar(50)"`
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

func (dao *sqlimpl) GetNamespaceDao() meta.NamespaceDAO {
	return dao.nsDAO
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)
}

func (s *sqlimpl) Migrate(ctx context.Context) error {
	if err := s.instance(ctx).AutoMigrate(&Meta{}, &MetaNamespace{}); err != nil {
		return err
	}

	if err := s.resourcesDAO.Migrate(ctx); err != nil {
		return err
	}

	if err := s.nsDAO.Migrate(ctx); err != nil {
		return err
	}

	return nil
}

// Set adds or updates a UserMeta to the DB
func (s *sqlimpl) Set(ctx context.Context, meta *idm.UserMeta) (*idm.UserMeta, string, error) {
	target := (&Meta{}).From(meta)
	old := (&Meta{}).From(meta)
	prev := ""
	update := false

	// Attempting to create
	tx := s.instance(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(old)
	if tx.Error != nil {
		return nil, "", tag(tx.Error)
	}

	if tx.RowsAffected == 0 {
		target.UUID = old.UUID

		prev = string(target.Data)

		update = true
		tx := s.instance(ctx).Where(&Meta{UUID: old.UUID}).Updates(target)
		if tx.Error != nil {
			return nil, "", tag(tx.Error)
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
		err = s.resourcesDAO.AddPolicies(ctx, update, meta.Uuid, meta.Policies)
	}

	return meta, prev, tag(err)
}

// Del deletes meta by their Id.
func (s *sqlimpl) Del(ctx context.Context, meta *idm.UserMeta) (previousValue string, e error) {
	target := (&Meta{}).From(meta)
	old := &Meta{}

	if tx := s.instance(ctx).Where(&Meta{UUID: target.UUID, Owner: target.Owner, Namespace: target.Namespace, NodeUUID: target.NodeUUID}).Find(&old); tx.Error != nil {
		return "", tag(tx.Error)
	}

	previousValue = string(old.Data)

	if tx := s.instance(ctx).Delete(&old); tx.Error != nil {
		return "", tag(tx.Error)
	}

	if e := s.resourcesDAO.DeletePoliciesForResource(ctx, old.UUID); e != nil {
		return "", tag(e)
	}

	return previousValue, nil
}

// Search meta on their conditions
// func (s *sqlimpl) Search(metaIds []string, nodeUuids []string, namespace string, ownerSubject string, resourceQuery *service.ResourcePolicyQuery) ([]*idm.UserMeta, error) {
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer) ([]*idm.UserMeta, error) {

	rqb, err := resources.PrepareQueryBuilder(&Meta{}, s.resourcesDAO, s.instance(ctx).NamingStrategy)
	if err != nil {
		return nil, err
	}
	db, er := sql.NewQueryBuilder[*gorm.DB](query, new(queryBuilder), rqb).Build(ctx, s.instance(ctx))
	if er != nil {
		return nil, er
	}

	var metas []*Meta

	tx := db.Find(&metas)
	if tx.Error != nil {
		return nil, tag(tx.Error)
	}

	var res []*idm.UserMeta
	for _, meta := range metas {
		m := meta.As(&idm.UserMeta{})
		if policies, e := s.resourcesDAO.GetPoliciesForResource(ctx, m.Uuid); e == nil {
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

func (c *queryBuilder) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	db = db.Session(&gorm.Session{})

	q := new(idm.SearchUserMetaRequest)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return db, false, nil
	}

	count := 0
	if len(q.MetaUuids) > 0 {
		count++
		db = db.Where("uuid in ?", q.MetaUuids)
	}
	if len(q.NodeUuids) > 0 {
		count++
		db = db.Where("node_uuid in ?", q.NodeUuids)
	}
	if q.Namespace != "" {
		count++
		db = db.Where("namespace = ?", q.Namespace)
	}
	if q.ResourceSubjectOwner != "" {
		count++
		db = db.Where("owner = ?", q.ResourceSubjectOwner)
	}

	return db, count > 0, nil
}
