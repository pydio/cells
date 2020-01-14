package modifiers

import (
	"net/url"
	"strconv"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/ory/fosite"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/hydra"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func LoginPasswordAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		login := in.AuthInfo["login"]
		password := in.AuthInfo["password"]
		loginChallenge := in.AuthInfo["challenge"]

		if loginChallenge == "" {
			if l, err := hydra.CreateLogin(); err != nil {
				return err
			} else {
				loginChallenge = l
			}
		}

		c := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		resp, err := c.BindUser(req.Request.Context(), &idm.BindUserRequest{UserName: login, Password: password})
		if err != nil {
			return err
		}

		loginInfo, err := hydra.GetLogin(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptLogin(loginChallenge, resp.GetUser().Uuid); err != nil {
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

		token, err := hydra.Exchange(code)
		if err != nil {
			return err
		}

		// Do not show the refresh token here
		out.Token = &rest.Token{
			AccessToken: token.AccessToken,
			IDToken:     token.Extra("id_token").(string),
			ExpiresAt:   strconv.Itoa(int(token.Expiry.Unix())),
		}

		session.Values["access_token"] = out.GetToken().GetAccessToken()
		session.Values["id_token"] = out.GetToken().GetIDToken()
		session.Values["expires_at"] = out.GetToken().GetExpiresAt()
		session.Values["refresh_token"] = token.RefreshToken

		return middleware(req, rsp, in, out, session)
	}
}
