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

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/idm/meta"
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

func (*MetaNamespace) TableName(namer schema.Namer) string {
	return namer.TableName("meta_ns")
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
	return &nsSqlImpl{
		Abstract:     sql.NewAbstract(db),
		resourcesDAO: resources.NewDAO(db),
	}
}

// Impl of the SQL interface
type nsSqlImpl struct {
	*sql.Abstract
	resourcesDAO
}

func (s *nsSqlImpl) Migrate(ctx context.Context) error {

	instance := s.Session(ctx)
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
	tx := s.Session(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create((&MetaNamespace{}).From(ns))
	if tx.Error != nil {
		return nsTag(tx.Error)
	}

	if len(ns.Policies) > 0 {
		if pols, err := s.AddPolicies(ctx, false, ns.Namespace, ns.Policies); err != nil {
			return nsTag(err)
		} else {
			ns.Policies = pols
		}
	}

	return nil
}

// Del removes a namespace
func (s *nsSqlImpl) Del(ctx context.Context, ns *idm.UserMetaNamespace) (e error) {
	tx := s.Session(ctx).Where((&MetaNamespace{}).From(ns)).Delete(&MetaNamespace{})
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
	tx := s.Session(ctx).Find(&mm)
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
