package modifiers

import (
	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

// LoginExternalAuth allows users having a valid Cells session to create an authorization code directly
func LoginExternalAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "external" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		// Making sure user_id is not passed in directly
		delete(in.AuthInfo, "user_id")

		accessToken, ok := session.Values["access_token"]
		if !ok {
			return middleware(req, rsp, in, out, session)
		}

		_, claims, err := auth.DefaultJWTVerifier().Verify(req.Request.Context(), accessToken.(string))
		if err != nil {
			return err
		}

		in.AuthInfo["user_id"] = claims.Subject

		return middleware(req, rsp, in, out, session)
	}
}
