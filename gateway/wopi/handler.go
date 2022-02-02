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

package wopi

import (
	"fmt"
	"net/http"
	"time"

	commonauth "github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
)

func auth(inner http.Handler) http.Handler {

	jwtVerifier := commonauth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()
		if bearer := r.URL.Query().Get("access_token"); len(bearer) > 0 {
			var err error
			var claims claim.Claims
			ctx, claims, err = jwtVerifier.Verify(ctx, bearer)
			if err == nil && claims.Name != "" {
				r = r.WithContext(ctx)
				inner.ServeHTTP(w, r)
				return
			}

		}
		log.Logger(ctx).Error("JWT token validation failed, cannot process request")
		w.WriteHeader(http.StatusUnauthorized)
	})
}

func logger(inner http.Handler, name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		start := time.Now()

		inner.ServeHTTP(w, r)

		log.Logger(r.Context()).Debug(
			fmt.Sprintf("%s %s %s %s",
				r.Method,
				r.RequestURI,
				name,
				time.Since(start),
			))
	})
}
