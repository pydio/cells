/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"reflect"

	jose "github.com/go-jose/go-jose/v3"
	"github.com/ory/hydra/v2/jwk"
	"github.com/ory/hydra/v2/x"
	"github.com/ory/x/errorsx"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/storage/sql"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

var _ jwk.Manager = new(jwkDriver)

type jwkDriver struct {
	*sql.Abstract

	r jwk.Registry
}

type SqlJWK jwk.SQLData

func (SqlJWK) TableName(n schema.Namer) string {
	return n.TableName("jwk")
}

func (j *jwkDriver) AutoMigrate() error {
	return j.DB.AutoMigrate(&SqlJWK{})
}

func (j *jwkDriver) GenerateAndPersistKeySet(ctx context.Context, set, kid, alg, use string) (*jose.JSONWebKeySet, error) {
	keys, err := jwk.GenerateJWK(ctx, jose.SignatureAlgorithm(alg), kid, use)
	if err != nil {
		return nil, errors.Wrapf(jwk.ErrUnsupportedKeyAlgorithm, "%s", err)
	}

	err = j.AddKeySet(ctx, set, keys)
	if err != nil {
		return nil, err
	}

	return keys, nil
}

func (j *jwkDriver) addKey(db *gorm.DB, ctx context.Context, set string, key *jose.JSONWebKey) error {
	out, err := json.Marshal(key)
	if err != nil {
		return err
	}

	encrypted, err := j.r.KeyCipher().Encrypt(ctx, out, nil)
	if err != nil {
		return err
	}

	data := &jwk.SQLData{
		Set:     set,
		KID:     key.KeyID,
		Version: 0,
		Key:     encrypted,
	}

	tx := db.Model(SqlJWK{}).Create(data)
	if err := tx.Error; err != nil {
		return err
	}

	return nil
}

func (j *jwkDriver) AddKey(ctx context.Context, set string, key *jose.JSONWebKey) error {
	return j.addKey(j.Session(ctx), ctx, set, key)
}

func (j *jwkDriver) AddKeySet(ctx context.Context, set string, keys *jose.JSONWebKeySet) error {
	return j.Session(ctx).Model(SqlJWK{}).Transaction(func(tx *gorm.DB) error {
		for _, key := range keys.Keys {
			if err := j.addKey(tx, ctx, set, &key); err != nil {
				return err
			}
		}
		return nil
	})
}

func (j *jwkDriver) UpdateKey(ctx context.Context, set string, key *jose.JSONWebKey) error {
	return j.Session(ctx).Model(SqlJWK{}).Transaction(func(tx *gorm.DB) error {
		if err := j.DeleteKey(ctx, set, key.KeyID); err != nil {
			return err
		}

		if err := j.AddKey(ctx, set, key); err != nil {
			return err
		}
		return nil
	})
}

func (j *jwkDriver) UpdateKeySet(ctx context.Context, set string, keys *jose.JSONWebKeySet) error {
	return j.Session(ctx).Model(SqlJWK{}).Transaction(func(tx *gorm.DB) error {
		if err := j.DeleteKeySet(ctx, set); err != nil {
			return err
		}

		if err := j.AddKeySet(ctx, set, keys); err != nil {
			return err
		}
		return nil
	})
}

func (j *jwkDriver) GetKey(ctx context.Context, set, kid string) (*jose.JSONWebKeySet, error) {
	var data *jwk.SQLData
	if tx := j.Session(ctx).Model(SqlJWK{}).Where(jwk.SQLData{Set: set, KID: kid}).Order("created_at DESC").First(&data); tx != nil && tx.Error != nil {
		return nil, tx.Error
	}

	key, err := j.r.KeyCipher().Decrypt(ctx, data.Key, nil)
	if err != nil {
		return nil, errorsx.WithStack(err)
	}

	var c jose.JSONWebKey
	if err := json.Unmarshal(key, &c); err != nil {
		return nil, errorsx.WithStack(err)
	}

	return &jose.JSONWebKeySet{
		Keys: []jose.JSONWebKey{c},
	}, nil
}

func (j *jwkDriver) GetKeySet(ctx context.Context, set string) (*jose.JSONWebKeySet, error) {
	var data []*jwk.SQLData
	if tx := j.Session(ctx).Model(SqlJWK{}).Where(jwk.SQLData{Set: set}).Order("created_at DESC").Find(&data); tx != nil && tx.Error != nil {
		return nil, tx.Error
	}

	if len(data) == 0 {
		return nil, x.ErrNotFound
	}

	keys := &jose.JSONWebKeySet{Keys: []jose.JSONWebKey{}}
	for _, d := range data {
		key, err := j.r.KeyCipher().Decrypt(ctx, d.Key, nil)
		if err != nil {
			return nil, errorsx.WithStack(err)
		}

		var c jose.JSONWebKey
		if err := json.Unmarshal(key, &c); err != nil {
			return nil, errorsx.WithStack(err)
		}
		keys.Keys = append(keys.Keys, c)
	}

	if len(keys.Keys) == 0 {
		return nil, x.ErrNotFound
	}

	return keys, nil
}

func (j *jwkDriver) DeleteKey(ctx context.Context, set, kid string) error {
	var data *jwk.SQLData
	if tx := j.Session(ctx).Model(SqlJWK{}).Where(jwk.SQLData{Set: set, KID: kid}).Delete(&data); tx != nil && tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (j *jwkDriver) DeleteKeySet(ctx context.Context, set string) error {
	var data *jwk.SQLData
	if tx := j.Session(ctx).Model(SqlJWK{}).Where(jwk.SQLData{Set: set}).Delete(&data); tx != nil && tx.Error != nil {
		return tx.Error
	}

	return nil
}

type namer struct {
	schema.Namer

	model interface{}
}

func (n *namer) ColumnName(_, column string) string {
	field, ok := reflect.TypeOf(n.model).Elem().FieldByName(column)
	if !ok {
		return column
	}

	tag := field.Tag.Get("db")
	if tag == "" {
		return column
	}

	return tag
}
