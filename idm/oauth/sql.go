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

package oauth

import (
	"context"
	"embed"
	"fmt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"time"

	"github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"insert":       `INSERT INTO idm_personal_tokens VALUES (?,CONCAT('sha256:', SHA2(?, 256)),?,?,?,?,?,?,?,?,?,?)`,
		"updateExpire": `UPDATE idm_personal_tokens SET expire_at=? WHERE uuid=?`,
		"validToken":   `SELECT * FROM idm_personal_tokens WHERE access_token=CONCAT('sha256:', SHA2(?, 256)) AND expire_at > ? LIMIT 0,1`,
		"listAll":      `SELECT * FROM idm_personal_tokens ORDER BY created_by DESC`,
		"listByUser":   `SELECT * FROM idm_personal_tokens WHERE user_login LIKE ? ORDER BY created_by DESC`,
		"listByType":   `SELECT * FROM idm_personal_tokens WHERE pat_type=? ORDER BY created_by DESC`,
		"listByBoth":   `SELECT * FROM idm_personal_tokens WHERE pat_type=? AND user_login LIKE ? ORDER BY created_by DESC`,
		"delete":       `DELETE FROM idm_personal_tokens WHERE uuid=?`,
		"pruneExpired": `DELETE FROM idm_personal_tokens WHERE expire_at < ?`,
		// Sqlite does not support CONCAT and SHA2 functions
		"insert-sqlite":     `INSERT INTO idm_personal_tokens VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		"validToken-sqlite": `SELECT * FROM idm_personal_tokens WHERE access_token=? AND expire_at > ? LIMIT 0,1`,
	}
)

type PersonalToken struct {
	UUID              string       `gorm:"column:uuid; primaryKey;"`
	AccessToken       string       `gorm:"column:access_token;"`
	Type              auth.PatType `gorm:"column:pat_type;"`
	Label             string       `gorm:"column:label;"`
	UserUUID          string       `gorm:"column:user_uuid;"`
	UserLogin         string       `gorm:"column:user_login;"`
	AutoRefreshWindow int32        `gorm:"column:auto_refresh;"`
	ExpiresAt         time.Time    `gorm:"column:expire_at;"`
	CreatedAt         time.Time    `gorm:"column:created_at;"`
	CreatedBy         string       `gorm:"column:created_by;"`
	UpdatedAt         time.Time    `gorm:"column:updated_at;"`
	Scopes            string       `gorm:"column:scopes;"`
}

func (u *PersonalToken) As(res *auth.PersonalAccessToken) *auth.PersonalAccessToken {
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

	if e := json.Unmarshal([]byte(u.Scopes), &res.Scopes); e != nil {
		return nil
	}

	return res
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

	return u
}

type sqlImpl struct {
	db *gorm.DB

	instance func() *gorm.DB

	*sql.Handler
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(ctx context.Context, options configx.Values) error {
	s.instance = func() *gorm.DB {
		return s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_personal_tokens")
	}

	s.instance().AutoMigrate(&PersonalToken{})

	return nil
}

func (s *sqlImpl) Load(accessToken string) (*auth.PersonalAccessToken, error) {
	s.Lock()
	defer s.Unlock()

	token := &PersonalToken{}
	tx := s.instance().
		Where(&PersonalToken{AccessToken: accessToken}).
		Where(clause.Gt{Column: "expire_at", Value: time.Now()}).
		First(token)

	if tx.Error != nil {
		return nil, tx.Error
	}
	if tx.RowsAffected == 0 {
		return nil, fmt.Errorf("not.found")
	}

	return token.As(&auth.PersonalAccessToken{}), nil
}

func (s *sqlImpl) Store(accessToken string, token *auth.PersonalAccessToken, update bool) error {
	s.Lock()
	defer s.Unlock()

	if update {
		tx := s.instance().Where(&PersonalToken{UUID: token.Uuid}).Update("expire_at", token.ExpiresAt)
		if tx.Error != nil {
			return tx.Error
		}
		return nil
	} else {
		res := (&PersonalToken{}).From(token)
		res.AccessToken = accessToken

		tx := s.instance().Create(&res)
		if tx.Error != nil {
			return tx.Error
		}
		return nil
	}
}

func (s *sqlImpl) Delete(patUuid string) error {
	s.Lock()
	defer s.Unlock()

	tx := s.instance().Where(&PersonalToken{UUID: patUuid}).Delete(&PersonalToken{})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (s *sqlImpl) List(byType auth.PatType, byUser string) ([]*auth.PersonalAccessToken, error) {
	s.Lock()
	defer s.Unlock()

	var pts []*PersonalToken
	var res []*auth.PersonalAccessToken

	tx := s.instance()
	if byUser != "" {
		tx = tx.Where(&PersonalToken{UserLogin: byUser})
	}
	if byType != auth.PatType_ANY {
		tx = tx.Where(&PersonalToken{Type: byType})
	}
	tx = tx.Order("created_at").Find(&res)
	if tx.Error != nil {
		return nil, tx.Error
	}
	for _, pt := range pts {
		res = append(res, pt.As(&auth.PersonalAccessToken{}))
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
