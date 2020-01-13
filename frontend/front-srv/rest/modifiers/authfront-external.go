package modifiers

import (
	"fmt"
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

		loginChallenge := in.AuthInfo["challenge"]

		if loginChallenge == "" {
			return fmt.Errorf("Missing challenge")
		}

		accessToken, ok := session.Values["access_token"]
		if !ok {
			return middleware(req, rsp, in, out, session)
		}

		_, claims, err := auth.DefaultJWTVerifier().Verify(req.Request.Context(), accessToken.(string))
		if err != nil {
			return err
		}

		loginInfo, err := hydra.GetLogin(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptLogin(loginChallenge, claims.Subject); err != nil {
			return err
		}

		consentChallenge, err := hydra.CreateConsent(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptConsent(consentChallenge); err != nil {
			return err
		}

		code, err := hydra.CreateAuthCode(consentChallenge)
		if err != nil {
			return err
		}

		requestURL, err := url.Parse(loginInfo.RequestURL)
		if err != nil {
			return err
		}

		requestURLValues := requestURL.Query()

		redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURL.Query())
		if err != nil {
			return err
		}

		if redirectURL != "" {
			out.RedirectTo = redirectURL + "?code=" + code + "&state=" + requestURLValues.Get("state")
			return middleware(req, rsp, in, out, session)
		}

		return middleware(req, rsp, in, out, session)
	}
}
