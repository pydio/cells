package auth

import (
	"context"
	"encoding/json"
	"time"

	"github.com/coreos/dex/storage"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sql"
)

type dexSql struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *dexSql) Init(options config.Map) error {

	// super
	s.DAO.Init(options)

	// Do NOT prepare the stmts now
	return nil
}

// DexPruneOfflineSessions browses existing sessions looking of refresh tokens totally expired
func (s *dexSql) DexPruneOfflineSessions(c Config) (pruned int64, e error) {

	stmt, e := s.DB().Prepare("SELECT * FROM dex_offline_session")
	if e != nil {
		return 0, e
	}

	defer stmt.Close()

	rows, e := stmt.Query()
	if e != nil {
		return 0, e
	}
	defer rows.Close()
	for rows.Next() {
		var uId, connId string
		var jsonData []byte
		if err := rows.Scan(&uId, &connId, &jsonData); err != nil {
			log.Logger(context.Background()).Error("Cannot scan row for offline session")
			continue
		}
		var tokens map[string]*storage.RefreshTokenRef
		if e := json.Unmarshal(jsonData, &tokens); e != nil {
			log.Logger(context.Background()).Error("Cannot scan unmarshall data for offline session")
			continue
		}
		session := &storage.OfflineSessions{
			UserID:  uId,
			ConnID:  connId,
			Refresh: tokens,
		}
		needsDeletion := false
		for _, token := range session.Refresh {
			if s.needsDeletion(token, c) {
				needsDeletion = true
				break
			}
		}
		if !needsDeletion {
			continue
		}
		// This session needs deletion. Delete offline session and refresh_token

		if e = s.DexDeleteOfflineSessions(c, session.UserID, session.ConnID); e == nil {
			pruned++
			log.Logger(context.Background()).Debug("Successfully deleted offline session and refresh token")
		} else {
			log.Logger(context.Background()).Error("Could not delete offline session")
		}
	}

	return
}

// DexDeleteOfflineSessions Delete offline session and refresh token based on uuid / session uuid (nonce)
func (s *dexSql) DexDeleteOfflineSessions(c Config, userUuid string, sessionUuid string) error {

	offline, e := s.DB().Prepare(`DELETE FROM dex_offline_session WHERE user_id=? AND conn_id=?`)
	if e != nil {
		return e
	}
	defer offline.Close()

	refresh, e := s.DB().Prepare(`DELETE FROM dex_refresh_token WHERE claims_user_id=? AND nonce=?`)
	if e != nil {
		return e
	}
	defer refresh.Close()

	// This session needs deletion. Delete offline session and refresh_token
	if _, e1 := offline.Exec(userUuid, sessionUuid); e1 == nil {
		if _, e2 := refresh.Exec(userUuid, sessionUuid); e2 == nil {
			log.Logger(context.Background()).Debug("Deleted offline session and refresh token")
		} else {
			return e2
		}
	} else {
		return e1
	}
	return nil

}

func (s *dexSql) needsDeletion(refreshToken *storage.RefreshTokenRef, c Config) bool {

	var client storage.Client
	found := false
	for _, staticClient := range c.StaticClients {
		if staticClient.ID == refreshToken.ClientID {
			client = staticClient
			found = true
		}
	}
	if !found || client.RefreshTokensExpiry == "" {
		return false
	}

	var ref time.Time
	if client.OfflineSessionsSliding {
		ref = refreshToken.LastUsed
	} else {
		ref = refreshToken.CreatedAt
	}
	if expiry, e := time.ParseDuration(client.RefreshTokensExpiry); e != nil {
		return false
	} else if time.Now().After(ref.Add(expiry)) {
		return true
	} else {
		return false
	}

}
