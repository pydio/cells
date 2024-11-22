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

package sql

import (
	"context"

	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/idm/key"
)

func init() {
	key.Drivers.Register(NewDAO)
}

type UserKey struct {
	Owner        string `gorm:"primaryKey; column:owner; type:varchar(255) not null;index:,composite:ow;"`
	ID           string `gorm:"primaryKey; column:key_id;type:varchar(255) not null;"`
	Label        string `gorm:"column:key_label;type:varchar(255);"`
	Content      string `gorm:"column:key_data;type:varchar(255)"`
	Info         []byte `gorm:"column:key_info"`
	Version      int    `gorm:"column:version"`
	CreationDate int32  `gorm:"column:creation_date"`
}

func (u *UserKey) As(res *encryption.Key) *encryption.Key {
	res.Owner = u.Owner
	res.ID = u.ID
	res.Label = u.Label
	res.Content = u.Content
	res.CreationDate = u.CreationDate
	res.Info = &encryption.KeyInfo{}

	if len(u.Info) > 0 {
		_ = proto.Unmarshal(u.Info, res.Info)
	}

	return res
}

func (u *UserKey) From(res *encryption.Key) *UserKey {
	u.Owner = res.Owner
	u.ID = res.ID
	u.Label = res.Label
	u.Content = res.Content
	u.CreationDate = res.CreationDate
	u.Info, _ = proto.Marshal(res.Info)

	return u
}

func NewDAO(db *gorm.DB) key.DAO {
	return &sqlimpl{Abstract: sql.NewAbstract(db).WithModels(func() []any {
		return []any{&UserKey{}}
	})}
}

type sqlimpl struct {
	*sql.Abstract
}

// SaveKey saves the key to persistence layer
func (s *sqlimpl) SaveKey(ctx context.Context, key *encryption.Key, version ...int) error {
	ver := 4
	if len(version) > 0 {
		ver = version[0]
	}

	res := (&UserKey{}).From(key)
	res.Version = ver

	tx := s.Session(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(res)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// GetKey loads key from persistence layer
func (s *sqlimpl) GetKey(ctx context.Context, owner string, keyID string) (res *encryption.Key, version int, err error) {
	var k *UserKey

	tx := s.Session(ctx).Where(&UserKey{Owner: owner, ID: keyID}).First(&k)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, 0, errors.WithMessage(errors.KeyNotFound, "cannot find key with id "+keyID)
		}
		return nil, 0, tx.Error
	}

	return k.As(&encryption.Key{}), k.Version, nil
}

// ListKeys list all keys by owner
func (s *sqlimpl) ListKeys(ctx context.Context, owner string) (res []*encryption.Key, err error) {
	var keys []*UserKey

	tx := s.Session(ctx).Where(&UserKey{Owner: owner}).Find(&keys)
	if tx.Error != nil {
		return nil, tx.Error
	}

	for _, key := range keys {
		res = append(res, key.As(&encryption.Key{}))
	}

	return
}

// DeleteKey removes a key from the persistence layer
func (s *sqlimpl) DeleteKey(ctx context.Context, owner string, keyID string) error {
	tx := s.Session(ctx).Where(&UserKey{Owner: owner, ID: keyID}).Delete(&UserKey{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
