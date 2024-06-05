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
	restful "github.com/emicklei/go-restful/v3"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service/frontend"
)

func LogoutAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "logout" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		ctx := req.Request.Context()

		accessToken, ok := session.Values["access_token"]
		if !ok {
			return middleware(req, rsp, in, out, session)
		}

		refreshToken, ok := session.Values["refresh_token"]
		if !ok {
			return middleware(req, rsp, in, out, session)
		}

		v := auth.DefaultJWTVerifier()
		_, cl, err := v.Verify(ctx, accessToken.(string))
		if err != nil {
			return err
		}

		// Send Event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_LOGOUT,
			User: &idm.User{Login: cl.Name},
		})

		if err := v.Logout(ctx, req.Request.URL.String(), cl.Subject, cl.SessionID, auth.SetAccessToken(accessToken.(string)), auth.SetRefreshToken(refreshToken.(string))); err != nil {
			return err
		}

		// TODO - need to properly logout in hydra
		session.Values = make(map[interface{}]interface{})
		session.Options.MaxAge = 0

		return middleware(req, rsp, in, out, session)
	}
}
