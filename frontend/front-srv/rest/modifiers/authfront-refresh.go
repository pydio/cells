package modifiers

import (
	"errors"
	"strconv"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/common/auth/hydra"
	pauth "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func RefreshAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
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
