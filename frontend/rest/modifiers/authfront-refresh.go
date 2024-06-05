/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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

package modifiers

import (
	"errors"
	"strconv"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/v4/common/auth/hydra"
	pauth "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service/frontend"
)

func RefreshAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "refresh" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		refreshToken, ok := session.Values["refresh_token"]
		if !ok || refreshToken == "" {
			// No refresh token, leaving it there
			return errors.New("No refresh token")
		}

		token, err := hydra.Refresh(req.Request.Context(), refreshToken.(string))
		if err != nil {
			return err
		}

		expiry := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second).Unix()

		session.Values["access_token"] = token.AccessToken
		session.Values["id_token"] = token.IDToken
		session.Values["refresh_token"] = token.RefreshToken
		session.Values["expires_at"] = strconv.Itoa(int(expiry))

		out.Token = &pauth.Token{
			AccessToken: session.Values["access_token"].(string),
			IDToken:     session.Values["id_token"].(string),
			ExpiresAt:   session.Values["expires_at"].(string),
		}

		return middleware(req, rsp, in, out, session)
	}
}
