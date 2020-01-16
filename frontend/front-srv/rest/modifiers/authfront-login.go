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

		username := in.AuthInfo["login"]
		password := in.AuthInfo["password"]

		clientID := "cells-frontend"
		scopes := []string{"openid", "profile", "offline"}
		audiences := []string{}

		// Create a new login challenge
		loginChallenge := in.AuthInfo["challenge"]
		if loginChallenge == "" {
			l, err := hydra.CreateLogin(clientID, scopes, audiences)
			if err != nil {
				return err
			}

			loginChallenge = l.Challenge
			in.AuthInfo["challenge"] = loginChallenge
		}

		// Check the user has successfully logged in
		c := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		resp, err := c.BindUser(req.Request.Context(), &idm.BindUserRequest{UserName: username, Password: password})
		if err != nil {
			// We carry on with other middlewares
			out.Error = err.Error()
			return middleware(req, rsp, in, out, session)
		}

		// Validate the login, the consent and generate the auth code
		login, err := hydra.GetLogin(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptLogin(loginChallenge, resp.GetUser().Uuid); err != nil {
			return err
		}

		consent, err := hydra.CreateConsent(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptConsent(
			consent.Challenge,
			login.GetRequestedScope(),
			login.GetRequestedAudience(),
			map[string]string{},
			map[string]string{
				"name":  resp.GetUser().GetLogin(),
				"email": resp.GetUser().GetAttributes()["email"],
			},
		); err != nil {
			return err
		}

		requestURL, err := url.Parse(login.GetRequestURL())
		if err != nil {
			return err
		}

		requestURLValues := requestURL.Query()

		redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURL.Query())
		if err != nil {
			return err
		}

		code, err := hydra.CreateAuthCode(consent, login.GetClientID(), redirectURL)
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
		out.Error = ""

		session.Values["access_token"] = out.GetToken().GetAccessToken()
		session.Values["id_token"] = out.GetToken().GetIDToken()
		session.Values["expires_at"] = out.GetToken().GetExpiresAt()
		session.Values["refresh_token"] = token.RefreshToken

		return middleware(req, rsp, in, out, session)
	}
}
