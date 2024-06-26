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

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/idm/meta"
)

var (
	NsErr = errors.RegisterBaseSentinel(errors.SqlDAO, "sql user-meta namespaces")
)

func nsTag(err error) error {
	return errors.Tag(err, NsErr)
}

type MetaNamespace struct {
	Namespace  string `gorm:"primaryKey; column: namespace;"`
	Label      string `gorm:"column: label;"`
	Order      int32  `gorm:"column: ns_order;"`
	Indexable  bool   `gorm:"column: indexable;"`
	Definition []byte `gorm:"column: definition;"`
}

func (u *MetaNamespace) As(res *idm.UserMetaNamespace) *idm.UserMetaNamespace {
	res.Namespace = u.Namespace
	res.Label = u.Label
	res.Order = u.Order
	res.Indexable = u.Indexable
	res.JsonDefinition = string(u.Definition)
	return res
}

func (u *MetaNamespace) From(res *idm.UserMetaNamespace) *MetaNamespace {
	u.Namespace = res.Namespace
	u.Label = res.Label
	u.Order = res.Order
	u.Indexable = res.Indexable
	u.Definition = []byte(res.JsonDefinition)

	return u
}

func NewNSDAO(db *gorm.DB) meta.NamespaceDAO {
	resDAO := resources.NewDAO(db)
	return &nsSqlImpl{db: db, resourcesDAO: resDAO}
}

// Impl of the SQL interface
type nsSqlImpl struct {
	// *sql.Handler

	db   *gorm.DB
	once *sync.Once

	resourcesDAO
}

//// Init handler for the SQL DAO
//func (s *nsSqlImpl) Init(ctx context.Context, options configx.Values) error {
//
//	db := s.db
//
//	s.instance().AutoMigrate(&MetaNamespace{})
//
//	// Preparing the resources
//	//s.resourcesDAO.Init(ctx, options)
//
//	// TODO
//	// s.ResourcesGORM.LeftIdentifier = "idm_usr_meta_ns.namespace"
//
//	//s.Add(&idm.UserMetaNamespace{
//	//	Namespace: ReservedNamespaceBookmark,
//	//	Label:     "Bookmarks",
//	//	Policies: []*service.ResourcePolicy{
//	//		{Action: service.ResourcePolicyAction_READ, Subject: "*", Effect: service.ResourcePolicy_allow},
//	//		{Action: service.ResourcePolicyAction_WRITE, Subject: "*", Effect: service.ResourcePolicy_allow},
//	//	},
//	//})
//
//	return nil
//}

func (s *nsSqlImpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)
}

func (s *nsSqlImpl) Migrate(ctx context.Context) error {

	instance := s.instance(ctx)
	if err := instance.AutoMigrate(&MetaNamespace{}); err != nil {
		return err
	}

	if err := s.resourcesDAO.Migrate(ctx); err != nil {
		return err
	}

	if err := s.Add(ctx, &idm.UserMetaNamespace{
		Namespace: meta.ReservedNamespaceBookmark,
		Label:     "Bookmarks",
		Policies: []*service.ResourcePolicy{
			{Action: service.ResourcePolicyAction_READ, Subject: "*", Effect: service.ResourcePolicy_allow},
			{Action: service.ResourcePolicyAction_WRITE, Subject: "*", Effect: service.ResourcePolicy_allow},
		},
	}); err != nil {
		return err
	}

	return nil
}

// Add inserts a namespace
func (s *nsSqlImpl) Add(ctx context.Context, ns *idm.UserMetaNamespace) error {
	tx := s.instance(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create((&MetaNamespace{}).From(ns))
	if tx.Error != nil {
		return nsTag(tx.Error)
	}

	if len(ns.Policies) > 0 {
		if err := s.AddPolicies(ctx, false, ns.Namespace, ns.Policies); err != nil {
			return nsTag(err)
		}
	}

	return nil
}

// Del removes a namespace
func (s *nsSqlImpl) Del(ctx context.Context, ns *idm.UserMetaNamespace) (e error) {
	tx := s.instance(ctx).Where((&MetaNamespace{}).From(ns)).Delete(&MetaNamespace{})
	if tx.Error != nil {
		return nsTag(tx.Error)
	}

	if err := s.DeletePoliciesForResource(ctx, ns.Namespace); err != nil {
		return nsTag(err)
	}

	return nil
}

// List lists all namespaces
func (s *nsSqlImpl) List(ctx context.Context) (map[string]*idm.UserMetaNamespace, error) {
	var mm []*MetaNamespace
	tx := s.instance(ctx).Find(&mm)
	if tx.Error != nil {
		return nil, nsTag(tx.Error)
	}

	var res = make(map[string]*idm.UserMetaNamespace)
	for _, m := range mm {
		ns := m.As(&idm.UserMetaNamespace{})

		// Add policies
		pol, err := s.GetPoliciesForResource(ctx, ns.Namespace)
		if err != nil {
			return nil, nsTag(err)
		}

		ns.Policies = pol

		res[ns.Namespace] = ns
	}

	return res, nil
}
