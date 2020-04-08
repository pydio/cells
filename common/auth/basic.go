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

package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
)

func NewBasicAuthenticator(realm string, ttl time.Duration) *BasicAuthenticator {
	ba := &BasicAuthenticator{}
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

			if valid, vOk := b.cache[user]; vOk && time.Now().Sub(valid.Connexion) <= time.Duration(time.Minute*10) && valid.Hash == pass {

				md := map[string]string{}
				if meta, ok := metadata.FromContext(ctx); ok {
					for k, v := range meta {
						md[k] = v
					}
				}
				md[common.PYDIO_CONTEXT_USER_KEY] = valid.Claims.Name
				ctx = metadata.NewContext(ctx, md)

				r = r.WithContext(context.WithValue(ctx, claim.ContextKey, valid.Claims))

				valid.Connexion = time.Now()
				handler.ServeHTTP(w, r)
				return
			}

			token, err := DefaultJWTVerifier().PasswordCredentialsToken(ctx, user, pass)
			if err != nil {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}

			newCtx, claims, err := DefaultJWTVerifier().Verify(ctx, token.AccessToken)
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
