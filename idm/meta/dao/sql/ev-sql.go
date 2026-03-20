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
	"fmt"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/sql/resources"
	resources2 "github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/idm/meta"
)

var (
	EntityValueErr = errors.RegisterBaseSentinel(errors.SqlDAO, "sql entity values")
)

func init() {
	meta.Drivers.Register(NewEntityDAO)
	meta.Drivers.Register(NewEntityValueDAO)
}

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
	UUID        string          `gorm:"primaryKey;column:uuid;type:varchar(255);notNull"`
	Label       string          `gorm:"column:label;type:varchar(100);notNull"`
	EntityUUID  string          `gorm:"column:entity_uuid;type:varchar(255);notNull"`
	DisplayJSON *datatypes.JSON `gorm:"column:display_json"`

	Entity *Entities `gorm:"foreignKey:EntityUUID;references:UUID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Metas  []Meta    `gorm:"many2many:meta_values_rel;joinForeignKey:EValueUUID;JoinReferences:MetaUUID"`
}

func (*EntityValues) TableName(namer schema.Namer) string {
	return namer.TableName("meta_entity_values")
}

type MetaValuesRel struct {
	MetaUUID   string `gorm:"primaryKey;column:meta_uuid;type:varchar(255);notNull"`
	EValueUUID string `gorm:"primaryKey;column:e_value_uuid;type:varchar(255);notNull"`
}

func (*MetaValuesRel) TableName(namer schema.Namer) string {
	return namer.JoinTableName("meta_values_rel")
}

func (s *evSqlImpl) MigrateEV(ctx context.Context) error {
	db := s.Session(ctx)
	if err := db.AutoMigrate(&EntityValues{}); err != nil {
		return err
	}

	if err := s.resourcesDAO.Migrate(ctx); err != nil {
		return err
	}
	return nil
}

// Move this to entitySqlImpl
func (s *entitySqlImpl) MigrateEntity(ctx context.Context) error {
	if err := s.Session(ctx).AutoMigrate(&Entities{}); err != nil {
		return err
	}

	if err := s.resourcesDAO.Migrate(ctx); err != nil {
		return err
	}
	return nil
}

// Add explicit Migrate for entitySqlImpl to resolve ambiguity
func (s *entitySqlImpl) Migrate(ctx context.Context) error {
	return s.MigrateEntity(ctx)
}

// Add explicit Migrate for evSqlImpl to resolve ambiguity
func (s *evSqlImpl) Migrate(ctx context.Context) error {
	return s.MigrateEV(ctx)
}

func NewEntityDAO(db *gorm.DB) meta.MetaEntityDAO {
	return &entitySqlImpl{
		Abstract:     sql.NewAbstract(db),
		resourcesDAO: resources2.NewDAO(db),
	}
}

func NewEntityValueDAO(db *gorm.DB) meta.MetaEntityValueDAO {
	return &evSqlImpl{
		Abstract:     sql.NewAbstract(db),
		resourcesDAO: resources2.NewDAO(db),
	}
}

type entitySqlImpl struct {
	*sql.Abstract
	resourcesDAO
	// entityDAO meta.MetaEntityDAO
}

type evSqlImpl struct {
	*sql.Abstract
	resources.DAO
}

func (s *evSqlImpl) Migrate(ctx context.Context) error {
	db := s.Session(ctx)
	if err := db.SetupJoinTable(&EntityValues{}, "Metas", &MetaValuesRel{}); err != nil {
		return evTagError(err)
	}
	return db.AutoMigrate(&Entities{}, &EntityValues{})
}

func (u *Entities) AsEntity(res *idm.MetaEntity) *idm.MetaEntity {
	res.Uuid = u.UUID
	res.Label = u.Label
	res.Description = u.Description

	return res
}

func (u *Entities) FromEntity(res *idm.MetaEntity) *Entities {
	if u.UUID == "" {
		u.UUID = uuid.New().String()
	}
	u.Label = res.Label
	u.Description = res.Description

	return u
}

// CreateEntity creates a new entity
func (s *entitySqlImpl) CreateEntity(ctx context.Context, entity *idm.MetaEntity) (*idm.MetaEntity, error) {
	res := (&Entities{}).FromEntity(entity)
	// //check if entity with the same label exists
	// var existing Entities
	// tx := s.Session(ctx).Where("label = ?", res.Label).First(&existing)
	// if tx.Error == nil {
	// 	// if a row exists with the same label
	// 	return nil, evTagError(errors.New("entity with the same label already exists"))
	// }

	tx := s.Session(ctx).Create(res)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return res.AsEntity(&idm.MetaEntity{}), nil
}

// SetEntities creates multiple entities
func (s *entitySqlImpl) SetEntities(ctx context.Context, entities []*idm.MetaEntity) ([]*idm.MetaEntity, error) {
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

// GetEntity retrieves an entity by its UUID
func (s *entitySqlImpl) GetEntity(ctx context.Context, entityUuid string) (*idm.MetaEntity, error) {
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
	if u.DisplayJSON != nil {
		res.DisplayJSON = string(*u.DisplayJSON)
	}

	return res
}

func (u *EntityValues) FromEntityValue(res *idm.EntityValue) *EntityValues {
	u.UUID = uuid.New().String()
	u.Label = res.Label
	u.EntityUUID = res.EntityUuid
	if res.DisplayJSON != "" {
		j := datatypes.JSON(res.DisplayJSON)
		u.DisplayJSON = &j
	}

	return u
}

// CreateEntityValue creates a new entity value and links it to its entity
func (s *evSqlImpl) CreateEntityValue(ctx context.Context, value *idm.EntityValue) (*idm.EntityValue, error) {
	// Check if already exists
	var existing EntityValues
	tx := s.Session(ctx).Where("label = ? AND entity_uuid = ?", value.Label, value.EntityUuid).First(&existing)

	if tx.Error == nil {
		// Found existing, return it
		return existing.AsEntityValue(&idm.EntityValue{}), nil
	}

	// Return error only if it's not "record not found"
	if !errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		return nil, evTagError(tx.Error)
	}

	// Not found, create new (delta)

	model := (&EntityValues{}).FromEntityValue(value)

	tx = s.Session(ctx).Create(model)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return model.AsEntityValue(&idm.EntityValue{}), nil
}

// CreateEntityValues creates multiple entity values
func (s *evSqlImpl) CreateEntityValues(ctx context.Context, values []*idm.EntityValue) ([]*idm.EntityValue, error) {
	if len(values) == 0 {
		return []*idm.EntityValue{}, nil
	}

	createdValues := make([]*idm.EntityValue, 0, len(values))

	for _, value := range values {
		created, err := s.CreateEntityValue(ctx, value)
		if err != nil {
			return nil, err
		}
		createdValues = append(createdValues, created)
	}

	return createdValues, nil
}

// GetEntityValues retrieves all entity values linked to a given entity UUID
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
		if u == "" {
			return evTagError(errors.New("uuid cannot be empty"))
		}
		if _, err := uuid.Parse(u); err != nil {
			return evTagError(errors.New("invalid uuid: " + u))
		}
	}
	return nil
}

// LinkMetaValue creates a link between a meta and an entity value
func (s *evSqlImpl) LinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error) {
	if err := s.validateUUIDs(metaUuid, valueUuid); err != nil {
		return false, err
	}

	link := MetaValuesRel{
		MetaUUID:   metaUuid,
		EValueUUID: valueUuid,
	}

	tx := s.Session(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(&link)
	if tx.Error != nil {
		return false, evTagError(tx.Error)
	}

	return tx.RowsAffected == 1, nil
}

// UnlinkMetaValue removes the link between a meta and an entity value
func (s *evSqlImpl) UnlinkMetaValue(ctx context.Context, metaUuid string, valueUuid string) (bool, error) {
	if err := s.validateUUIDs(metaUuid, valueUuid); err != nil {
		return false, err
	}

	tx := s.Session(ctx).Where(&MetaValuesRel{
		MetaUUID:   metaUuid,
		EValueUUID: valueUuid,
	}).Delete(&MetaValuesRel{})
	if tx.Error != nil {
		return false, evTagError(tx.Error)
	}

	return tx.RowsAffected == 1, nil
}

// GetMetaEntityValues retrieves the meta entity values linked to a given meta UUID
func (s *evSqlImpl) GetMetaEntityValues(ctx context.Context, metaUuid string) ([]*idm.EntityValue, error) {
	result, err := s.GetMetaEntityValuesMap(ctx, []string{metaUuid})
	if err != nil {
		return nil, err
	}

	if values, ok := result[metaUuid]; ok {
		return values, nil
	}

	return []*idm.EntityValue{}, nil
}

// DeleteEntity deletes an entity and all its values, as well as the links between those values and any meta
func (s *evSqlImpl) DeleteEntity(ctx context.Context, entityID string) (*idm.DeleteEntityValuesResponse, error) {
	if err := s.validateUUIDs(entityID); err != nil {
		return nil, err
	}

	subQuery := s.Session(ctx).Model(&EntityValues{}).Select("uuid").Where("entity_uuid = ?", entityID)

	tx := s.Session(ctx).Where("e_value_uuid IN (?)", subQuery).Delete(&MetaValuesRel{})
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	EntityValuesModel := &EntityValues{}
	tx = s.Session(ctx).Where(&EntityValues{EntityUUID: entityID}).Delete(EntityValuesModel)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	EntitiesModel := &Entities{}
	tx = s.Session(ctx).Where(&Entities{UUID: entityID}).Delete(EntitiesModel)
	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	return &idm.DeleteEntityValuesResponse{
		RowsDeleted: tx.RowsAffected,
	}, nil
}

// GetMetaEntityValuesMap retrieves a map of meta UUIDs to their linked entity values for a given list of meta UUIDs
func (s *evSqlImpl) GetMetaEntityValuesMap(ctx context.Context, metaUuids []string) (map[string][]*idm.EntityValue, error) {
	if len(metaUuids) == 0 {
		return nil, nil
	}

	var relations []struct {
		MetaUUID     string
		EVUuid       string
		EVLabel      string
		EVEntityUUID string
	}

	db := s.Session(ctx)
	relTable := sql.TableNameFromModel(db, &MetaValuesRel{})
	evTable := sql.TableNameFromModel(db, &EntityValues{})

	relTable = sql.QuoteTo(db, relTable)
	evTable = sql.QuoteTo(db, evTable)

	tx := db.Model(&EntityValues{}).
		Select(
			fmt.Sprintf("%s.meta_uuid, %s.uuid as ev_uuid, %s.label as ev_label, %s.entity_uuid as ev_entity_uuid",
				relTable, evTable, evTable, evTable)).
		Joins(fmt.Sprintf("INNER JOIN %s ON %s.uuid = %s.e_value_uuid", relTable, evTable, relTable)).
		Where(fmt.Sprintf("%s.meta_uuid IN ?", relTable), metaUuids).
		Scan(&relations)

	if tx.Error != nil {
		return nil, evTagError(tx.Error)
	}

	result := make(map[string][]*idm.EntityValue)
	for _, rel := range relations {
		ev := &idm.EntityValue{
			Uuid:       rel.EVUuid,
			Label:      rel.EVLabel,
			EntityUuid: rel.EVEntityUUID,
		}
		result[rel.MetaUUID] = append(result[rel.MetaUUID], ev)
	}

	return result, nil
}
