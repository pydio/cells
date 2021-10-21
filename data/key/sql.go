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

	sqldb "database/sql"

	"github.com/go-sql-driver/mysql"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
)

var (
	queries = map[string]interface{}{
		"node_select":                   `SELECT * FROM enc_nodes WHERE node_id=?;`,
		"node_insert":                   `INSERT INTO enc_nodes VALUES (?, ?);`,
		"node_update":                   `UPDATE enc_nodes SET legacy=? WHERE node_id=?;`,
		"node_delete":                   `DELETE FROM enc_nodes WHERE node_id=?;`,
		"node_key_insert":               `INSERT INTO enc_node_keys (node_id,owner_id,user_id,key_data) VALUES (?,?,?,?)`,
		"node_key_select":               `SELECT * FROM enc_node_keys WHERE node_id=? AND user_id=?;`,
		"node_key_select_all":           `SELECT * FROM enc_node_keys WHERE node_id=?;`,
		"node_key_copy":                 `INSERT INTO enc_node_keys (SELECT ?, owner_id, user_id, key_data FROM enc_node_keys WHERE node_id=?);`,
		"node_key_delete":               `DELETE FROM enc_node_keys WHERE node_id=? AND user_id=?;`,
		"node_shared_key_delete":        `DELETE FROM enc_node_keys WHERE user_id<>owner_id AND node_id=? AND owner_id=? AND user_id=?`,
		"node_shared_key_delete_all":    `DELETE FROM enc_node_keys WHERE  user_id<>owner_id AND node_id=? AND owner_id=?`,
		"node_block_insert":             `INSERT INTO enc_node_blocks VALUES (?, ?, ?, ?, ?, ?, ?);`,
		"node_block_select":             `SELECT * FROM enc_node_blocks WHERE node_id=? order by part_id, seq_start;`,
		"node_block_copy":               `INSERT INTO enc_node_blocks (SELECT ?, part_id, seq_start, seq_end, block_data_size, block_header_size, owner FROM enc_node_blocks WHERE node_id=?);`,
		"node_block_delete":             `DELETE FROM enc_node_blocks WHERE node_id=?;`,
		"node_block_part_delete":        `DELETE FROM enc_node_blocks WHERE node_id=? and part_id=?;`,
		"node_legacy_block_select":      `SELECT * FROM enc_legacy_nodes WHERE node_id=?;`,
		"node_legacy_block_delete":      `DELETE FROM enc_legacy_nodes WHERE node_id=?;`,
		"node_legacy_part_block_delete": `DELETE FROM enc_legacy_nodes WHERE node_id=? and part_id=?;`,
	}
)

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (h *sqlimpl) Init(options configx.Values) error {
	// super
	if err := h.DAO.Init(options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../data/key/migrations"),
		Dir:         h.Driver(),
		TablePrefix: h.Prefix(),
	}

	_, err := sql.ExecMigration(h.DB(), h.Driver(), migrations, migrate.Up, h.Prefix()+"_data-key.")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := h.Prepare(key, query); err != nil {
				log.Logger(context.Background()).Error("failed to prepare statement", zap.String("name", key), zap.Error(err))
				return err
			}
		}
	}
	return nil
}

func (h *sqlimpl) ListEncryptedBlockInfo(nodeUuid string) (QueryResultCursor, error) {
	stmt, er := h.GetStmt("node_block_select")
	if er != nil {
		return nil, er
	}

	rows, err := stmt.Query(nodeUuid)
	if err != nil {
		log.Error("failed to list node blocks", zap.Error(err))
		return nil, err
	}
	return NewDBCursor(rows, scanBlock), nil
}

func (h *sqlimpl) SaveEncryptedBlockInfo(nodeUuid string, b *RangedBlocks) error {
	stmt, er := h.GetStmt("node_block_insert")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(nodeUuid, b.PartId, b.SeqStart, b.SeqEnd, b.BlockSize, b.HeaderSize, b.OwnerId)
	return err
}

func (h *sqlimpl) GetEncryptedLegacyBlockInfo(nodeUuid string) (*RangedBlocks, error) {
	stmt, er := h.GetStmt("node_legacy_block_select")
	if er != nil {
		return nil, er
	}

	rows, err := stmt.Query(nodeUuid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		block := new(RangedBlocks)
		var nodeId string
		err = rows.Scan(&nodeId, &block.Nonce, &block.BlockSize)
		return block, err
	}
	return nil, errors.NotFound("node.key.dao", "no info found for node %s", nodeUuid)
}

func (h *sqlimpl) ClearNodeEncryptedBlockInfo(nodeUuid string) error {
	stmt, er := h.GetStmt("node_block_delete")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(nodeUuid)
	return err
}

func (h *sqlimpl) ClearNodeEncryptedPartBlockInfo(nodeUuid string, partID int) error {
	stmt, er := h.GetStmt("node_part_block_delete")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(nodeUuid, partID)
	return err
}

func (h *sqlimpl) CopyNode(srcUuid string, targetUuid string) error {
	ctx := context.Background()
	err := h.SaveNode(&encryption.Node{
		NodeId: targetUuid,
		Legacy: false,
	})
	if err != nil {
		log.Logger(ctx).Error("failed to save new node", zap.Error(err))
		return err
	}

	keysCursor, err := h.GetAllNodeKey(srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source key list", zap.Error(err))
		return err
	}
	defer keysCursor.Close()

	for keysCursor.HasNext() {
		ki, err := keysCursor.Next()
		if err != nil {
			_ = keysCursor.Close()
			return err
		}

		nodeKey := ki.(*encryption.NodeKey)
		nodeKey.NodeId = targetUuid

		err = h.SaveNodeKey(nodeKey)
		if err != nil {
			log.Logger(ctx).Error("failed to save key", zap.Any("key", nodeKey), zap.Error(err))
			_ = keysCursor.Close()
			return err
		}
	}

	cursor, err := h.ListEncryptedBlockInfo(srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source block list", zap.Error(err))
		return err
	}
	defer cursor.Close()

	stmt, er := h.GetStmt("node_block_insert")
	if er != nil {
		return er
	}
	for cursor.HasNext() {
		bi, err := cursor.Next()
		if err != nil {
			log.Error("failed to get next block in cursor", zap.Error(err))
			_ = cursor.Close()
			return err
		}

		b := bi.(*RangedBlocks)
		_, err = stmt.Exec(targetUuid, b.PartId, b.SeqStart, b.SeqEnd, b.BlockSize, b.HeaderSize, b.HeaderSize)
		if err != nil {
			log.Logger(ctx).Error("failed to save block", zap.Any("block", b), zap.Error(err))
			_ = cursor.Close()
			return err
		}
	}

	return nil
}

func (h *sqlimpl) SaveNode(node *encryption.Node) error {
	stmt, er := h.GetStmt("node_insert")
	if er != nil {
		return er
	}
	var intLegacy int
	if node.Legacy {
		intLegacy = 1
	}
	_, err := stmt.Exec(node.NodeId, intLegacy)
	// Ignore duplicate key error
	if me, o := err.(*mysql.MySQLError); o {
		if me.Number == 1062 {
			// fmt.Println("Ignoring 1062 - duplicate error")
			return nil
		}
	}
	return err
}

func (h *sqlimpl) UpgradeNodeVersion(nodeUuid string) error {
	stmt, er := h.GetStmt("node_update")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(0, nodeUuid)
	return err
}

func (h *sqlimpl) GetNode(nodeUuid string) (*encryption.Node, error) {
	stmt, er := h.GetStmt("node_select")
	if er != nil {
		return nil, er
	}

	rows, err := stmt.Query(nodeUuid)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	if rows.Next() {
		node := new(encryption.Node)
		var intLegacy int
		err = rows.Scan(&node.NodeId, &intLegacy)
		node.Legacy = intLegacy == 1
		return node, err
	}
	return nil, errors.NotFound("node.key.dao", "no entry for %s key", nodeUuid)
}

func (h *sqlimpl) DeleteNode(nodeUuid string) error {
	stmt, er := h.GetStmt("node_delete")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(nodeUuid)
	return err
}

func (h *sqlimpl) SaveNodeKey(key *encryption.NodeKey) error {
	stmt, er := h.GetStmt("node_key_insert")
	if er != nil {
		return er
	}

	_, err := stmt.Exec(key.NodeId, key.OwnerId, key.UserId, key.KeyData)
	return err
}

func (h *sqlimpl) GetNodeKey(nodeUuid string, user string) (*encryption.NodeKey, error) {
	stmt, er := h.GetStmt("node_key_select")
	if er != nil {
		return nil, er
	}

	rows, err := stmt.Query(nodeUuid, user)
	if err != nil {
		return nil, err
	}

	c := NewDBCursor(rows, scanNodeKey)
	defer c.Close()

	if !c.HasNext() {
		return nil, errors.NotFound("node.key.dao", "no key found for node %s", nodeUuid)
	}

	k, err := c.Next()
	if err != nil {
		log.Logger(context.Background()).Error("failed to parse node key", zap.Error(err))
		return nil, err
	}

	return k.(*encryption.NodeKey), c.Close()
}

func (h *sqlimpl) DeleteNodeKey(key *encryption.NodeKey) error {
	stmt, er := h.GetStmt("node_key_delete")
	if er != nil {
		return er
	}
	_, err := stmt.Exec(key.NodeId, key.UserId)
	return err
}

func (h *sqlimpl) GetAllNodeKey(nodeUuid string) (QueryResultCursor, error) {
	stmt, er := h.GetStmt("node_key_select_all")
	if er != nil {
		return nil, er
	}

	rows, err := stmt.Query(nodeUuid)
	if err != nil {
		return nil, err
	}
	return NewDBCursor(rows, scanNodeKey), nil
}

// dbRowScanner
type dbRowScanner func(rows *sqldb.Rows) (interface{}, error)

// DBCursor wraps sql scanner
type DBCursor struct {
	scan dbRowScanner
	rows *sqldb.Rows
}

func NewDBCursor(rows *sqldb.Rows, scanner dbRowScanner) QueryResultCursor {
	return &DBCursor{
		scan: scanner,
		rows: rows,
	}
}

func (c *DBCursor) Close() error {
	return c.rows.Close()
}

func (c *DBCursor) HasNext() bool {
	return c.rows.Next()
}

func (c *DBCursor) Next() (interface{}, error) {
	return c.scan(c.rows)
}

// scanBlock
func scanBlock(rows *sqldb.Rows) (interface{}, error) {
	b := new(RangedBlocks)
	var nodeId string
	err := rows.Scan(&nodeId, &b.PartId, &b.SeqStart, &b.SeqEnd, &b.BlockSize, &b.HeaderSize, &b.OwnerId)
	if err != nil {
		log.Logger(context.Background()).Error("failed to read node block entry in sql result")
	}
	return b, err
}

// scanNodeKey
func scanNodeKey(rows *sqldb.Rows) (interface{}, error) {
	k := new(encryption.NodeKey)
	err := rows.Scan(&k.NodeId, &k.OwnerId, &k.UserId, &k.KeyData)
	if err != nil {
		log.Logger(context.Background()).Error("failed to read node key entry in sql result")
	}
	return k, err
}
