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
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/idm/oauth"
)

func init() {
	oauth.PatDrivers.Register(NewPatDAO)
}

const (
	shaPrefix = "sha256:"
)

// NewPatDAO creates a new DAO interface implementation. Only SQL is supported.
func NewPatDAO(db *gorm.DB) oauth.PatDAO {
	return &sqlImpl{db: db}
}

// sha256Hash hashes string to string for storing acccess Token
// It prefixes with shaPrefix to ensure backward compat with v4
func sha256Hash(input string) string {
	hash := sha256.Sum256([]byte(input))
	return shaPrefix + hex.EncodeToString(hash[:])
}

type PersonalToken struct {
	UUID              string       `gorm:"column:uuid;primaryKey;type:varchar(36);not null;"`
	AccessToken       string       `gorm:"column:access_token;type:varchar(128);not null;unique;"`
	Type              auth.PatType `gorm:"column:pat_type;"`
	Label             string       `gorm:"column:label;type:varchar(255);"`
	UserUUID          string       `gorm:"column:user_uuid;type:varchar(255);not null;index;"`
	UserLogin         string       `gorm:"column:user_login;type:varchar(255);not null;index;"`
	SecretPair        string       `gorm:"column:secret_pair;type:varchar(255);"`
	RevocationKey     string       `gorm:"column:revocation_key;type:varchar(255);index;"`
	AutoRefreshWindow int32        `gorm:"column:auto_refresh;type:int;default:0;"`
	ExpiresAt         int64        `gorm:"column:expire_at;"`
	CreatedBy         string       `gorm:"column:created_by;type:varchar(128);"`
	Scopes            string       `gorm:"column:scopes;"`
	UpdatedAt         int64        `gorm:"column:updated_at;"`
	CreatedAt         int64        `gorm:"column:created_at;"`
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
	res.ExpiresAt = u.ExpiresAt
	res.CreatedAt = u.CreatedAt
	res.CreatedBy = u.CreatedBy
	res.UpdatedAt = u.UpdatedAt
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
	u.ExpiresAt = res.ExpiresAt
	u.CreatedAt = res.CreatedAt
	u.CreatedBy = res.CreatedBy
	u.UpdatedAt = res.UpdatedAt
	u.RevocationKey = res.RevocationKey
	u.SecretPair = res.SecretPair
	if len(res.Scopes) > 0 {
		ss, _ := json.Marshal(res.Scopes)
		u.Scopes = string(ss)
	}

	return u
}

type sqlImpl struct {
	db       *gorm.DB
	instance func() *gorm.DB
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options kv.Values) error {
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
		Where(clause.Gt{Column: "expire_at", Value: time.Now().Unix()}).
		First(token)

	if tx.Error != nil {
		return nil, tx.Error
	}

	return token.As(&auth.PersonalAccessToken{})
}

func (s *sqlImpl) Store(accessToken string, token *auth.PersonalAccessToken, update bool) error {
	if update {
		tx := s.instance().
			Where(&PersonalToken{UUID: token.Uuid}).
			Updates(map[string]any{
				"expire_at":  token.ExpiresAt,
				"updated_at": time.Now().Unix(),
			})
		if tx.Error != nil {
			return tx.Error
		}
		if tx.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		return nil
	} else {
		res := (&PersonalToken{}).From(token)
		if res.CreatedAt == 0 {
			res.CreatedAt = time.Now().Unix()
		}
		if res.UpdatedAt == 0 {
			res.UpdatedAt = time.Now().Unix()
		}
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
	tx := s.instance().Where(clause.Lt{Column: "expire_at", Value: time.Now().Unix()}).Delete(&PersonalToken{})
	if tx.Error != nil {
		return 0, tx.Error
	}
	return int(tx.RowsAffected), nil
}
