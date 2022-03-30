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
	"embed"

	migrate "github.com/rubenv/sql-migrate"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"insert": `INSERT INTO idm_user_keys VALUES (?,?,?,?,?,?,?);`,
		"update": `UPDATE idm_user_keys SET key_data=?,key_info=?,version=? WHERE owner=? AND key_id=?;`,
		"get":    `SELECT * FROM idm_user_keys WHERE owner=? AND key_id=?;`,
		"list":   `SELECT * FROM idm_user_keys WHERE owner=?;`,
		"delete": `DELETE FROM idm_user_keys WHERE owner=? AND key_id=?;`,
	}
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (dao *sqlimpl) Init(options configx.Values) error {

	// super
	dao.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         dao.Driver(),
		TablePrefix: dao.Prefix(),
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Up, "idm_key_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := dao.Prepare(key, query); err != nil {
				return err
			}
		}
	}
	return nil
}

// SaveKey saves the key to persistence layer
func (dao *sqlimpl) SaveKey(key *encryption.Key, version ...int) error {
	ver := 4
	if len(version) > 0 {
		ver = version[0]
	}

	insertStmt, er := dao.GetStmt("insert")
	if er != nil {
		return er
	}

	var bytes = []byte{}
	var err error

	if key.Info != nil {
		bytes, err = proto.Marshal(key.Info)
		if err != nil {
			return err
		}
	}

	_, err = insertStmt.Exec(key.Owner, key.ID, key.Label, key.Content, key.CreationDate, bytes, ver)
	if err != nil {
		updateStmt, er := dao.GetStmt("update")
		if er != nil {
			return er
		}

		_, err = updateStmt.Exec(key.Content, bytes, ver, key.Owner, key.ID)
	}
	return err
}

// GetKey loads key from persistence layer
func (dao *sqlimpl) GetKey(owner string, KeyID string) (*encryption.Key, int, error) {
	getStmt, er := dao.GetStmt("get")
	if er != nil {
		return nil, 0, er
	}

	rows, err := getStmt.Query(owner, KeyID)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	if rows.Next() {
		k := encryption.Key{
			Info: &encryption.KeyInfo{},
		}
		var version int
		var bytes []byte
		err := rows.Scan(&(k.Owner), &(k.ID), &(k.Label), &(k.Content), &(k.CreationDate), &bytes, &version)
		if err != nil {
			return nil, 0, err
		}

		if len(bytes) > 0 {
			proto.Unmarshal(bytes, k.Info)
		}
		return &k, version, rows.Err()
	} else {
		return nil, 0, errors.NotFound("encryption.key.notfound", "cannot find key with id "+KeyID)
	}
}

// ListKeys list all keys by owner
func (dao *sqlimpl) ListKeys(owner string) ([]*encryption.Key, error) {
	getStmt, er := dao.GetStmt("list")
	if er != nil {
		return nil, er
	}

	rows, err := getStmt.Query(owner)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*encryption.Key

	for rows.Next() {
		var bytes []byte
		var version int
		var k encryption.Key
		k.Info = &encryption.KeyInfo{}

		err := rows.Scan(&(k.Owner), &(k.ID), &(k.Label), &(k.Content), &(k.CreationDate), &bytes, &version)
		if err != nil {
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

// DeleteKey removes a key from the persistence layer
func (dao *sqlimpl) DeleteKey(owner string, keyID string) error {
	delStmt, er := dao.GetStmt("delete")
	if er != nil {
		return er
	}

	_, err := delStmt.Exec(owner, keyID)
	return err
}
