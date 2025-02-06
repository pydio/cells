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
	"fmt"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	pauth "github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/service/frontend"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/std"
)

// AuthorizationExchangePAT reformats response to exchange an AccessToken against a PAT
func AuthorizationExchangePAT(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "exchange_pat" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		// retrieving crt token from session
		tok, set := session.Values["access_token"]
		if !set {
			tok, set = in.AuthInfo["access_token"]
		}
		if !set {
			return errors.WithMessage(errors.InvalidParameters, "missing access_token from parameters or from session")
		}
		accessToken := tok.(string)
		ctx := req.Request.Context()
		_, claims, err := auth.DefaultJWTVerifier().Verify(ctx, accessToken)
		if err != nil {
			return err
		}

		genRequest := &pauth.PatGenerateRequest{
			Type:      pauth.PatType_PERSONAL,
			UserUuid:  claims.Subject,
			UserLogin: claims.Name,
			Label:     "Exchanged Token",
			Issuer:    req.Request.URL.String(),
		}

		var expiresAt time.Time
		if exp, ok := in.AuthInfo["expires_in"]; ok {
			if d, e := std.ParseCellsDuration(exp); e == nil {
				expiresAt = time.Now().Add(d)
				genRequest.ExpiresAt = expiresAt.Unix()
			} else {
				return errors.WithMessage(errors.InvalidParameters, "Cannot parse expires_in duration. Use golang format like 30s, 30m, 24h, 28d")
			}
		}
		if autoRefresh, ok := in.AuthInfo["auto_refresh"]; ok {
			if d, e := std.ParseCellsDuration(autoRefresh); e == nil {
				genRequest.AutoRefreshWindow = int32(d.Seconds())
				if expiresAt.IsZero() {
					expiresAt = time.Now().Add(d)
				}
			} else {
				return errors.WithMessage(errors.InvalidParameters, "Cannot parse auto-refresh duration. Use golang format like 30s, 30m, 24h, 28d")
			}
		}
		if expiresAt.IsZero() {
			return errors.WithMessage(errors.InvalidParameters, "Please provide one of 'expires_in' or 'auto_refresh' parameters")
		}
		if ss, ok := in.AuthInfo["scopes"]; ok {
			genRequest.Scopes = strings.Split(ss, ",")
		}

		cli := pauth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceTokenGRPC))
		log.Logger(ctx).Info("Sending generate request", zap.Any("req", genRequest))

		if genResp, e := cli.Generate(ctx, genRequest); e != nil {
			return e
		} else {
			out.Token = &pauth.Token{
				AccessToken: genResp.AccessToken,
				ExpiresAt:   fmt.Sprintf("%d", expiresAt.Unix()),
			}
		}

		return nil // Interrupt flow and return
	}
}
