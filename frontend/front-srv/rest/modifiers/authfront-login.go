package modifiers

import (
	"net/url"
	"strconv"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/ory/fosite"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/hydra"
	pauth "github.com/pydio/cells/common/proto/auth"
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

		if challenge, ok := in.AuthInfo["challenge"]; ok {
			// If we do have a challenge, then we're coming from an external source and
			code, err := auth.DefaultJWTVerifier().PasswordCredentialsCode(req.Request.Context(), username, password, auth.SetChallenge(challenge))
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

		// If we don't have a challenge then we proceed with a normal login
		token, err := auth.DefaultJWTVerifier().PasswordCredentialsToken(req.Request.Context(), username, password)
		if err != nil {
			return err
		}

		_, claims, err := auth.DefaultJWTVerifier().Verify(req.Request.Context(), token.AccessToken)
		if err != nil {
			return err
		}

		in.AuthInfo["source"] = claims.AuthSource

		session.Values["access_token"] = token.AccessToken
		session.Values["id_token"] = token.Extra("id_token").(string)
		session.Values["expires_at"] = strconv.Itoa(int(token.Expiry.Unix()))
		session.Values["refresh_token"] = token.RefreshToken

		out.Token = &pauth.Token{
			AccessToken: session.Values["access_token"].(string),
			IDToken:     session.Values["id_token"].(string),
			ExpiresAt:   session.Values["expires_at"].(string),
		}

		return middleware(req, rsp, in, out, session)
	}
}
