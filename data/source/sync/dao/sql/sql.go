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

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/data/source/sync"
)

var (
/*
	queries = map[string]string{
		"insertOne": `INSERT INTO %%PREFIX%%_checksums (etag,csum) VALUES (?,?)`,
		"selectAll": `SELECT etag FROM %%PREFIX%%_checksums`,
		"deleteOne": `DELETE FROM %%PREFIX%%_checksums WHERE etag=?`,
		"selectOne": `SELECT csum FROM %%PREFIX%%_checksums WHERE etag=?`,
	}
*/
)

func init() {
	sync.Drivers.Register(NewSqlDAO)
}

func NewSqlDAO(db *gorm.DB) sync.DAO {
	return &sqlImpl{db: db}
}

type Checksum struct {
	Etag     string `gorm:"primaryKey; column:etag;"`
	Checksum string `gorm:"column:csum"`
}

// Impl of the SQL interface
type sqlImpl struct {
	db       *gorm.DB
	instance func(ctx context.Context) *gorm.DB
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {
	s.instance = func(ctx context.Context) *gorm.DB { return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}) }

	s.instance(ctx).AutoMigrate(&Checksum{})

	return nil
}

func (s *sqlImpl) CleanResourcesOnDeletion(ctx context.Context) (string, error) {

	if err := s.instance(ctx).Migrator().DropTable(&Checksum{}); err != nil {
		return "", err
	}

	return "Removed tables for checksums", nil

}

func (s *sqlImpl) Get(ctx context.Context, eTag string) (string, bool) {

	var row *Checksum

	tx := s.instance(ctx).Where(&Checksum{Etag: eTag}).First(&row)
	if tx.Error != nil {
		return "", false
	}

	if tx.RowsAffected == 0 {
		return "", false
	}

	return row.Checksum, true
}

func (s *sqlImpl) Set(ctx context.Context, eTag, checksum string) {
	tx := s.instance(ctx).Create(&Checksum{Etag: eTag, Checksum: checksum})
	if tx.Error != nil {
		s.logError(ctx, tx.Error)
	}
}

func (s *sqlImpl) Purge(ctx context.Context, knownETags []string) int {
	var delete []Checksum
	for _, knownETag := range knownETags {
		delete = append(delete, Checksum{Etag: knownETag})
	}

	tx := s.instance(ctx).Not(&delete).Delete(&Checksum{})
	return int(tx.RowsAffected)
}

func (h *sqlImpl) logError(ctx context.Context, e error) {
	log.Logger(ctx).Error("[SLQ Checksum Mapper]", zap.Error(e))
}
