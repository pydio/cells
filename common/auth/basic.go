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
	"context"
	"net/http"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

func NewBasicAuthenticator(realm string, ttl time.Duration) *BasicAuthenticator {
	ba := &BasicAuthenticator{
		Realm: realm,
		TTL:   ttl,
	}
	ba.cache = make(map[string]*validBasicUser)
	return ba
}

type validBasicUser struct {
	Hash      string
	Connexion time.Time
	Claims    claim.Claims
}

type BasicAuthenticator struct {
	TTL   time.Duration
	Realm string
	cache map[string]*validBasicUser
}

func (b *BasicAuthenticator) Wrap(handler http.Handler) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		if user, pass, ok := r.BasicAuth(); ok {

			ctx := r.Context()

			if valid, vOk := b.cache[user]; vOk && time.Since(valid.Connexion) <= b.TTL && valid.Hash == pass {

				md := map[string]string{}
				if meta, ok := metadata.FromContext(ctx); ok {
					for k, v := range meta {
						md[k] = v
					}
				}
				md[common.PydioContextUserKey] = valid.Claims.Name
				ctx = metadata.NewContext(ctx, md)

				r = r.WithContext(context.WithValue(ctx, claim.ContextKey, valid.Claims))

				valid.Connexion = time.Now()
				handler.ServeHTTP(w, r)
				return
			}

			djv := DefaultJWTVerifier()
			if tokenCtx, tokenClaims, err := djv.Verify(ctx, pass); err == nil && tokenClaims.Name == user {
				// Password used is directly an access token and user name is correct, use these claims directly
				r = r.WithContext(tokenCtx)
				b.cache[user] = &validBasicUser{
					Hash:      pass,
					Connexion: time.Now(),
					Claims:    tokenClaims,
				}
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
				b.cache[user] = &validBasicUser{
					Hash:      pass,
					Connexion: time.Now(),
					Claims:    claims,
				}
				handler.ServeHTTP(w, r)
				return
			}
		}

		w.Header().Set("WWW-Authenticate", `Basic realm="`+b.Realm+`"`)
		w.WriteHeader(401)
		w.Write([]byte("Unauthorized.\n"))
	}
}
