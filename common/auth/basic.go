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

package auth

import (
	"net/http"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
)

func NewBasicAuthenticator(realm string, ttl time.Duration) *BasicAuthenticator {
	ba := &BasicAuthenticator{
		Realm: realm,
		TTL:   ttl,
	}
	ba.cacheConfig = cache.Config{
		Prefix:          "auth/basic",
		Eviction:        ttl.String(),
		CleanWindow:     (2 * ttl).String(),
		DiscardFallback: true,
	}
	return ba
}

type validBasicUser struct {
	Hash   string
	Claims claim.Claims
}

// valid reports whether a cached entry can serve a request. The cache eviction is
// absolute (a hit does not extend it), so deleted or locked users are cut off after TTL.
func (v *validBasicUser) valid(pass string, now time.Time) bool {
	return v.Hash == pass && (v.Claims.Expiry.IsZero() || now.Before(v.Claims.Expiry))
}

type BasicAuthenticator struct {
	TTL         time.Duration
	Realm       string
	cacheConfig cache.Config
}

func (b *BasicAuthenticator) Wrap(handler http.Handler) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		if user, pass, ok := r.BasicAuth(); ok {

			ctx := r.Context()
			ca := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, b.cacheConfig)

			var cached *validBasicUser
			if ca.Get(user, &cached) && cached.valid(pass, time.Now()) {
				r = r.WithContext(claim.ToContext(ctx, cached.Claims))
				handler.ServeHTTP(w, r)
				return
			}

			djv := DefaultJWTVerifier()
			if tokenCtx, tokenClaims, err := djv.Verify(ctx, pass); err == nil && tokenClaims.Name == user {
				// Password used is directly an access token and user name is correct, use these claims directly
				r = r.WithContext(tokenCtx)
				_ = ca.Set(user, &validBasicUser{Hash: pass, Claims: tokenClaims})
				handler.ServeHTTP(w, r)
				return
			}

			// Otherwise continue in standard user/pass scheme
			token, err := djv.PasswordCredentialsToken(ctx, user, pass)
			if err != nil {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}
			newCtx, claims, err := djv.Verify(ctx, token.AccessToken)
			if err == nil {
				r = r.WithContext(newCtx)
				_ = ca.Set(user, &validBasicUser{Hash: pass, Claims: claims})
				handler.ServeHTTP(w, r)
				return
			}
		}

		w.Header().Set("WWW-Authenticate", `Basic realm="`+b.Realm+`"`)
		w.WriteHeader(401)
		w.Write([]byte("Unauthorized.\n"))
	}
}
