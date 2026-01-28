/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/idm/meta"
)

var (
	EntityValueErr = errors.RegisterBaseSentinel(errors.SqlDAO, "sql entity values")
)

func evTagError(err error) error {
	return errors.Tag(err, EntityValueErr)
}

type Entities struct {
	UUID        string `gorm:"primaryKey;column:uuid;type:varchar(255);notNull"`
	Label       string `gorm:"column:label;type:varchar(100);notNull"`
	Description string `gorm:"column:description;type:varchar(255)"`

	Values []EntityValues `gorm:"foreignKey:EntityUUID;references:UUID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (*Entities) TableName(namer schema.Namer) string {
	return namer.TableName("meta_entities")
}

type EntityValues struct {
	UUID       string `gorm:"primaryKey;column:uuid;type:varchar(255);notNull"`
	Label      string `gorm:"column:label;type:varchar(100);notNull"`
	EntityUUID string `gorm:"column:entity_uuid;type:varchar(255);notNull"`

	Entity *Entities `gorm:"foreignKey:EntityUUID;references:UUID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Metas  []Meta    `gorm:"many2many:meta_values_rel;joinForeignKey:EValueUUID;JoinReferences:MetaUUID"`
}

func (*EntityValues) TableName(namer schema.Namer) string {
	return namer.TableName("meta_entity_values")
}

type MetaValuesRel struct {
	MetaUUID   string `gorm:"primaryKey;column:meta_uuid;type:varchar(255);notNull;index:idx_meta_evalue,composite:meta_evalue"`
	EValueUUID string `gorm:"primaryKey;column:e_value_uuid;type:varchar(255);notNull;index:idx_meta_evalue,composite:meta_evalue"`
}

func (*MetaValuesRel) TableName(namer schema.Namer) string {
	return namer.JoinTableName("meta_values_rel")
}

func NewEntityValueDAO(db *gorm.DB) meta.EntityValueDAO {

	return &evSqlImpl{
		Abstract: sql.NewAbstract(db),
		DAO:      resources.NewDAO(db),
	}
}

type evSqlImpl struct {
	*sql.Abstract
	resources.DAO
}

func (s *evSqlImpl) Migrate(ctx context.Context) error {
	return s.Session(ctx).AutoMigrate(&Entities{}, &EntityValues{})
}

func (u *Entities) AsEntity(res *idm.MetaEntity) *idm.MetaEntity {
	res.Uuid = u.UUID
	res.Label = u.Label
	res.Description = u.Description

	return res
}

func (u *Entities) FromEntity(res *idm.MetaEntity) *Entities {
	u.UUID = res.Uuid
	if u.UUID == "" {
		u.UUID = uuid.New().String()
	}
	u.Label = res.Label
	u.Description = res.Description

	return u
}

func (s *evSqlImpl) CreateEntity(ctx context.Context, entity *idm.MetaEntity) (*idm.MetaEntity, error) {
	res := (&Entities{}).FromEntity(entity)
	tx := s.Session(ctx).Create(res)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return res.AsEntity(&idm.MetaEntity{}), nil
}

func (s *evSqlImpl) SetEntities(ctx context.Context, entities []*idm.MetaEntity) ([]*idm.MetaEntity, error) {
	createdEntities := make([]*idm.MetaEntity, 0, len(entities))

	for _, entity := range entities {
		created, err := s.CreateEntity(ctx, entity)
		if err != nil {
			return nil, err
		}
		createdEntities = append(createdEntities, created)
	}

	return createdEntities, nil
}

func (s *evSqlImpl) GetEntity(ctx context.Context, entityUuid string) (*idm.MetaEntity, error) {
	var model Entities
	tx := s.Session(ctx).Where(&Entities{UUID: entityUuid}).First(&model)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, evTagError(tx.Error)
	}

	return model.AsEntity(&idm.MetaEntity{}), nil
}

func (u *EntityValues) AsEntityValue(res *idm.EntityValue) *idm.EntityValue {
	res.Uuid = u.UUID
	res.Label = u.Label
	res.EntityUuid = u.EntityUUID

	return res
}

func (u *EntityValues) FromEntityValue(res *idm.EntityValue) *EntityValues {
	u.UUID = uuid.New().String()
	u.Label = res.Label
	u.EntityUUID = res.EntityUuid

	return u
}

func (s *evSqlImpl) CreateEntityValue(ctx context.Context, value *idm.EntityValue) (*idm.EntityValue, error) {
	model := (&EntityValues{}).FromEntityValue(value)

	tx := s.Session(ctx).Create(model)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return model.AsEntityValue(&idm.EntityValue{}), nil
}

func (s *evSqlImpl) GetEntityValues(ctx context.Context, entityUuid string) ([]*idm.EntityValue, error) {
	var models []*EntityValues
	tx := s.Session(ctx).Where(&EntityValues{EntityUUID: entityUuid}).Find(&models)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	values := make([]*idm.EntityValue, len(models))
	for i, model := range models {
		values[i] = model.AsEntityValue(&idm.EntityValue{})
	}

	return values, nil
}

func (s *evSqlImpl) validateUUIDs(uuids ...string) error {
	for _, u := range uuids {
		if _, err := uuid.Parse(u); err != nil {
			return evTagError(errors.New("invalid uuid: " + u))
		}
	}
	return nil
}

func (s *evSqlImpl) LinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) error {
	if err := s.validateUUIDs(metaUuid, valueUuid); err != nil {
		return err
	}

	link := MetaValuesRel{
		MetaUUID:   metaUuid,
		EValueUUID: valueUuid,
	}

	tx := s.Session(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(&link)
	if tx.Error != nil {
		return evTagError(tx.Error)
	}

	return nil
}

func (s *evSqlImpl) GetMetaEntityValues(ctx context.Context, metaUuid string) ([]*idm.EntityValue, error) {
	var models []*EntityValues

	tx := s.Session(ctx).
		Joins("INNER JOIN meta_values_rel ON meta_entity_values.uuid = meta_values_rel.e_value_uuid").
		Where("meta_values_rel.meta_uuid = ?", metaUuid).
		Find(&models)

	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	values := make([]*idm.EntityValue, len(models))
	for i, model := range models {
		values[i] = model.AsEntityValue(&idm.EntityValue{})
	}

	return values, nil
}
