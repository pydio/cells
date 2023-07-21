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
	"embed"
	"github.com/pydio/cells/v4/common/utils/std"
	migrate "github.com/rubenv/sql-migrate"
	"time"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

func NewDAO(ctx context.Context, o dao.DAO) (dao.DAO, error) {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}, nil
	}
	return nil, dao.UnsupportedDriver(o)
}

type DAO interface {
	dao.DAO

	Get() ([]byte, error)
	Set([]byte) error
}

var (
	//go:embed migrations/*
	migrationsFS embed.FS
	queries      = map[string]interface{}{
		"get": "select data from %%PREFIX%%_config where id = 1",
		"set": "insert into %%PREFIX%%_config(id, data) values (1, ?) on duplicate key update data = ?",
	}
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// super
	s.DAO.Init(ctx, options)

	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         s.DAO.Driver(),
		TablePrefix: s.DAO.Prefix(),
	}

	err := std.Retry(ctx, func() error {
		_, err := sql.ExecMigration(s.DAO.DB(), s.DAO.Driver(), migrations, migrate.Up, s.DAO.Prefix())
		if err != nil {
			return err
		}

		return nil
	}, 1*time.Second, 30*time.Second)
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *sqlimpl) Get() ([]byte, error) {
	stmt, err := s.DAO.GetStmt("get")
	if err != nil {
		return nil, err
	}

	var b []byte

	row := stmt.QueryRow()
	row.Scan(&b)

	return b, nil
}

func (s *sqlimpl) Set(data []byte) error {
	stmt, err := s.DAO.GetStmt("set")
	if err != nil {
		return err
	}

	if _, err := stmt.Exec(data, data); err != nil {
		return err
	}

	return nil

}
