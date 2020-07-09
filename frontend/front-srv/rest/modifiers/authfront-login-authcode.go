package modifiers

import (
	"strconv"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/common/auth"
	pauth "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

// AuthorizationCodeAuth allows users having a valid AuthCode to register a session
func AuthorizationCodeAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "authorization_code" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		token, err := auth.DefaultJWTVerifier().Exchange(req.Request.Context(), in.AuthInfo["code"])
		if err != nil {
			return err
		}

		_, claims, err := auth.DefaultJWTVerifier().Verify(req.Request.Context(), token.AccessToken)
		if err != nil {
			return err
		}

		in.AuthInfo["login"] = claims.Name
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

		return middleware(req, rsp, in, out, session) // BEFORE MIDDLEWARE
	}
}
