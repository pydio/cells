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

package service

import (
	"fmt"
	"net/http"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	// HTTPMetaJwtClientApp constant
	HTTPMetaJwtClientApp = "JwtClientApp"
	// HTTPMetaJwtIssuer constant
	HTTPMetaJwtIssuer = "JwtIssuer"
)

// PolicyHTTPWrapper applies relevant policy rules and blocks the request if necessary
func PolicyHTTPWrapper(h http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		c := r.Context()

		subjects := []string{"profile:anon"}
		policyRequestContext := make(map[string]string)

		// Find profile in claims, if any
		if cValue := c.Value(claim.ContextKey); cValue != nil {
			if claims, ok := cValue.(claim.Claims); ok {
				log.Logger(c).Debug("Got Claims", zap.Any("claims", claims))
				policyRequestContext[HTTPMetaJwtClientApp] = claims.GetClientApp()
				policyRequestContext[HTTPMetaJwtIssuer] = claims.Issuer
				subjects = permissions.PolicyRequestSubjectsFromClaims(claims)
			}
		} else {
			log.Logger(c).Debug("No Claims Found", zap.Any("ctx", c))
		}

		client := idm.NewPolicyEngineServiceClient(common.ServiceGrpcNamespace_+common.ServicePolicy, defaults.NewClient())
		request := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "rest:" + r.RequestURI,
			Action:   r.Method,
		}

		permissions.PolicyContextFromMetadata(policyRequestContext, c)
		if len(policyRequestContext) > 0 {
			request.Context = policyRequestContext
		}

		// Effective request to ladon
		resp, err := client.IsAllowed(c, request)

		if err != nil || !resp.Allowed {
			if isRestApiPublicMethod(r) {
				h.ServeHTTP(w, r)
				return
			}
			code := 401
			body := "Unauthorized"
			log.Logger(c).Debug("PolicyHttpHandlerWrapper denied access", zap.Error(err), zap.Any("request", request))
			var msg string
			if err != nil {
				code = 500
				body = "Internal server error."
				msg = "Cannot check policies: " + err.Error()
			} else { //resp.Allowed == false
				msg = fmt.Sprintf("Policies blocked %s request at %s. Response: %s", r.Method, r.RequestURI, resp.String())
			}

			log.Logger(c).Error(msg, zap.Error(err))
			w.WriteHeader(code)
			w.Write([]byte(body + "\n"))
			return
		}

		r = r.WithContext(c)
		h.ServeHTTP(w, r)
	})
}
