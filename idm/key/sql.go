/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package key

import (
	"fmt"
	"sync/atomic"

	"github.com/gobuffalo/packr"
	"github.com/gogo/protobuf/proto"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/sql"
	migrate "github.com/rubenv/sql-migrate"
)

var (
	tableName = "idm_user_keys"
	queries   = map[string]string{
		"insert": `INSERT INTO idm_user_keys VALUES (?,?,?,?,?,?);`,
		"update": `UPDATE idm_user_keys SET key_data=?,key_info=? WHERE owner=? AND key_id=?;`,
		"get":    `SELECT * FROM idm_user_keys WHERE owner=? AND key_id=?;`,
		"list":   `SELECT * FROM idm_user_keys WHERE owner=?;`,
		"delete": `DELETE FROM idm_user_keys WHERE owner=? AND key_id=?;`,
	}
	mu atomic.Value
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options common.ConfigValues) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/key/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_key_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Bool("prepare", true) {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}
	return nil
}

func (dao *sqlimpl) SaveKey(key *encryption.Key) error {
	insertStmt := dao.GetStmt("insert")
	if insertStmt == nil {
		return fmt.Errorf("Unknown stmt")
	}
	defer insertStmt.Close()

	var bytes = []byte{}
	var err error

	if key.Info != nil {
		bytes, err = proto.Marshal(key.Info)
		if err != nil {
			return err
		}
	}

	_, err = insertStmt.Exec(key.Owner, key.ID, key.Label, key.Content, key.CreationDate, bytes)
	if err != nil {
		updateStmt := dao.GetStmt("update")
		if updateStmt == nil {
			return fmt.Errorf("Unknown stmt")
		}
		defer updateStmt.Close()

		_, err = updateStmt.Exec(key.Content, bytes, key.Owner, key.ID)
	}
	return err
}

func (dao *sqlimpl) GetKey(owner string, KeyID string) (*encryption.Key, error) {
	getStmt := dao.GetStmt("get")
	if getStmt == nil {
		return nil, fmt.Errorf("Unknown stmt")
	}
	defer getStmt.Close()

	rows, err := getStmt.Query(owner, KeyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		k := encryption.Key{
			Info: &encryption.KeyInfo{},
		}
		var bytes []byte
		err := rows.Scan(&(k.Owner), &(k.ID), &(k.Label), &(k.Content), &(k.CreationDate), &bytes)
		if err != nil {
			rows.Close()
			return nil, err
		}

		if bytes != nil && len(bytes) > 0 {
			proto.Unmarshal(bytes, k.Info)
		}
		return &k, rows.Err()
	} else {
		return nil, errors.NotFound("encryption.key.notfound", "cannot find key with id "+KeyID)
	}
}

func (dao *sqlimpl) ListKeys(owner string) ([]*encryption.Key, error) {
	getStmt := dao.GetStmt("list")
	if getStmt == nil {
		return nil, fmt.Errorf("Unknown stmt")
	}
	defer getStmt.Close()

	rows, err := getStmt.Query(owner)

	if err != nil {
		return nil, err
	}

	var list = []*encryption.Key{}

	for rows.Next() {
		var bytes []byte
		var k encryption.Key
		k.Info = &encryption.KeyInfo{}

		err := rows.Scan(&(k.Owner), &(k.ID), &(k.Label), &(k.Content), &(k.CreationDate), &bytes)
		if err != nil {
			rows.Close()
			return nil, err
		}

		if len(bytes) > 0 {
			err = proto.Unmarshal(bytes, k.Info)
			if err != nil {
				return nil, err
			}
		}
		list = append(list, &k)
	}
	return list, rows.Err()
}

func (dao *sqlimpl) DeleteKey(owner string, keyID string) error {
	delStmt := dao.GetStmt("delete")
	if delStmt == nil {
		return fmt.Errorf("Unknown stmt")
	}
	defer delStmt.Close()

	_, err := delStmt.Exec(owner, keyID)
	return err
}
