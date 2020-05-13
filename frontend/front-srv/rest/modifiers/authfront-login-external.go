package modifiers

import (
	"errors"
	"net/url"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/ory/fosite"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/hydra"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

// LoginExternalAuth allows users having a valid Cells session to create an authorization code directly
func LoginExternalAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
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

		_, claims, err := auth.DefaultJWTVerifier().Verify(req.Request.Context(), accessToken.(string))
		if err != nil {
			return err
		}

		code, err := auth.DefaultJWTVerifier().LoginChallengeCode(req.Request.Context(), claims, auth.SetChallenge(challenge))
		if err != nil {
			return err
		}

		login, err := hydra.GetLogin(req.Request.Context(), challenge)
		if err != nil {
			return err
		}
		requestURL, err := url.Parse(login.GetRequestURL())
		if err != nil {
			return err
		}

		requestURLValues := requestURL.Query()

		redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURLValues)
		if err != nil {
			return err
		}

		out.RedirectTo = redirectURL + "?code=" + code + "&state=" + requestURLValues.Get("state")

		return middleware(req, rsp, in, out, session)
	}
}
