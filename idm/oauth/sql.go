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
	sql2 "database/sql"
	"fmt"
	"time"

	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
	json "github.com/pydio/cells/x/jsonx"
)

var (
	queries = map[string]string{
		"insert":       `INSERT INTO idm_personal_tokens VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		"updateExpire": `UPDATE idm_personal_tokens SET expire_at=? WHERE uuid=?`,
		"validToken":   `SELECT * FROM idm_personal_tokens WHERE access_token=? AND expire_at > ? LIMIT 0,1`,
		"listAll":      `SELECT * FROM idm_personal_tokens ORDER BY created_by DESC`,
		"listByUser":   `SELECT * FROM idm_personal_tokens WHERE user_login LIKE ? ORDER BY created_by DESC`,
		"listByType":   `SELECT * FROM idm_personal_tokens WHERE pat_type=? ORDER BY created_by DESC`,
		"listByBoth":   `SELECT * FROM idm_personal_tokens WHERE pat_type=? AND user_login LIKE ? ORDER BY created_by DESC`,
		"delete":       `DELETE FROM idm_personal_tokens WHERE uuid=?`,
		"pruneExpired": `DELETE FROM idm_personal_tokens WHERE expire_at < ?`,
	}
)

type sqlImpl struct {
	*sql.Handler
}

// Init handler for the SQL DAO
func (s *sqlImpl) Init(options configx.Values) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/oauth/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	var isRetry bool
	err := service.Retry(context.Background(), func() error {
		_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_oauth_")
		if err != nil {
			log.Logger(context.Background()).Warn("Could not apply idm_oauth_ migration, maybe because of concurrent access, retrying...")
			isRetry = true
		} else if isRetry {
			log.Logger(context.Background()).Warn("Migration now applied successfully")
		}
		return err
	}, 100*time.Millisecond, 250*time.Millisecond)
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return fmt.Errorf("unable to prepare query[%s]: %s - error: %v", key, query, err)
			}
		}
	}

	return nil
}

func (s *sqlImpl) Load(accessToken string) (*auth.PersonalAccessToken, error) {
	s.Lock()
	defer s.Unlock()

	stmt, er := s.GetStmt("validToken")
	if er != nil {
		return nil, er
	}
	rows, er := stmt.Query(accessToken, int32(time.Now().Unix()))
	if er != nil {
		return nil, er
	}
	defer rows.Close()
	if rows.Next() {
		return s.scan(rows)
	}
	return nil, fmt.Errorf("not.found")
}

func (s *sqlImpl) Store(accessToken string, token *auth.PersonalAccessToken, update bool) error {
	s.Lock()
	defer s.Unlock()

	if update {
		updateStmt, er := s.GetStmt("updateExpire")
		if er != nil {
			return er
		}
		_, e := updateStmt.Exec(int32(token.ExpiresAt), token.Uuid)
		return e
	} else {
		insertStmt, er := s.GetStmt("insert")
		if er != nil {
			return er
		}
		scopes, _ := json.Marshal(token.Scopes)
		_, err := insertStmt.Exec(
			token.Uuid,
			accessToken,
			token.Type,
			token.Label,
			token.UserUuid,
			token.UserLogin,
			token.AutoRefreshWindow,
			int32(token.ExpiresAt),
			int32(token.CreatedAt),
			token.CreatedBy,
			int32(token.UpdatedAt),
			string(scopes),
		)
		return err
	}
}

func (s *sqlImpl) Delete(patUuid string) error {
	s.Lock()
	defer s.Unlock()
	stmt, err := s.GetStmt("delete")
	if err != nil {
		return err
	}
	_, e := stmt.Exec(patUuid)
	return e
}

func (s *sqlImpl) List(byType auth.PatType, byUser string) (tt []*auth.PersonalAccessToken, e error) {
	s.Lock()
	defer s.Unlock()
	var stmt *sql2.Stmt
	var err error
	var args []interface{}
	if byUser != "" && byType != auth.PatType_ANY {
		stmt, err = s.GetStmt("listByBoth")
		args = append(args, byType, byUser)
	} else if byUser != "" {
		stmt, err = s.GetStmt("listByUser")
		args = append(args, byUser)
	} else if byType != auth.PatType_ANY {
		stmt, err = s.GetStmt("listByType")
		args = append(args, byType)
	} else {
		stmt, err = s.GetStmt("listAll")
	}
	if err != nil {
		return tt, err
	}
	rows, err := stmt.Query(args...)
	if err != nil {
		return tt, err
	}
	defer rows.Close()
	for rows.Next() {
		if t, e := s.scan(rows); e != nil {
			return tt, e
		} else {
			tt = append(tt, t)
		}
	}
	return
}

func (s *sqlImpl) scan(rows *sql2.Rows) (*auth.PersonalAccessToken, error) {
	token := auth.PersonalAccessToken{}
	var exp, cAt, uAt int32
	var scopes, parsedToken string
	e := rows.Scan(
		&token.Uuid,
		&parsedToken,
		&token.Type,
		&token.Label,
		&token.UserUuid,
		&token.UserLogin,
		&token.AutoRefreshWindow,
		&exp,
		&cAt,
		&token.CreatedBy,
		&uAt,
		&scopes,
	)
	if e != nil {
		return nil, e
	}
	token.ExpiresAt = int64(exp)
	token.CreatedAt = int64(cAt)
	token.UpdatedAt = int64(uAt)
	if e := json.Unmarshal([]byte(scopes), &token.Scopes); e != nil {
		return nil, e
	}
	return &token, nil
}

func (s *sqlImpl) PruneExpired() (int, error) {
	stmt, e := s.GetStmt("pruneExpired")
	if e != nil {
		return 0, e
	}
	if res, er := stmt.Exec(time.Now().Unix()); er != nil {
		return 0, er
	} else {
		count, _ := res.RowsAffected()
		return int(count), nil
	}
}
