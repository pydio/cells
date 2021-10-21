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
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"
)

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}

type DAO interface {
	dao.DAO

	Get() ([]byte, error)
	Set([]byte) error
}

var queries = map[string]interface{}{
	"get": "select data from %%PREFIX%%_config where id = 1",
	"set": "insert into %%PREFIX%%_config(id, data) values (1, ?) on duplicate key update data = ?",
}

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options configx.Values) error {

	// super
	s.DAO.Init(options)

	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../../common/config/sql/migrations"),
		Dir:         "./" + s.DAO.Driver(),
		TablePrefix: s.DAO.Prefix(),
	}

	_, err := sql.ExecMigration(s.DAO.DB(), s.DAO.Driver(), migrations, migrate.Up, s.DAO.Prefix())
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
