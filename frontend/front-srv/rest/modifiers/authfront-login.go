package modifiers

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"github.com/dexidp/dex/connector"
	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/errors"
	"github.com/ory/fosite"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/hydra"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/common/utils/permissions"
)

func LoginPasswordAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		// Checking we're not already logged in
		if _, ok := session.Values["access_token"]; ok {
			return middleware(req, rsp, in, out, session)
		}

		ctx := req.Request.Context()

		username := in.AuthInfo["login"]
		password := in.AuthInfo["password"]
		loginChallenge := in.AuthInfo["challenge"]

		if loginChallenge == "" {
			l, err := hydra.CreateLogin("cells-frontend", []string{"openid", "profile", "offline"}, []string{})
			if err != nil {
				return err
			}

			loginChallenge = l.Challenge
		}

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
				return errors.Forbidden("password", "password does not match")
			}

			break
		}

		if err != nil {
			return err
		}

		if err := PostLoginCheck(ctx, identity.UserID); err != nil {
			return err
		}

		login, err := hydra.GetLogin(loginChallenge)
		if err != nil {
			return err
		}

		if _, err := hydra.AcceptLogin(loginChallenge, identity.UserID); err != nil {
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
				"name":  identity.Username,
				"email": identity.Email,
			},
		); err != nil {
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

func PostLoginCheck(ctx context.Context, userID string) error {
	// Searching user for attributes
	user, err := permissions.SearchUniqueUser(ctx, "", userID)
	if err != nil {
		return err
	}

	// Checking user is locked
	if permissions.IsUserLocked(user) {
		log.Auditer(ctx).Error(
			"Locked user ["+user.Login+"] tried to log in.",
			log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
			zap.String(common.KEY_USER_UUID, user.Uuid),
		)
		log.Logger(ctx).Error("lock denies login for "+user.Login, zap.Error(fmt.Errorf("blocked login")))
		return errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" has been blocked. Contact your sysadmin.")
	}

	// Checking policies
	cli := idm.NewPolicyEngineServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, defaults.NewClient())
	policyContext := make(map[string]string)
	permissions.PolicyContextFromMetadata(policyContext, ctx)
	subjects := permissions.PolicyRequestSubjectsFromUser(user)

	// Check all subjects, if one has deny return false
	policyRequest := &idm.PolicyEngineRequest{
		Subjects: subjects,
		Resource: "oidc",
		Action:   "login",
		Context:  policyContext,
	}
	if resp, err := cli.IsAllowed(ctx, policyRequest); err != nil || resp.Allowed == false {
		log.Auditer(ctx).Error(
			"Policy denied login to ["+user.Login+"]",
			log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
			zap.String(common.KEY_USER_UUID, user.Uuid),
			zap.Any(common.KEY_POLICY_REQUEST, policyRequest),
			zap.Error(err),
		)
		log.Logger(ctx).Error("policy denies login for request", zap.Any(common.KEY_POLICY_REQUEST, policyRequest), zap.Error(err))
		return errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" is not authorized to log in")
	}

	return nil
}
