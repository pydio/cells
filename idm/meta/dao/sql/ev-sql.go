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
	"gorm.io/datatypes"
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

// MetaEntity model
type MetaEntity struct {
	UUID        string          `gorm:"primaryKey;column:uuid;type:varchar(255);notNull"`
	Label       string          `gorm:"column:label;type:varchar(100);notNull;index;unique"`
	Description string          `gorm:"column:description;type:varchar(255)"`
	LabelI18n   *datatypes.JSON `gorm:"column:label_i18n;type:json"`

	Values []MetaEntityValue `gorm:"foreignKey:EntityUUID;references:UUID;constraint:OnDelete:CASCADE"`
}

func (*MetaEntity) TableName(namer schema.Namer) string {
	return namer.TableName("meta_entities")
}

// MetaEntityValue model
type MetaEntityValue struct {
	UUID       string `gorm:"primaryKey;column:uuid;type:varchar(255);notNull"`
	Label      string `gorm:"column:label;type:varchar(100);notNull;uniqueIndex:idx_entity_label"`
	EntityUUID string `gorm:"column:entity_uuid;type:varchar(255);uniqueIndex:idx_entity_label"`

	Entity *MetaEntity `gorm:"foreignKey:EntityUUID;references:UUID;constraint:OnDelete:CASCADE"`
}

func (*MetaEntityValue) TableName(namer schema.Namer) string {
	return namer.TableName("meta_entity_values")
}

// MetaValueEntity  model - Link table between Meta and MetaEntityValue
type MetaValueEntity struct {
	MetaUUID   string `gorm:"primaryKey;column:meta_uuid;type:varchar(255)"`
	EValueUUID string `gorm:"primaryKey;column:e_value_uuid;type:varchar(255)"`

	Meta        *Meta            `gorm:"foreignKey:MetaUUID;references:Uuid;constraint:OnDelete:CASCADE"`
	EntityValue *MetaEntityValue `gorm:"foreignKey:EValueUUID;references:UUID;constraint:OnDelete:CASCADE"`
}

func (*MetaValueEntity) TableName(namer schema.Namer) string {
	return namer.TableName("meta_value_entities")
}

func NewEntityValueDAO(db *gorm.DB) meta.EntityValueDAO {
	return &tagsSqlImpl{
		Abstract: sql.NewAbstract(db),
		DAO:      resources.NewDAO(db),
	}
}

type tagsSqlImpl struct {
	*sql.Abstract
	resources.DAO
}

func (s *tagsSqlImpl) Migrate(ctx context.Context) error {
	return s.Session(ctx).AutoMigrate(&MetaEntity{}, &MetaEntityValue{}, &MetaValueEntity{})
}

func (u *MetaEntity) AsEntity(res *idm.MetaEntity) *idm.MetaEntity {
	res.Uuid = u.UUID
	res.Label = u.Label
	res.Description = u.Description
	if u.LabelI18n != nil {
		res.LabelI18N = u.LabelI18n.String()
	}

	return res
}

func (u *MetaEntity) FromEntity(res *idm.MetaEntity) *MetaEntity {
	u.UUID = res.Uuid
	if u.UUID == "" {
		u.UUID = uuid.New().String()
	}
	u.Label = res.Label
	u.Description = res.Description
	if res.LabelI18N != "" {
		json := datatypes.JSON(res.LabelI18N)
		u.LabelI18n = &json
	}

	return u
}

func (s *tagsSqlImpl) CreateEntity(ctx context.Context, entity *idm.MetaEntity) (*idm.MetaEntity, error) {
	res := (&MetaEntity{}).FromEntity(entity)
	tx := s.Session(ctx).Create(res)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrDuplicatedKey) {
			return nil, evTagError(tx.Error)
		}
		return nil, evTagError(tx.Error)
	}

	return res.AsEntity(&idm.MetaEntity{}), nil
}

func (s *tagsSqlImpl) SetEntities(ctx context.Context, entities []*idm.MetaEntity) ([]*idm.MetaEntity, error) {
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

func (s *tagsSqlImpl) GetEntity(ctx context.Context, entityUuid string) (*idm.MetaEntity, error) {
	var model MetaEntity
	tx := s.Session(ctx).Where(&MetaEntity{UUID: entityUuid}).First(&model)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, evTagError(tx.Error)
	}

	return model.AsEntity(&idm.MetaEntity{}), nil
}

func (u *MetaEntityValue) AsEntityValue(res *idm.EntityValue) *idm.EntityValue {
	res.Uuid = u.UUID
	res.Label = u.Label
	res.EntityUuid = u.EntityUUID

	return res
}

func (u *MetaEntityValue) FromEntityValue(res *idm.EntityValue) *MetaEntityValue {
	u.UUID = uuid.New().String()
	u.Label = res.Label
	u.EntityUUID = res.EntityUuid

	return u
}

func (s *tagsSqlImpl) CreateEntityValue(ctx context.Context, value *idm.EntityValue) (*idm.EntityValue, error) {
	model := (&MetaEntityValue{}).FromEntityValue(value)

	tx := s.Session(ctx).Create(model)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return model.AsEntityValue(&idm.EntityValue{}), nil
}

func (s *tagsSqlImpl) GetEntityValues(ctx context.Context, entityUuid string) ([]*idm.EntityValue, error) {
	var models []*MetaEntityValue
	tx := s.Session(ctx).Where(&MetaEntityValue{EntityUUID: entityUuid}).Find(&models)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	values := make([]*idm.EntityValue, len(models))
	for i, model := range models {
		values[i] = model.AsEntityValue(&idm.EntityValue{})
	}

	return values, nil
}

func (s *tagsSqlImpl) LinkMetaToValues(ctx context.Context, metaUuid string, valueUuids []string) error {
	if err := s.validateUUIDs(metaUuid); err != nil {
		return err
	}

	if len(valueUuids) == 0 {
		return nil
	}

	if err := s.validateUUIDs(valueUuids...); err != nil {
		return err
	}

	namer := s.DB.NamingStrategy
	tableName := (&MetaValueEntity{}).TableName(namer)

	for _, valueUuid := range valueUuids {
		link := MetaValueEntity{
			MetaUUID:   metaUuid,
			EValueUUID: valueUuid,
		}

		tx := s.Session(ctx).Table(tableName).Clauses(clause.OnConflict{DoNothing: true}).Create(&link)
		if tx.Error != nil {
			return evTagError(tx.Error)
		}
	}

	return nil
}

func (s *tagsSqlImpl) validateUUIDs(uuids ...string) error {
	for _, u := range uuids {
		if _, err := uuid.Parse(u); err != nil {
			return evTagError(errors.New("invalid uuid: " + u))
		}
	}
	return nil
}

func (s *tagsSqlImpl) UnlinkMetaFromValues(ctx context.Context, metaUuid string, valueUuids []string) error {
	if err := s.validateUUIDs(metaUuid); err != nil {
		return err
	}

	if len(valueUuids) == 0 {
		return nil
	}

	if err := s.validateUUIDs(valueUuids...); err != nil {
		return err
	}

	namer := s.DB.NamingStrategy
	tx := s.Session(ctx).Table((&MetaValueEntity{}).TableName(namer)).Where("meta_uuid = ? AND e_value_uuid IN ?", metaUuid, valueUuids).Delete(&MetaValueEntity{})
	if tx.Error != nil {
		return evTagError(tx.Error)
	}

	return nil
}

func (s *tagsSqlImpl) GetMetaEntityValues(ctx context.Context, metaUuid string) ([]*idm.EntityValue, error) {
	var models []*MetaEntityValue

	namer := s.DB.NamingStrategy
	tx := s.Session(ctx).
		Table((&MetaEntityValue{}).TableName(namer)).
		Select((&MetaEntityValue{}).TableName(namer)+".*").
		Joins("INNER JOIN "+(&MetaValueEntity{}).TableName(namer)+" ON "+(&MetaEntityValue{}).TableName(namer)+".uuid = "+(&MetaValueEntity{}).TableName(namer)+".e_value_uuid").
		Where((&MetaValueEntity{}).TableName(namer)+".meta_uuid = ?", metaUuid).
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

// CreateEntityValueAndLink creates entity values and links them to metadata in one operation
func (s *tagsSqlImpl) CreateEntityValueAndLink(ctx context.Context, metaUuid string, entityUuid string, labels []string) ([]*idm.EntityValue, error) {
	if len(labels) == 0 {
		return []*idm.EntityValue{}, nil
	}

	createdValues := make([]*idm.EntityValue, 0, len(labels))
	valueUuids := make([]string, 0, len(labels))

	// Create or get all entity values
	for _, label := range labels {
		model := (&MetaEntityValue{}).FromEntityValue(&idm.EntityValue{
			Label:      label,
			EntityUuid: entityUuid,
		})

		tx := s.Session(ctx).Create(model)
		if tx.Error != nil {
			return nil, evTagError(tx.Error)
		}

		value := model.AsEntityValue(&idm.EntityValue{})
		createdValues = append(createdValues, value)
		valueUuids = append(valueUuids, value.Uuid)
	}

	// Link all values to the metadata
	if err := s.LinkMetaToValues(ctx, metaUuid, valueUuids); err != nil {
		return nil, err
	}

	return createdValues, nil
}
