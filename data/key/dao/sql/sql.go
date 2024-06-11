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
	"sync"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/data/key"
)

var (
/*
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
*/
)

func init() {
	key.Drivers.Register(NewKeyDAO)
}

func NewKeyDAO(db *gorm.DB) key.DAO {
	return &sqlimpl{db: db}
}

type sqlimpl struct {
	db *gorm.DB

	once *sync.Once
}

type Node encryption.NodeORM

type NodeKey encryption.NodeKeyORM

type RangedBlock encryption.RangedBlockORM

type RangedBlockLegacy encryption.RangedBlockORM

func (*Node) TableName() string { return "enc_nodes" }

func (*NodeKey) TableName() string { return "enc_node_keys" }

func (*RangedBlock) TableName() string { return "enc_node_blocks" }

func (*RangedBlockLegacy) TableName() string { return "enc_legacy_nodes" }

// Init handler for the SQL DAO
func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.AutoMigrate(&Node{}, &NodeKey{}, &RangedBlock{}, &RangedBlockLegacy{})
	})

	return db
}

// Init handler for the SQL DAO
//func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {
//	db := s.db
//	s.instance = func() *gorm.DB { return db.Session(&gorm.Session{SkipDefaultTransaction: true}) }
//
//	return s.instance().AutoMigrate(&Node{}, &NodeKey{}, &RangedBlock{}, &RangedBlockLegacy{})
//}

func (s *sqlimpl) ListEncryptedBlockInfo(ctx context.Context, nodeUuid string) ([]*encryption.RangedBlock, error) {
	var rows []*RangedBlock
	var res []*encryption.RangedBlock

	tx := s.instance(ctx).Find(res)
	if err := tx.Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		res = append(res, (*encryption.RangedBlock)(row))
	}

	return res, nil
}

func (s *sqlimpl) SaveEncryptedBlockInfo(ctx context.Context, nodeUuid string, b *encryption.RangedBlock) error {
	tx := s.instance(ctx).Create(b)

	return tx.Error
}

func (s *sqlimpl) GetEncryptedLegacyBlockInfo(ctx context.Context, nodeUuid string) (*encryption.RangedBlock, error) {
	var row *RangedBlockLegacy
	tx := s.instance(ctx).Where(&RangedBlockLegacy{NodeId: nodeUuid}).First(&row)
	if err := tx.Error; err != nil {
		return nil, err
	}
	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no info found for node %s", nodeUuid)
	}

	return (*encryption.RangedBlock)(row), nil
}

func (s *sqlimpl) ClearNodeEncryptedBlockInfo(ctx context.Context, nodeUuid string) error {
	tx := s.instance(ctx).Delete(&RangedBlock{NodeId: nodeUuid})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) ClearNodeEncryptedPartBlockInfo(ctx context.Context, nodeUuid string, partID int) error {
	tx := s.instance(ctx).Delete(&RangedBlock{NodeId: nodeUuid, PartId: uint32(partID)})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) CopyNode(ctx context.Context, srcUuid string, targetUuid string) error {
	err := s.SaveNode(ctx, &encryption.Node{
		NodeId: targetUuid,
		Legacy: false,
	})
	if err != nil {
		log.Logger(ctx).Error("failed to save new node", zap.Error(err))
		return err
	}

	keys, err := s.GetAllNodeKey(ctx, srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source key list", zap.Error(err))
		return err
	}

	for _, key := range keys {
		var newKey *encryption.NodeKey
		*newKey = *key
		newKey.NodeId = targetUuid

		err = s.SaveNodeKey(ctx, newKey)
		if err != nil {
			log.Logger(ctx).Error("failed to save key", zap.Any("key", newKey), zap.Error(err))
			return err
		}
	}

	blocks, err := s.ListEncryptedBlockInfo(ctx, srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source block list", zap.Error(err))
		return err
	}

	for _, block := range blocks {
		var newBlock *encryption.RangedBlock
		*newBlock = *block

		newBlock.NodeId = targetUuid

		s.instance(ctx).Create((*RangedBlock)(newBlock))
	}

	return nil
}

func (s *sqlimpl) SaveNode(ctx context.Context, node *encryption.Node) error {
	tx := s.instance(ctx).Create((*Node)(node))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) UpgradeNodeVersion(ctx context.Context, nodeUuid string) error {
	tx := s.instance(ctx).Updates(&Node{NodeId: nodeUuid, Legacy: false})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetNode(ctx context.Context, nodeUuid string) (*encryption.Node, error) {
	var row *Node

	tx := s.instance(ctx).Where(&Node{NodeId: nodeUuid}).First(&row)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no entry for %s key", nodeUuid)
	}

	return (*encryption.Node)(row), nil
}

func (s *sqlimpl) DeleteNode(ctx context.Context, nodeUuid string) error {
	tx := s.instance(ctx).Where(&Node{NodeId: nodeUuid}).Delete(&Node{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) SaveNodeKey(ctx context.Context, key *encryption.NodeKey) error {
	tx := s.instance(ctx).Create((*NodeKey)(key))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) GetNodeKey(ctx context.Context, nodeUuid string, user string) (*encryption.NodeKey, error) {
	var row *NodeKey

	tx := s.instance(ctx).Where(&NodeKey{NodeId: nodeUuid, UserId: user}).First(&row)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no key found for node id %s", nodeUuid)
	}

	return (*encryption.NodeKey)(row), nil
}

func (s *sqlimpl) DeleteNodeKey(ctx context.Context, key *encryption.NodeKey) error {
	tx := s.instance(ctx).Where((*NodeKey)(key)).Delete(&NodeKey{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetAllNodeKey(ctx context.Context, nodeUuid string) ([]*encryption.NodeKey, error) {
	var rows []*NodeKey
	var res []*encryption.NodeKey

	tx := s.instance(ctx).Find(res)
	if err := tx.Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		res = append(res, (*encryption.NodeKey)(row))
	}

	return res, nil
}
