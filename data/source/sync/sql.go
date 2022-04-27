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
	sql2 "database/sql"
	"embed"

	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
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

// Impl of the SQL interface
type sqlImpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (h *sqlImpl) Init(ctx context.Context, options configx.Values) error {

	// super
	h.DAO.Init(ctx, options)

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         h.Driver(),
		TablePrefix: h.Prefix(),
	}

	_, err := sql.ExecMigration(h.DB(), h.Driver(), migrations, migrate.Up, h.Prefix())
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := h.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

func (h *sqlImpl) CleanResourcesOnDeletion() (string, error) {

	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         h.Driver(),
		TablePrefix: h.Prefix(),
	}

	_, err := sql.ExecMigration(h.DB(), h.Driver(), migrations, migrate.Down, h.Prefix())
	if err != nil {
		return "", err
	}

	return "Removed tables for checksums", nil

}

func (h *sqlImpl) Get(eTag string) (string, bool) {
	stmt, er := h.GetStmt("selectOne")
	if er != nil {
		h.logError(er)
		return "", false
	}
	row := stmt.QueryRow(eTag)
	var checksum string
	if er := row.Scan(&checksum); er == nil {
		return checksum, true
	} else if er == sql2.ErrNoRows {
		return "", false
	} else {
		h.logError(er)
		return "", false
	}
}

func (h *sqlImpl) Set(eTag, checksum string) {
	stmt, er := h.GetStmt("insertOne")
	if er != nil {
		h.logError(er)
		return
	}
	_, er = stmt.Exec(eTag, checksum)
	if er != nil {
		h.logError(er)
	}
}

func (h *sqlImpl) Purge(knownETags []string) int {
	stmt, er := h.GetStmt("selectAll")
	if er != nil {
		h.logError(er)
		return 0
	}
	var dbTags []string
	res, ca, e := stmt.LongQuery()
	defer ca()
	if e != nil {
		h.logError(e)
		return 0
	}
	defer res.Close()
	for res.Next() {
		var cs string
		if e := res.Scan(&cs); e == nil {
			dbTags = append(dbTags, cs)
		}
	}
	count := 0
	delStmt, e := h.GetStmt("deleteOne")
	if e != nil {
		h.logError(e)
		return 0
	}
	for _, t := range dbTags {
		var found bool
		for _, k := range knownETags {
			if k == t {
				found = true
				break
			}
		}
		if found {
			continue
		}
		if _, e := delStmt.Exec(t); e == nil {
			count++
		} else {
			h.logError(e)
		}
	}
	return count
}

func (h *sqlImpl) logError(e error) {
	log.Logger(context.Background()).Error("[SLQ Checksum Mapper]", zap.Error(e))
}
