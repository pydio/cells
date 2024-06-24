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
	"embed"
	"sync"

	"gorm.io/gorm"
)

func NewDAO(db *gorm.DB) DAO {
	return &sqlimpl{DB: db}
}

type DAO interface {
	Migrate(ctx context.Context) error
	Get(ctx context.Context) ([]byte, error)
	Set(ctx context.Context, data []byte) error
}

var (
	//go:embed migrations/*
	migrationsFS embed.FS
	queries      = map[string]interface{}{
		"get": "select data from %%PREFIX%%_config where id = 1",
		"set": "insert into %%PREFIX%%_config(id, data) values (1, ?) on duplicate key update data = ?",
	}
)

type sqlimpl struct {
	*gorm.DB

	once *sync.Once
}

type KV struct {
	id   int    `gorm:"column:id; primaryKey"`
	data []byte `gorm:"column:data"`
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	return db
}

func (s *sqlimpl) Migrate(ctx context.Context) error {
	return s.instance(ctx).AutoMigrate(&KV{})
}

func (s *sqlimpl) Get(ctx context.Context) ([]byte, error) {
	var kv *KV

	tx := s.instance(ctx).First(&kv)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return kv.data, nil
}

func (s *sqlimpl) Set(ctx context.Context, data []byte) error {
	tx := s.instance(ctx).Create(&KV{data: data})
	if tx.Error != nil {
		return tx.Error
	}

	return nil

}
