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
	"sync"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/data/meta"
)

func init() {
	meta.Drivers.Register(NewMetaDAO)
}

func NewMetaDAO(db *gorm.DB) meta.DAO {
	return &sqlImpl{db: db}
}

type Meta struct {
	NodeId    string `gorm:"primaryKey;column:node_id;type:varchar(255);notNull"`
	Namespace string `gorm:"primaryKey; column:namespace;type:varchar(255);notNull"`
	Author    string `gorm:"column:author;type:varchar(255);index;"`
	Timestamp int64  `gorm:"column:timestamp;"`
	Data      []byte `gorm:"column:data;"`
	Format    string `gorm:"column:format;type:varchar(255);index;"`
}

func (*Meta) TableName() string { return "data_meta" }

// Impl of the SQL interface
type sqlImpl struct {
	sql.DAO

	db   *gorm.DB
	once *sync.Once
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {

	// Trigger automigrate
	s.instance(ctx)

	return nil
}

func (s *sqlImpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		_ = db.AutoMigrate(&Meta{})
	})

	return db
}

// SetMetadata creates or updates metadata for a node
func (s *sqlImpl) SetMetadata(ctx context.Context, nodeId string, author string, metadata map[string]string) (err error) {

	if len(metadata) == 0 {
		tx := s.instance(ctx).Where(&Meta{NodeId: nodeId}).Delete(&Meta{})

		return tx.Error
	}

	for namespace, data := range metadata {
		if data == "" {
			tx := s.instance(ctx).Where(&Meta{Namespace: namespace}).Delete(&Meta{})
			if tx.Error != nil {
				return tx.Error
			}
		} else {
			// Insert or update namespace
			tx := s.instance(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(&Meta{
				NodeId:    nodeId,
				Namespace: namespace,
				Data:      []byte(data),
				Author:    author,
				Timestamp: time.Now().Unix(),
				Format:    "json",
			})

			if tx.Error != nil {
				return tx.Error
			}
		}
	}

	return nil
}

// GetMetadata loads metadata for a node
func (s *sqlImpl) GetMetadata(ctx context.Context, nodeId string) (metadata map[string]string, err error) {

	var rows []*Meta
	tx := s.instance(ctx).Where(&Meta{NodeId: nodeId}).Find(&rows)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, serviceerrors.NotFound("metadata-not-found", "Cannot find metadata for node "+nodeId)
	}

	metadata = make(map[string]string, len(rows))
	for _, row := range rows {
		metadata[row.Namespace] = string(row.Data)
	}

	return
}

/* NOT USED - TO BE REMOVED
// ListMetadata lists all metadata by query
func (s *sqlImpl) ListMetadata(ctx context.Context, query string) (metaByUuid map[string]map[string]string, err error) {

	var rows []*Meta
	tx := s.instance(ctx).Find(&rows).Limit(500)
	if tx.Error != nil {
		return nil, tx.Error
	}

	for _, row := range rows {
		metadata, ok := metaByUuid[row.NodeId]
		if !ok {
			metadata = make(map[string]string)
			metaByUuid[row.NodeId] = metadata
		}

		metadata[row.Namespace] = row.Data
	}

	return
}
*/
