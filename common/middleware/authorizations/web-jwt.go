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

package authorizations

import (
	"net/http"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

func IsRestApiPublicMethod(r *http.Request) bool {
	return r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/a/frontend/state")
}

// HttpWrapperJWT captures and verifies a JWT token if it's present in the headers.
// Warning: it goes through if there is no JWT => the next handlers
// must verify if a valid user was found or not.
func HttpWrapperJWT(h http.Handler) http.Handler {

	jwtVerifier := auth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()
		if _, ok := claim.FromContext(r.Context()); ok {
			log.Logger(ctx).Debug("Skip IDToken check as claims are already in context")
			h.ServeHTTP(w, r)
			return
		}

		log.Logger(ctx).Debug("JWTHttpHandler: Checking JWT")
		if val, ok1 := r.Header["Authorization"]; ok1 {

			whole := strings.Join(val, "")
			if !strings.HasPrefix(whole, "Bearer ") {
				log.Logger(ctx).Debug("An Authorization header is found, that does NOT start with 'Bearer' prefix. Skipping token verification.")
				h.ServeHTTP(w, r)
				return
			}

			rawIDToken := strings.TrimPrefix(strings.Trim(whole, ""), "Bearer ")
			//var claims claim.Claims
			var err error

			c, _, err := jwtVerifier.Verify(ctx, rawIDToken)
			if err != nil {
				log.Logger(ctx).Debug("jwtVerifier Error", zap.Error(err))
				if IsRestApiPublicMethod(r) {
					h.ServeHTTP(w, r) // Serve an empty state
					return
				}
				if errors.IsNetworkError(err) {
					w.WriteHeader(503)
					w.Write([]byte("Service unavailable.\n"))
				} else {
					// This is a wrong JWT, go out with error
					w.WriteHeader(401)
					w.Write([]byte("Unauthorized.\n"))
					log.Auditer(c).Error(
						"Blocked invalid JWT",
						log.GetAuditId(common.AuditInvalidJwt),
					)
				}
				return
			}

			r = r.WithContext(c)
		}

		h.ServeHTTP(w, r)
	})
}
