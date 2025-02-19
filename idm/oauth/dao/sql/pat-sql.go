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
	"crypto/sha256"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/idm/oauth"
)

func init() {
	oauth.PatDrivers.Register(NewPatDAO)
}

// NewPatDAO creates a new DAO interface implementation. Only SQL is supported.
func NewPatDAO(db *gorm.DB) oauth.PatDAO {
	return &sqlImpl{db: db}
}

// sha256Hash hashes string to string for storing acccess Token
func sha256Hash(input string) string {
	hash := sha256.Sum256([]byte(input))
	return hex.EncodeToString(hash[:])
}

type PersonalToken struct {
	UUID              string       `gorm:"column:uuid; primaryKey; type:varchar(36) not null;"`
	AccessToken       string       `gorm:"column:access_token;type:varchar(128) not null;unique;"`
	Type              auth.PatType `gorm:"column:pat_type;"`
	Label             string       `gorm:"column:label;type:varchar(255) null;"`
	UserUUID          string       `gorm:"column:user_uuid;type:varchar(255) not null;index;"`
	UserLogin         string       `gorm:"column:user_login;type:varchar(255) not null;index;"`
	SecretPair        string       `gorm:"column:secret_pair;type:varchar(255);"`
	RevocationKey     string       `gorm:"column:revocation_key;type:varchar(255);index;"`
	AutoRefreshWindow int32        `gorm:"column:auto_refresh;type: int default 0 null;"`
	ExpiresAt         time.Time    `gorm:"column:expire_at;"`
	CreatedBy         string       `gorm:"column:created_by;type:varchar(128) null;"`
	Scopes            string       `gorm:"column:scopes;"`
	UpdatedAt         time.Time    `gorm:"autoUpdateTime"`
	CreatedAt         time.Time    `gorm:"autoCreateTime"`
}

func (u *PersonalToken) TableName(namer schema.Namer) string {
	return namer.TableName("personal_tokens")
}

func (u *PersonalToken) As(res *auth.PersonalAccessToken) (*auth.PersonalAccessToken, error) {
	res.Uuid = u.UUID
	res.Type = u.Type
	res.Label = u.Label
	res.UserUuid = u.UserUUID
	res.UserLogin = u.UserLogin
	res.AutoRefreshWindow = u.AutoRefreshWindow
	res.ExpiresAt = u.ExpiresAt.Unix()
	res.CreatedAt = u.CreatedAt.Unix()
	res.CreatedBy = u.CreatedBy
	res.UpdatedAt = u.UpdatedAt.Unix()
	res.RevocationKey = u.RevocationKey
	res.SecretPair = u.SecretPair

	if u.Scopes != "" {
		if e := json.Unmarshal([]byte(u.Scopes), &res.Scopes); e != nil {
			return nil, e
		}
	}

	return res, nil
}

func (u *PersonalToken) From(res *auth.PersonalAccessToken) *PersonalToken {
	u.UUID = res.Uuid
	u.Type = res.Type
	u.Label = res.Label
	u.UserUUID = res.UserUuid
	u.UserLogin = res.UserLogin
	u.AutoRefreshWindow = res.AutoRefreshWindow
	u.ExpiresAt = time.Unix(res.ExpiresAt, 0)
	u.CreatedAt = time.Unix(res.CreatedAt, 0)
	u.CreatedBy = res.CreatedBy
	u.UpdatedAt = time.Unix(res.UpdatedAt, 0)
	u.RevocationKey = res.RevocationKey
	u.SecretPair = res.SecretPair

	return u
}

type sqlImpl struct {
	db       *gorm.DB
	instance func() *gorm.DB
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {
	s.instance = func() *gorm.DB {
		return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).Model(&PersonalToken{})
	}
	return nil
}

func (s *sqlImpl) Migrate(ctx context.Context) error {
	return s.instance().AutoMigrate(&PersonalToken{})
}

func (s *sqlImpl) Load(accessToken string) (*auth.PersonalAccessToken, error) {
	tx := s.instance()
	token := &PersonalToken{}
	tx = tx.
		Where(tx.Session(&gorm.Session{}).Or(&PersonalToken{AccessToken: accessToken}).Or(&PersonalToken{AccessToken: sha256Hash(accessToken)})).
		Where(clause.Gt{Column: "expire_at", Value: time.Now()}).
		First(token)

	if tx.Error != nil {
		return nil, tx.Error
	}

	return token.As(&auth.PersonalAccessToken{})
}

func (s *sqlImpl) Store(accessToken string, token *auth.PersonalAccessToken, update bool) error {
	if update {
		tx := s.instance().Model(&PersonalToken{}).Where(&PersonalToken{UUID: token.Uuid}).Update("expire_at", time.Unix(token.ExpiresAt, 0))
		if tx.Error != nil {
			return tx.Error
		}
		return nil
	} else {
		res := (&PersonalToken{}).From(token)
		// SHA256 the token for storage
		res.AccessToken = sha256Hash(accessToken)

		tx := s.instance().Create(&res)
		if tx.Error != nil {
			return tx.Error
		}
		return nil
	}
}

func (s *sqlImpl) Delete(patUuid string, isRevocationKey ...bool) error {
	where := &PersonalToken{UUID: patUuid}
	if len(isRevocationKey) > 0 && isRevocationKey[0] {
		where = &PersonalToken{RevocationKey: patUuid}
	}
	tx := s.instance().Where(where).Delete(&PersonalToken{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlImpl) List(byType auth.PatType, byUser string) ([]*auth.PersonalAccessToken, error) {
	var pts []*PersonalToken
	var res []*auth.PersonalAccessToken

	tx := s.instance()
	if byUser != "" {
		tx = tx.Where(&PersonalToken{UserLogin: byUser})
	}
	if byType != auth.PatType_ANY {
		tx = tx.Where(&PersonalToken{Type: byType})
	}
	tx = tx.Order("created_at").Find(&pts)
	if tx.Error != nil {
		return nil, tx.Error
	}
	for _, pt := range pts {
		if ptt, er := pt.As(&auth.PersonalAccessToken{}); er == nil {
			res = append(res, ptt)
		} else {
			return nil, er
		}
	}

	return res, nil
}

func (s *sqlImpl) PruneExpired() (int, error) {
	tx := s.instance().Where(clause.Lt{Column: "expire_at", Value: time.Now()}).Delete(&PersonalToken{})
	if tx.Error != nil {
		return 0, tx.Error
	}
	return int(tx.RowsAffected), nil
}
