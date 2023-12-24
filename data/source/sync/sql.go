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

package sync

import (
	"context"
	"embed"
	"gorm.io/gorm"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"insertOne": `INSERT INTO %%PREFIX%%_checksums (etag,csum) VALUES (?,?)`,
		"selectAll": `SELECT etag FROM %%PREFIX%%_checksums`,
		"deleteOne": `DELETE FROM %%PREFIX%%_checksums WHERE etag=?`,
		"selectOne": `SELECT csum FROM %%PREFIX%%_checksums WHERE etag=?`,
	}
)

type Checksum struct {
	Etag     string `gorm:"primaryKey; column:etag;"`
	Checksum string `gorm:"column:csum"`
}

// Impl of the SQL interface
type sqlImpl struct {
	sql.DAO

	db       *gorm.DB
	instance func(ctx context.Context) *gorm.DB
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {
	s.instance = func(ctx context.Context) *gorm.DB { return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}) }

	s.instance(ctx).AutoMigrate(&Checksum{})

	return nil
}

func (s *sqlImpl) CleanResourcesOnDeletion() (string, error) {

	if err := s.instance(context.TODO()).Migrator().DropTable(&Checksum{}); err != nil {
		return "", err
	}

	return "Removed tables for checksums", nil

}

func (s *sqlImpl) Get(eTag string) (string, bool) {

	var row *Checksum

	tx := s.instance(context.TODO()).Where(&Checksum{Etag: eTag}).First(&row)
	if tx.Error != nil {
		return "", false
	}

	if tx.RowsAffected == 0 {
		return "", false
	}

	return row.Checksum, true
}

func (s *sqlImpl) Set(eTag, checksum string) {
	tx := s.instance(context.TODO()).Create(&Checksum{Etag: eTag, Checksum: checksum})
	if tx.Error != nil {
		s.logError(tx.Error)
	}
}

func (s *sqlImpl) Purge(knownETags []string) int {
	var delete []Checksum
	for _, knownETag := range knownETags {
		delete = append(delete, Checksum{Etag: knownETag})
	}

	tx := s.instance(context.TODO()).Not(&delete).Delete(&Checksum{})
	return int(tx.RowsAffected)
}

func (h *sqlImpl) logError(e error) {
	log.Logger(context.Background()).Error("[SLQ Checksum Mapper]", zap.Error(e))
}
