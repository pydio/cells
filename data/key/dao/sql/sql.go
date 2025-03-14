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

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/data/key"
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

type RangedBlockLegacy struct {
	NodeId    string `json:"NodeId,omitempty" gorm:"column:node_id;primaryKey;type:varchar(255)"`
	Nonce     []byte `json:"Nonce,omitempty" gorm:"column:nonce;"`
	BlockSize uint32 `json:"BlockSize,omitempty" gorm:"column:block_data_size;type:int"`
}

func (*RangedBlockLegacy) TableName(namer schema.Namer) string {
	return namer.TableName("legacy_nodes")
}

func NewKeyDAO(db *gorm.DB) key.DAO {
	return &sqlimpl{Abstract: sql.NewAbstract(db).WithModels(func() []any {
		return []any{
			&encryption.Node{},
			&encryption.NodeKey{},
			&encryption.RangedBlock{},
			&RangedBlockLegacy{},
		}
	})}
}

type sqlimpl struct {
	*sql.Abstract
}

func (s *sqlimpl) ListEncryptedBlockInfo(ctx context.Context, nodeUuid string) ([]*encryption.RangedBlock, error) {

	var res []*encryption.RangedBlock

	tx := s.Session(ctx).Where(&encryption.RangedBlock{NodeId: nodeUuid}).Order(clause.OrderBy{Columns: []clause.OrderByColumn{
		{Column: clause.Column{Name: "part_id"}, Desc: false},
		{Column: clause.Column{Name: "seq_start"}, Desc: false},
	}}).Find(&res)
	if err := tx.Error; err != nil {
		return nil, err
	}

	return res, nil
}

func (s *sqlimpl) SaveEncryptedBlockInfo(ctx context.Context, nodeUuid string, b *encryption.RangedBlock) error {
	b.NodeId = nodeUuid
	tx := s.Session(ctx).Create(b)

	return tx.Error
}

func (s *sqlimpl) GetEncryptedLegacyBlockInfo(ctx context.Context, nodeUuid string) (*encryption.RangedBlock, error) {
	var row *RangedBlockLegacy
	tx := s.Session(ctx).Where(&RangedBlockLegacy{NodeId: nodeUuid}).First(&row)
	if err := tx.Error; err != nil {
		return nil, err
	}
	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no info found for node %s", nodeUuid)
	}

	rb := &encryption.RangedBlock{
		BlockSize: row.BlockSize,
		Nonce:     row.Nonce,
		NodeId:    row.NodeId,
	}
	return rb, nil
}

func (s *sqlimpl) ClearNodeEncryptedBlockInfo(ctx context.Context, nodeUuid string) error {
	tx := s.Session(ctx).Where(&encryption.RangedBlock{NodeId: nodeUuid}).Delete(&encryption.RangedBlock{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) ClearNodeEncryptedPartBlockInfo(ctx context.Context, nodeUuid string, partID int) error {
	tx := s.Session(ctx).Where(&encryption.RangedBlock{NodeId: nodeUuid, PartId: uint32(partID)}).Delete(&encryption.RangedBlock{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) CopyNode(ctx context.Context, srcUuid string, targetUuid string) error {

	keys, err := s.GetAllNodeKey(ctx, srcUuid)
	if err != nil {
		log.Logger(ctx).Error("failed to list source key list", zap.Error(err))
		return err
	}

	blocks, er := s.ListEncryptedBlockInfo(ctx, srcUuid)
	if er != nil {
		log.Logger(ctx).Error("failed to list source block list", zap.Error(er))
		return er
	}

	return s.Session(ctx).Transaction(func(tx *gorm.DB) error {

		if tx1 := tx.Create(&encryption.Node{
			NodeId: targetUuid,
		}); tx1.Error != nil {
			return tx1.Error
		}

		for _, ke := range keys {
			newKey := &encryption.NodeKey{
				NodeId:  targetUuid,
				UserId:  ke.UserId,
				OwnerId: ke.OwnerId,
				KeyData: ke.KeyData,
			}
			newKey.NodeId = targetUuid
			if txk := tx.Create(newKey); txk.Error != nil {
				return txk.Error
			}
		}

		for _, block := range blocks {
			newBlock := proto.Clone(block).(*encryption.RangedBlock)
			newBlock.Id = 0 // reset id
			newBlock.NodeId = targetUuid
			if txb := tx.Create(newBlock); txb.Error != nil {
				return txb.Error
			}
		}
		return nil
	})

}

func (s *sqlimpl) SaveNode(ctx context.Context, node *encryption.Node) error {
	tx := s.Session(ctx).Create(node)
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) UpgradeNodeVersion(ctx context.Context, nodeUuid string) error {
	tx := s.Session(ctx).Updates(&encryption.Node{NodeId: nodeUuid, Legacy: false})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetNode(ctx context.Context, nodeUuid string) (*encryption.Node, error) {
	var row *encryption.Node

	tx := s.Session(ctx).Where(&encryption.Node{NodeId: nodeUuid}).First(&row)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, errors.Tag(tx.Error, errors.KeyNotFound)
		}
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no entry for %s key", nodeUuid)
	}

	return row, nil
}

func (s *sqlimpl) DeleteNode(ctx context.Context, nodeUuid string) error {
	tx := s.Session(ctx).Where(&encryption.Node{NodeId: nodeUuid}).Delete(&encryption.Node{})
	if tx.Error != nil {
		return tx.Error
	}
	// Delete corresponding NodeKeys
	tx2 := s.Session(ctx).Where(&encryption.NodeKey{NodeId: nodeUuid}).Delete(&encryption.NodeKey{})
	return tx2.Error
}

func (s *sqlimpl) SaveNodeKey(ctx context.Context, key *encryption.NodeKey) error {
	tx := s.Session(ctx).Create(key)
	if tx.Error != nil {
		return tx.Error
	}

	log.Logger(ctx).Debug("SaveNodeKey", zap.String("nodeId", key.NodeId), zap.String("user", key.UserId))
	return nil
}

func (s *sqlimpl) GetNodeKey(ctx context.Context, nodeUuid string, user string) (*encryption.NodeKey, error) {
	var row *encryption.NodeKey
	log.Logger(ctx).Debug("GetNodeKey", zap.Any("nodeId", nodeUuid), zap.Any("user", user))

	tx := s.Session(ctx).Where(&encryption.NodeKey{NodeId: nodeUuid, UserId: user}).First(&row)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, errors.Tag(tx.Error, errors.KeyNotFound)
		}
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessagef(errors.KeyNotFound, "no key found for node id %s", nodeUuid)
	}

	return row, nil
}

func (s *sqlimpl) DeleteNodeKey(ctx context.Context, key *encryption.NodeKey) error {
	tx := s.Session(ctx).Where(key).Delete(&encryption.NodeKey{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlimpl) GetAllNodeKey(ctx context.Context, nodeUuid string) ([]*encryption.NodeKey, error) {
	var res []*encryption.NodeKey

	tx := s.Session(ctx).Where(&encryption.NodeKey{NodeId: nodeUuid}).Find(&res)
	if err := tx.Error; err != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, errors.Tag(tx.Error, errors.KeyNotFound)
		}
		return nil, err
	}

	return res, nil
}
