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
	"context"
	"fmt"
	"sync/atomic"

	"github.com/gobuffalo/packr"
	"github.com/micro/go-micro/errors"
	"github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/sql"
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
func (s *sqlimpl) Init(options common.ConfigValues) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../data/key/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, s.Prefix()+"_data-key.")
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
	stmt := h.GetStmt("enc_nodes_select")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	rows, err := stmt.Query(nodeUuid)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	defer rows.Close()

	if rows.Next() {
		stmt := h.GetStmt("enc_nodes_update")
		if stmt == nil {
			return fmt.Errorf("Unknown statement")
		}
		log.Logger(context.Background()).Debug("Updating Material for node "+nodeUuid, zap.Any("nonce", string([]byte(nonce))), zap.Any("s", blockSize))
		_, err = stmt.Exec(
			nonce,
			blockSize,
			nodeUuid,
		)
	} else {
		stmt := h.GetStmt("enc_nodes_insert")
		if stmt == nil {
			return fmt.Errorf("Unknown statement")
		}
		log.Logger(context.Background()).Debug("Inserting Material for node "+nodeUuid, zap.Any("nonce", string([]byte(nonce))), zap.Any("s", blockSize))
		_, err = stmt.Exec(
			nodeUuid,
			nonce,
			blockSize,
		)
	}
	return err
}

func (h *sqlimpl) DeleteNode(nodeUuid string) error {
	stmt := h.GetStmt("enc_nodes_delete")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		nodeUuid,
	)
	return err
}

func (h *sqlimpl) SetNodeKey(nodeUuid string, ownerId string, userId string, keyData []byte) error {

	stmt := h.GetStmt("enc_node_keys_insert")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		nodeUuid,
		ownerId,
		userId,
		keyData,
	)
	return err
}

func (h *sqlimpl) GetNodeKey(node string, user string) (*encryption.NodeKey, error) {

	stmt := h.GetStmt("selectNodeKey")
	if stmt == nil {
		return nil, fmt.Errorf("Unknown statement")
	}

	rows, err := stmt.Query(
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

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return nil, errors.NotFound("node.key.manager", "key not found for %s", node)
}

func (h *sqlimpl) DeleteNodeKey(node string, user string) error {

	stmt := h.GetStmt("enc_node_keys_delete")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		node, user,
	)
	return err
}

func (h *sqlimpl) DeleteNodeSharedKey(node string, ownerId string, userId string) error {

	stmt := h.GetStmt("enc_node_keys_deleteShared")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		node, ownerId, userId,
	)
	return err
}

func (h *sqlimpl) DeleteNodeAllSharedKey(node string, ownerId string) error {

	stmt := h.GetStmt("enc_node_keys_deleteAllShared")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		node, ownerId,
	)
	return err
}
