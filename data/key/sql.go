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
	"sync/atomic"

	"github.com/gobuffalo/packr"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/sql"
	migrate "github.com/rubenv/sql-migrate"
)

var (
	queries = map[string]interface{}{
		"enc_nodes_select":              `SELECT * FROM enc_nodes WHERE node_id=?;`,
		"enc_nodes_insert":              `INSERT INTO enc_nodes (node_id,nonce,block_size) VALUES (?,?,?);`,
		"enc_nodes_update":              `UPDATE enc_nodes SET nonce=?,block_size=? WHERE node_id=?;`,
		"enc_nodes_delete":              `DELETE FROM enc_nodes WHERE node_id=?;`,
		"enc_node_keys_insert":          `INSERT INTO enc_node_keys (node_id,owner_id,user_id,key_data) VALUES (?,?,?,?)`,
		"enc_node_keys_delete":          `DELETE FROM enc_node_keys WHERE node_id=? AND user_id=?`,
		"enc_node_keys_deleteShared":    `DELETE FROM enc_node_keys WHERE user_id<>owner_id AND node_id=? AND owner_id=? AND user_id=?`,
		"enc_node_keys_deleteAllShared": `DELETE FROM enc_node_keys WHERE  user_id<>owner_id AND node_id=? AND owner_id=?`,
		"selectNodeKey":                 `SELECT enc_nodes.node_id, user_id, owner_id, nonce, block_size, key_data FROM enc_node_keys, enc_nodes WHERE enc_nodes.node_id=enc_node_keys.node_id AND enc_node_keys.node_id=? AND user_id=?`,
	}
	mu atomic.Value
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options config.Map) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../data/key/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := migrate.Exec(s.DB(), s.Driver(), migrations, migrate.Up)
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

func (h *sqlimpl) InsertNode(nodeUuid string, nonce []byte, blockSize int32) error {
	rows, err := h.GetStmt("enc_nodes_select").Query(nodeUuid)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if rows.Next() {
		_, err = h.GetStmt("enc_nodes_update").Exec(
			nonce,
			blockSize,
			nodeUuid,
		)
	} else {
		_, err = h.GetStmt("enc_nodes_insert").Exec(
			nodeUuid,
			nonce,
			blockSize,
		)
	}
	return err
}

func (h *sqlimpl) DeleteNode(nodeUuid string) error {
	_, err := h.GetStmt("enc_nodes_delete").Exec(
		nodeUuid,
	)
	return err
}

func (h *sqlimpl) SetNodeKey(nodeUuid string, ownerId string, userId string, keyData []byte) error {

	_, err := h.GetStmt("enc_node_keys_insert").Exec(
		nodeUuid,
		ownerId,
		userId,
		keyData,
	)
	return err
}

func (h *sqlimpl) GetNodeKey(node string, user string) (*encryption.NodeKey, error) {

	rows, err := h.GetStmt("selectNodeKey").Query(
		node,
		user,
	)
	if err != nil {
		return nil, errors.New("NodeKey", "cannot retrieve node key", 500)
	}
	defer rows.Close()

	var k encryption.NodeKey
	if rows.Next() {
		k.Nonce = []byte{}
		k.Data = []byte{}

		if err := rows.Scan(&(k.NodeId), &(k.UserId), &(k.OwnerId), &(k.Nonce), &(k.BlockSize), &(k.Data)); err != nil {
			return nil, errors.New("NodeKey", "Error while parsing node key", 500)
		}
		return &k, nil
	}
	return nil, rows.Err()
}

func (h *sqlimpl) DeleteNodeKey(node string, user string) error {

	_, err := h.GetStmt("enc_node_keys_delete").Exec(
		node, user,
	)
	return err
}

func (h *sqlimpl) DeleteNodeSharedKey(node string, ownerId string, userId string) error {

	_, err := h.GetStmt("enc_node_keys_deleteShared").Exec(
		node, ownerId, userId,
	)
	return err
}

func (h *sqlimpl) DeleteNodeAllSharedKey(node string, ownerId string) error {

	_, err := h.GetStmt("enc_node_keys_deleteAllShared").Exec(
		node, ownerId,
	)
	return err
}
