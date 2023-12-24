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

package key

import (
	"context"
	"embed"
	"github.com/pydio/cells/v4/common/dao"
	"gorm.io/gorm"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]interface{}{
		"node_select":                   `SELECT * FROM enc_nodes WHERE node_id=?;`,
		"node_insert":                   `INSERT INTO enc_nodes VALUES (?, ?);`,
		"node_update":                   `UPDATE enc_nodes SET legacy=? WHERE node_id=?;`,
		"node_delete":                   `DELETE FROM enc_nodes WHERE node_id=?;`,
		"node_key_insert":               `INSERT INTO enc_node_keys (node_id,owner_id,user_id,key_data) VALUES (?,?,?,?)`,
		"node_key_select":               `SELECT node_id,owner_id,user_id,key_data FROM enc_node_keys WHERE node_id=? AND user_id=?;`,
		"node_key_select_all":           `SELECT node_id,owner_id,user_id,key_data FROM enc_node_keys WHERE node_id=?;`,
		"node_key_copy":                 `INSERT INTO enc_node_keys (SELECT ?, owner_id, user_id, key_data FROM enc_node_keys WHERE node_id=?);`,
		"node_key_delete":               `DELETE FROM enc_node_keys WHERE node_id=? AND user_id=?;`,
		"node_shared_key_delete":        `DELETE FROM enc_node_keys WHERE user_id<>owner_id AND node_id=? AND owner_id=? AND user_id=?`,
		"node_shared_key_delete_all":    `DELETE FROM enc_node_keys WHERE  user_id<>owner_id AND node_id=? AND owner_id=?`,
		"node_block_insert":             `INSERT INTO enc_node_blocks (node_id, part_id, seq_start, seq_end, block_data_size, block_header_size, owner) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		"node_block_select":             `SELECT node_id,part_id,seq_start,seq_end,block_data_size,block_header_size,owner FROM enc_node_blocks WHERE node_id=? order by part_id, seq_start;`,
		"node_block_copy":               `INSERT INTO enc_node_blocks (SELECT ?, part_id, seq_start, seq_end, block_data_size, block_header_size, owner FROM enc_node_blocks WHERE node_id=?);`,
		"node_block_delete":             `DELETE FROM enc_node_blocks WHERE node_id=?;`,
		"node_block_part_delete":        `DELETE FROM enc_node_blocks WHERE node_id=? and part_id=?;`,
		"node_legacy_block_select":      `SELECT * FROM enc_legacy_nodes WHERE node_id=?;`,
		"node_legacy_block_delete":      `DELETE FROM enc_legacy_nodes WHERE node_id=?;`,
		"node_legacy_part_block_delete": `DELETE FROM enc_legacy_nodes WHERE node_id=? and part_id=?;`,
	}
)

type sqlimpl struct {
	// sql.DAO

	db       *gorm.DB
	instance func() *gorm.DB
}

func (s *sqlimpl) Name() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) ID() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Metadata() map[string]string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) As(i interface{}) bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Driver() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Dsn() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) GetConn(ctx context.Context) (dao.Conn, error) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) SetConn(ctx context.Context, conn dao.Conn) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) CloseConn(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Prefix() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) LocalAccess() bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Stats() map[string]interface{} {
	//TODO implement me
	panic("implement me")
}

type Node encryption.NodeORM
type NodeKey encryption.NodeKeyORM
type RangedBlock encryption.RangedBlockORM
type RangedBlockLegacy encryption.RangedBlockORM

func (*Node) TableName() string              { return "enc_nodes" }
func (*NodeKey) TableName() string           { return "enc_node_keys" }
func (*RangedBlock) TableName() string       { return "enc_node_blocks" }
func (*RangedBlockLegacy) TableName() string { return "enc_legacy_nodes" }

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {
	db := s.db
	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}) }

	return s.instance().AutoMigrate(&Node{}, &NodeKey{}, &RangedBlock{}, &RangedBlockLegacy{})
}

func (s *sqlimpl) ListEncryptedBlockInfo(nodeUuid string) ([]*encryption.RangedBlock, error) {
	var rows []*RangedBlock
	var res []*encryption.RangedBlock

	tx := s.instance().Find(res)
	if err := tx.Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		res = append(res, (*encryption.RangedBlock)(row))
	}

	return res, nil
}

func (s *sqlimpl) SaveEncryptedBlockInfo(nodeUuid string, b *encryption.RangedBlock) error {
	tx := s.instance().Create(b)

	return tx.Error
}

func (s *sqlimpl) GetEncryptedLegacyBlockInfo(nodeUuid string) (*encryption.RangedBlock, error) {
	var row *RangedBlockLegacy
	tx := s.instance().Where(&RangedBlockLegacy{NodeId: nodeUuid}).First(&row)
	if err := tx.Error; err != nil {
		return nil, err
	}
	if tx.RowsAffected == 0 {
		return nil, errors.NotFound("node.key.dao", "no info found for node %s", nodeUuid)
	}

	return (*encryption.RangedBlock)(row), nil
}

func (s *sqlimpl) ClearNodeEncryptedBlockInfo(nodeUuid string) error {
	tx := s.instance().Delete(&RangedBlock{NodeId: nodeUuid})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) ClearNodeEncryptedPartBlockInfo(nodeUuid string, partID int) error {
	tx := s.instance().Delete(&RangedBlock{NodeId: nodeUuid, PartId: uint32(partID)})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) CopyNode(srcUuid string, targetUuid string) error {
	ctx := context.Background()
	err := s.SaveNode(&encryption.Node{
		NodeId: targetUuid,
		Legacy: false,
	})
	if err != nil {
		log.Logger(ctx).Error("failed to save new node", zap.Error(err))
		return err
	}

	keys, err := s.GetAllNodeKey(srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source key list", zap.Error(err))
		return err
	}

	for _, key := range keys {
		var newKey *encryption.NodeKey
		*newKey = *key
		newKey.NodeId = targetUuid

		err = s.SaveNodeKey(newKey)
		if err != nil {
			log.Logger(ctx).Error("failed to save key", zap.Any("key", newKey), zap.Error(err))
			return err
		}
	}

	blocks, err := s.ListEncryptedBlockInfo(srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source block list", zap.Error(err))
		return err
	}

	for _, block := range blocks {
		var newBlock *encryption.RangedBlock
		*newBlock = *block

		newBlock.NodeId = targetUuid

		s.instance().Create((*RangedBlock)(newBlock))
	}

	return nil
}

func (s *sqlimpl) SaveNode(node *encryption.Node) error {
	tx := s.instance().Create((*Node)(node))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) UpgradeNodeVersion(nodeUuid string) error {
	tx := s.instance().Updates(&Node{NodeId: nodeUuid, Legacy: false})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetNode(nodeUuid string) (*encryption.Node, error) {
	var row *Node

	tx := s.instance().Where(&Node{NodeId: nodeUuid}).First(&row)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.NotFound("node.key.dao", "no entry for %s key", nodeUuid)
	}

	return (*encryption.Node)(row), nil
}

func (s *sqlimpl) DeleteNode(nodeUuid string) error {
	tx := s.instance().Where(&Node{NodeId: nodeUuid}).Delete(&Node{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) SaveNodeKey(key *encryption.NodeKey) error {
	tx := s.instance().Create((*NodeKey)(key))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) GetNodeKey(nodeUuid string, user string) (*encryption.NodeKey, error) {
	var row *NodeKey

	tx := s.instance().Where(&NodeKey{NodeId: nodeUuid, UserId: user}).First(&row)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.NotFound("node.key.dao", "no key found for node id %s", nodeUuid)
	}

	return (*encryption.NodeKey)(row), nil
}

func (s *sqlimpl) DeleteNodeKey(key *encryption.NodeKey) error {
	tx := s.instance().Where((*NodeKey)(key)).Delete(&NodeKey{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetAllNodeKey(nodeUuid string) ([]*encryption.NodeKey, error) {
	var rows []*NodeKey
	var res []*encryption.NodeKey

	tx := s.instance().Find(res)
	if err := tx.Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		res = append(res, (*encryption.NodeKey)(row))
	}

	return res, nil
}
