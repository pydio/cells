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
	"sync"

	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/idm/key"
)

func init() {
	key.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) key.DAO {
	return &sqlimpl{db: db}
}

type UserKey struct {
	Owner        string `gorm:"primaryKey; column:owner"`
	ID           string `gorm:"primaryKey; column:key_id"`
	Label        string `gorm:"column:key_label"`
	Content      string `gorm:"column:key_data"`
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
		proto.Unmarshal(u.Info, res.Info)
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

type sqlimpl struct {
	db *gorm.DB

	once *sync.Once
}

// Init handler for the SQL DAO
func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.AutoMigrate(&UserKey{})
	})

	return db
}

// SaveKey saves the key to persistence layer
func (s *sqlimpl) SaveKey(ctx context.Context, key *encryption.Key, version ...int) error {
	ver := 4
	if len(version) > 0 {
		ver = version[0]
	}

	res := (&UserKey{}).From(key)
	res.Version = ver

	tx := s.instance(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(res)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// GetKey loads key from persistence layer
func (s *sqlimpl) GetKey(ctx context.Context, owner string, keyID string) (res *encryption.Key, version int, err error) {
	var key *UserKey

	tx := s.instance(ctx).Where(&UserKey{Owner: owner, ID: keyID}).First(&key)
	if tx.Error != nil {
		return nil, 0, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, 0, errors.WithMessage(errors.KeyNotFound, "cannot find key with id "+keyID)
	}

	return key.As(&encryption.Key{}), key.Version, nil
}

// ListKeys list all keys by owner
func (s *sqlimpl) ListKeys(ctx context.Context, owner string) (res []*encryption.Key, err error) {
	var keys []*UserKey

	tx := s.instance(ctx).Where(&UserKey{Owner: owner}).Find(&keys)
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
	tx := s.instance(ctx).Where(&UserKey{Owner: owner, ID: keyID}).Delete(&UserKey{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
