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
	"net/url"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/service/frontend"
	"github.com/pydio/cells/v5/idm/oauth"
)

// LoginExternalAuth allows users having a valid Cells session to create an authorization code directly
func LoginExternalAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "external" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		challenge, ok := in.AuthInfo["challenge"]
		if !ok {
			return errors.New("Challenge is required")
		}

		accessToken, ok := session.Values["access_token"]
		if !ok {
			return errors.New("Access token is required")
		}
		ctx := req.Request.Context()
		jwtVerifier := auth.DefaultJWTVerifier()
		_, claims, err := jwtVerifier.Verify(ctx, accessToken.(string))
		if err != nil {
			return err
		}

		login, code, err := jwtVerifier.LoginChallengeCode(ctx, claims, auth.SetChallenge(challenge))
		if err != nil {
			return err
		}

		requestURL, err := url.Parse(login.GetRequestURL())
		if err != nil {
			return err
		}

		requestURLValues := requestURL.Query()

		redirectURL, err := oauth.GetRedirectURIFromRequestValues(requestURLValues)
		if err != nil {
			return err
		}

		out.RedirectTo = redirectURL + "?code=" + code + "&state=" + requestURLValues.Get("state")

		return middleware(req, rsp, in, out, session)
	}
}
