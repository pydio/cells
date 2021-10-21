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

package frontend

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/utils/net"
)

var (
	sessionStores     map[string]*sessions.CookieStore
	sessionStoresLock *sync.Mutex
	knownKey          []byte
)

func init() {
	sessionStores = make(map[string]*sessions.CookieStore)
	sessionStoresLock = &sync.Mutex{}
}

func loadKey() []byte {
	if knownKey != nil {
		return knownKey
	}
	val := config.Get("frontend", "session", "secureKey").String()
	if val != "" {
		if kk, e := base64.StdEncoding.DecodeString(val); e == nil {
			knownKey = kk
			return knownKey
		} else {
			log.Logger(context.Background()).Error("Failed loading secure key from config, session may not be persisted after restart!", zap.Error(e))
		}
	}
	knownKey = securecookie.GenerateRandomKey(64)
	val = base64.StdEncoding.EncodeToString(knownKey)
	config.Get("frontend", "session", "secureKey").Set(val)
	if e := config.Save(common.PydioSystemUsername, "Generating session random key"); e != nil {
		log.Logger(context.Background()).Error("Failed saving secure key to config, session will not be persisted after restart!", zap.Error(e))
	}

	return knownKey
}

func storeForUrl(u *url.URL) sessions.Store {
	key := u.Scheme + "://" + u.Hostname()
	sessionStoresLock.Lock()
	defer sessionStoresLock.Unlock()
	if ss, o := sessionStores[key]; o {
		return ss
	}

	pKey := loadKey()
	ss := sessions.NewCookieStore(pKey)
	timeout := config.Get("frontend", "plugin", "gui.ajax", "SESSION_TIMEOUT").Default(60).Int()
	ss.Options = &sessions.Options{
		Path:     "/a/frontend",
		MaxAge:   60 * timeout,
		HttpOnly: true,
	}
	if u.Scheme == "https" {
		ss.Options.Secure = true
	}
	ss.Options.Domain = u.Hostname()
	sessionStores[key] = ss
	return ss
}

func GetSessionStore(req *http.Request) sessions.Store {
	u := net.ExternalDomainFromRequest(req)
	return storeForUrl(u)
}

// NewSessionWrapper creates a Http middleware checking if a cookie is passed
// along and if this cookie contains a proper JWT.
// The excludes parameter may be used to namely ignore specific "METHOD:/URI“ for this check.
func NewSessionWrapper(h http.Handler, excludes ...string) http.Handler {

	jwtVerifier := auth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		for _, excluded := range excludes {
			split := strings.Split(excluded, ":")
			method := split[0]
			uri := split[1]
			if strings.EqualFold(method, r.Method) && strings.HasPrefix(r.RequestURI, uri) {
				log.Logger(r.Context()).Debug("Skipping session wrapper by exclusion:" + excluded)
				h.ServeHTTP(w, r)
				return
			}
		}

		sessionName := "pydio"
		if h, ok := r.Header["X-Pydio-Minisite"]; ok {
			sessionName = sessionName + "-" + strings.Join(h, "")
		}
		if h, ok := r.Header[common.XPydioFrontendSessionUuid]; ok {
			sessionName = sessionName + "-" + strings.Join(h, "")
		}
		session, err := GetSessionStore(r).Get(r, sessionName)
		if err != nil && !strings.Contains(err.Error(), "securecookie: the value is not valid") {
			log.Logger(r.Context()).Error("Cannot retrieve session", zap.Error(err))
		}

		if value, ok := session.Values["access_token"]; ok {
			ctx := r.Context()
			if ctx, _, err = jwtVerifier.Verify(ctx, value.(string)); err == nil {
				// Update context
				log.Logger(ctx).Debug("Found token in session " + sessionName)
				r = r.WithContext(ctx)
			}
		}
		h.ServeHTTP(w, r)
	})
}
