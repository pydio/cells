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

	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/meta"
	"github.com/pydio/cells/v5/idm/meta/json_schema"
)

var (
	NsErr = errors.RegisterBaseSentinel(errors.SqlDAO, "sql user-meta namespaces")
)

func nsTag(err error) error {
	return errors.Tag(err, NsErr)
}

type MetaNamespace struct {
	Namespace      string          `gorm:"primaryKey;column:namespace;type:varchar(255)"`
	Label          string          `gorm:"column:label;type:varchar(255)"`
	Order          int32           `gorm:"column:ns_order;"`
	Indexable      bool            `gorm:"column:indexable;"`
	Definition     []byte          `gorm:"column:definition;"`
	PromptOnUpload bool            `gorm:"column:prompt_on_upload;type:boolean;nullable"`
	EnforceDefault bool            `gorm:"column:enforce_default;type:boolean;nullable"`
	JsonSchema     *datatypes.JSON `gorm:"column:json_schema"`
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
	res.EnforceDefault = u.EnforceDefault
	res.PromptOnUpload = u.PromptOnUpload
	schema, err := json_schema.JsonToProtoStruct(u.JsonSchema)
	if err != nil {
		res.JsonSchema = nil
	}
	res.JsonSchema = schema

	return res
}

func (u *MetaNamespace) From(res *idm.UserMetaNamespace) *MetaNamespace {
	u.Namespace = res.Namespace
	u.Label = res.Label
	u.Order = res.Order
	u.Indexable = res.Indexable
	u.Definition = []byte(res.JsonDefinition)
	u.EnforceDefault = res.EnforceDefault
	u.PromptOnUpload = res.PromptOnUpload
	s, err := json_schema.GetJsonSchema(json_schema.LegacyTypeToLabel(u.Definition))
	if err == nil && s != nil {
		schemaAsJson := datatypes.JSON(s)
		u.JsonSchema = &schemaAsJson
	}
	return u
}

func (u *MetaNamespace) FromExisting(res *idm.UserMetaNamespace) (*MetaNamespace, error) {
	jssc := json_schema.ValidateSchemaFromPbStruct(res.JsonSchema)

	if jssc != nil { // TODO move validation outside of DAO
		return nil, jssc
	}
	u.Namespace = res.Namespace
	u.Label = res.Label
	u.Order = res.Order
	u.Indexable = res.Indexable
	u.Definition = []byte(res.JsonDefinition)
	u.EnforceDefault = res.EnforceDefault
	u.PromptOnUpload = res.PromptOnUpload
	var js, _ = json_schema.ProtoStructToJson(res.JsonSchema)
	u.JsonSchema = js
	return u, nil
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

	var bm *MetaNamespace
	tx := s.Where(&MetaNamespace{Namespace: meta.ReservedNamespaceBookmark}).First(&bm)
	if tx.Error != nil && errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		log.Logger(ctx).Info("creating namespace bookmark")
		if err, _ := s.Upsert(ctx, &idm.UserMetaNamespace{
			Namespace: meta.ReservedNamespaceBookmark,
			Label:     "Bookmarks",
			Policies: []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "*", Effect: service.ResourcePolicy_allow},
				{Action: service.ResourcePolicyAction_WRITE, Subject: "*", Effect: service.ResourcePolicy_allow},
			},
		}); err != nil {
			return err
		}
	}

	return nil
}

// Add inserts a namespace // Upsert
func (s *nsSqlImpl) Upsert(ctx context.Context, ns *idm.UserMetaNamespace) (error, bool) {
	// Update existing
	var ex *MetaNamespace
	tx0 := s.Session(ctx).Where(&MetaNamespace{Namespace: ns.Namespace}).First(&ex)
	if tx0.Error != nil && !errors.Is(tx0.Error, gorm.ErrRecordNotFound) {
		return nsTag(tx0.Error), false
	}
	if tx0.Error == nil {
		validNs, er := (&MetaNamespace{}).FromExisting(ns)
		if er != nil {
			return nsTag(er), false
		}

		tx2 := s.Session(ctx).Where("namespace = ?", ns.Namespace).Updates(validNs)
		if tx2.Error != nil {
			return nsTag(tx2.Error), false
		}
		return nil, true
	}
	// Insert
	tx1 := s.Session(ctx).Create((&MetaNamespace{}).From(ns))
	if tx1.Error != nil {
		return nsTag(tx1.Error), false
	}

	if len(ns.Policies) > 0 {
		if pols, err := s.AddPolicies(ctx, false, ns.Namespace, ns.Policies); err != nil {
			return nsTag(err), false
		} else {
			ns.Policies = pols
		}
	}

	return nil, false
}

// Del removes a namespace
func (s *nsSqlImpl) Del(ctx context.Context, ns *idm.UserMetaNamespace) (e error) {
	whereClause := (&MetaNamespace{}).From(ns)
	whereClause.JsonSchema = nil

	tx := s.Session(ctx).Where(whereClause).Delete(&MetaNamespace{})
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

// Gets a JSON Schema for all namespaces with combined field props
func (s *nsSqlImpl) GetJSONSchema(ctx context.Context) (*structpb.Struct, error) {
	var mns []*MetaNamespace
	tx := s.Session(ctx).
		Where(
			"definition IS NOT NULL AND definition != '' AND prompt_on_upload = ?",
			true,
		).Find(&mns)
	if tx.Error != nil {
		return nil, nsTag(tx.Error)
	}

	if len(mns) == 0 {
		return nil, nil
	}

	nss := make([]json_schema.NamespaceDescriptor, 0, len(mns))
	for _, m := range mns {
		nss = append(nss, json_schema.NamespaceDescriptor{
			Label:          m.Label,
			Definition:     m.Definition,
			Namespace:      m.Namespace,
			PromptOnUpload: m.PromptOnUpload,
			JsonSchema:     m.JsonSchema,
		})
	}

	schema, err := json_schema.BuildNamespacesJsonSchema(nss)
	if err != nil {
		return nil, err
	}
	return schema, nil
}
