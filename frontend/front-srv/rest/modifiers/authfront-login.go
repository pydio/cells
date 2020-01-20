package modifiers

import (
	"github.com/dexidp/dex/connector"
	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func LoginPasswordAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		username := in.AuthInfo["login"]
		password := in.AuthInfo["password"]

		// Making sure user_id is not passed in directly
		delete(in.AuthInfo, "user_id")

		// Loop through the different password connectors
		var identity connector.Identity
		var valid bool
		var err error
		connectors := auth.GetConnectors()
		for _, c := range connectors {
			cc, ok := c.Conn().(connector.PasswordConnector)
			if !ok {
				continue
			}

			identity, valid, err = cc.Login(req.Request.Context(), connector.Scopes{}, username, password)
			// Error means the user is unknwown to the system, we contine to the next round
			if err != nil {
				continue
			}

			// Invalid means we found the user but did not match the password
			if !valid {
				err = errors.Forbidden("password", "password does not match")
				continue
			}

			in.AuthInfo["user_id"] = identity.UserID
			in.AuthInfo["source"] = c.ID()

			break
		}

		if err != nil {
			return err
		}

		return middleware(req, rsp, in, out, session)
	}
}
