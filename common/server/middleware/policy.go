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

package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

var (
	// HTTPMetaJwtClientApp constant
	HTTPMetaJwtClientApp = "JwtClientApp"
	// HTTPMetaJwtIssuer constant
	HTTPMetaJwtIssuer = "JwtIssuer"
)

// HttpWrapperPolicy applies relevant policy rules and blocks the request if necessary
func HttpWrapperPolicy(ctx context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		subjects := []string{"profile:anon"}
		policyRequestContext := make(map[string]string)

		// Find profile in claims, if any
		if cValue := r.Context().Value(claim.ContextKey); cValue != nil {
			if claims, ok := cValue.(claim.Claims); ok {
				log.Logger(ctx).Debug("Got Claims", zap.Any("claims", claims))
				policyRequestContext[HTTPMetaJwtClientApp] = claims.GetClientApp()
				policyRequestContext[HTTPMetaJwtIssuer] = claims.Issuer
				subjects = permissions.PolicyRequestSubjectsFromClaims(claims)
			}
		} else {
			log.Logger(ctx).Debug("No Claims Found", zap.Any("ctx", ctx))
		}

		client := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicy))
		request := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "rest:" + strings.TrimPrefix(r.RequestURI, common.DefaultRouteREST),
			Action:   r.Method,
		}

		permissions.PolicyContextFromMetadata(policyRequestContext, r.Context())
		if len(policyRequestContext) > 0 {
			request.Context = policyRequestContext
		}

		// Effective request to ladon
		resp, err := client.IsAllowed(r.Context(), request)

		if err != nil || !resp.Allowed {
			if isRestApiPublicMethod(r) {
				h.ServeHTTP(w, r)
				return
			}
			code := 401
			body := "Unauthorized"
			log.Logger(ctx).Debug("PolicyHttpHandlerWrapper denied access", zap.Error(err), zap.Any("request", request))
			var msg string
			if err != nil {
				code = 500
				body = "Internal server error."
				msg = "Cannot check policies: " + err.Error()
			} else { //resp.Allowed == false
				msg = fmt.Sprintf("Policies blocked %s request at %s. Response: %s", r.Method, r.RequestURI, resp.String())
			}

			log.Logger(ctx).Error(msg, zap.Error(err))
			w.WriteHeader(code)
			w.Write([]byte(body + "\n"))
			return
		}

		r = r.WithContext(r.Context())
		h.ServeHTTP(w, r)
	})
}
