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

package meta

import (
	"context"
	"embed"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"time"

	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"upsert":        `INSERT INTO data_meta (node_id,namespace,data,author,timestamp,format) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE data=?,author=?,timestamp=?,format=?`,
		"upsert-sqlite": `INSERT INTO data_meta (node_id,namespace,data,author,timestamp,format) VALUES (?,?,?,?,?,?) ON CONFLICT(node_id,namespace) DO UPDATE SET data=?,author=?,timestamp=?,format=?`,
		"deleteNS":      `DELETE FROM data_meta WHERE namespace=?`,
		"deleteUuid":    `DELETE FROM data_meta WHERE node_id=?`,
		"select":        `SELECT * FROM data_meta WHERE node_id=?`,
		"selectAll":     `SELECT * FROM data_meta LIMIT 0, 500`,
	}
)

type Meta struct {
	NodeId    string `gorm:"primaryKey; column:node_id"`
	Namespace string `gorm:"primaryKey; column:namespace"`
	Data      string `gorm:"primaryKey; column:data"`
	Author    string `gorm:"primaryKey; column:author"`
	Timestamp int64  `gorm:"primaryKey; column:timestamp"`
	Format    string `gorm:"primaryKey; column:format"`
}

func (*Meta) TableName() string { return "data_meta" }

// Impl of the SQL interface
type sqlImpl struct {
	sql.DAO

	db       *gorm.DB
	instance func() *gorm.DB
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {

	s.instance = func() *gorm.DB { return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}) }

	return nil
}

// SetMetadata creates or updates metadata for a node
func (s *sqlImpl) SetMetadata(nodeId string, author string, metadata map[string]string) (err error) {

	if len(metadata) == 0 {
		tx := s.instance().Where(&Meta{NodeId: nodeId}).Delete(&Meta{})

		return tx.Error
	}

	for namespace, data := range metadata {
		if data == "" {
			tx := s.instance().Where(&Meta{Namespace: namespace}).Delete(&Meta{})
			if tx.Error != nil {
				return tx.Error
			}
		} else {
			// Insert or update namespace
			tx := s.instance().Clauses(clause.OnConflict{UpdateAll: true}).Create(&Meta{
				NodeId:    nodeId,
				Namespace: namespace,
				Data:      data,
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
func (s *sqlImpl) GetMetadata(nodeId string) (metadata map[string]string, err error) {
	var rows []*Meta
	tx := s.instance().Where(&Meta{NodeId: nodeId}).Find(&rows)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.NotFound("metadata-not-found", "Cannot find metadata for node "+nodeId)
	}

	for _, row := range rows {
		metadata[row.Namespace] = row.Data
	}

	return
}

// ListMetadata lists all metadata by query
func (s *sqlImpl) ListMetadata(query string) (metaByUuid map[string]map[string]string, err error) {

	var rows []*Meta
	tx := s.instance().Find(&rows).Limit(500)
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
