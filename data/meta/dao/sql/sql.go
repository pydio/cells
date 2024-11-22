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
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/data/meta"
)

func init() {
	meta.Drivers.Register(NewMetaDAO)
}

type Meta struct {
	NodeId    string `gorm:"primaryKey;column:node_id;type:varchar(255);notNull;index;"`
	Namespace string `gorm:"primaryKey;column:namespace;type:varchar(255);notNull"`
	Author    string `gorm:"column:author;type:varchar(255);index:,composite:auth;"`
	Timestamp int64  `gorm:"column:timestamp;index:,composite:ts;"`
	Data      []byte `gorm:"column:data;"`
	Format    string `gorm:"column:format;type:varchar(255);index:,composite:fmt;"`
}

func (*Meta) TableName(namer schema.Namer) string {
	return namer.TableName("meta")
}

func NewMetaDAO(db *gorm.DB) meta.DAO {
	return &sqlImpl{Abstract: sql.NewAbstract(db).WithModels(func() []any {
		return []any{&Meta{}}
	})}
}

// Impl of the SQL interface
type sqlImpl struct {
	*sql.Abstract
}

// SetMetadata creates or updates metadata for a node
func (s *sqlImpl) SetMetadata(ctx context.Context, nodeId string, author string, metadata map[string]string) (err error) {

	if len(metadata) == 0 {
		tx := s.Session(ctx).Where(&Meta{NodeId: nodeId}).Delete(&Meta{})

		return tx.Error
	}

	for namespace, data := range metadata {
		if data == "" {
			tx := s.Session(ctx).Where(&Meta{Namespace: namespace}).Delete(&Meta{})
			if tx.Error != nil {
				return tx.Error
			}
		} else {
			// Insert or update namespace
			tx := s.Session(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(&Meta{
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
	tx := s.Session(ctx).Where(&Meta{NodeId: nodeId}).Find(&rows)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.NodeNotFound, "Cannot find metadata for node %s", nodeId)
	}

	metadata = make(map[string]string, len(rows))
	for _, row := range rows {
		metadata[row.Namespace] = string(row.Data)
	}

	return
}
