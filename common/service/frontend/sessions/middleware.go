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

package sessions

import (
	"net/http"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

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

		// This triggers an import cycle
		dao, err := manager.Resolve[DAO](r.Context())
		if err != nil {
			log.Logger(r.Context()).Errorf("Cannot resolve DAO: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("Unauthorized (cannot find sessions.DAO)"))
			return
		}
		session, err := dao.GetSession(r)
		if err != nil && !strings.Contains(err.Error(), "securecookie: the value is not valid") {
			log.Logger(r.Context()).Error("Cannot retrieve session", zap.Error(err))
		}

		if value, ok := session.Values["access_token"]; ok {
			ctx := r.Context()
			if ctx, _, err = jwtVerifier.Verify(ctx, value.(string)); err == nil {
				// Update context
				log.Logger(ctx).Debug("Found token in session " + session.Name())
				r = r.WithContext(ctx)
			}
		}

		h.ServeHTTP(w, r)
	})
}
