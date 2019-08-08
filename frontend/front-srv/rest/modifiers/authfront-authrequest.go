package modifiers

import (
	"github.com/emicklei/go-restful"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func InitAuthRequest(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "create_auth_request" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		nonce := uuid.New().String()
		session.Values["nonce"] = nonce

		return middleware(req, rsp, in, out, session)
	}
}
