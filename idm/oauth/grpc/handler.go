/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package grpc

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/x/urlx"
	"github.com/pborman/uuid"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/idm/oauth"
)

// Handler for the plugin
type Handler struct{}

var (
	_ auth.LoginProviderHandler      = (*Handler)(nil)
	_ auth.ConsentProviderHandler    = (*Handler)(nil)
	_ auth.AuthCodeProviderHandler   = (*Handler)(nil)
	_ auth.AuthCodeExchangerHandler  = (*Handler)(nil)
	_ auth.AuthTokenVerifierHandler  = (*Handler)(nil)
	_ auth.AuthTokenRefresherHandler = (*Handler)(nil)
)

var (
	DefaultClientID    = "cells-frontend"
	DefaultRedirectURI = config.Get("defaults", "url").String("") + "/auth/callback"
)

func (h *Handler) GetLogin(ctx context.Context, in *auth.GetLoginRequest, out *auth.GetLoginResponse) error {
	req, err := oauth.GetRegistry().ConsentManager().GetLoginRequest(ctx, in.Challenge)
	if err != nil {
		return err
	}

	out.Challenge = req.Challenge
	out.SessionID = req.SessionID
	out.RequestURL = req.RequestURL
	out.Subject = req.Subject
	out.RequestedScope = req.RequestedScope
	out.RequestedAudience = req.RequestedAudience
	out.ClientID = req.Client.GetID()

	return nil
}

func (h *Handler) CreateLogin(ctx context.Context, in *auth.CreateLoginRequest, out *auth.CreateLoginResponse) error {

	// Set up csrf/challenge/verifier values
	verifier := strings.Replace(uuid.New(), "-", "", -1)
	challenge := strings.Replace(uuid.New(), "-", "", -1)
	csrf := strings.Replace(uuid.New(), "-", "", -1)

	// Generate the request URL
	iu := urlx.AppendPaths(oauth.GetConfigurationProvider().IssuerURL(), oauth.GetConfigurationProvider().OAuth2AuthURL())

	sessionID := uuid.New()

	if err := oauth.GetRegistry().ConsentManager().CreateLoginSession(ctx, &consent.LoginSession{
		ID:              sessionID,
		Subject:         "",
		AuthenticatedAt: time.Now().UTC(),
		Remember:        false,
	}); err != nil {
		return err
	}

	client, err := oauth.GetRegistry().ClientManager().GetConcreteClient(ctx, in.GetClientID())
	if err != nil {
		return err
	}

	// Set the session
	if err := oauth.GetRegistry().ConsentManager().CreateLoginRequest(
		ctx,
		&consent.LoginRequest{
			Challenge:         challenge,
			Verifier:          verifier,
			CSRF:              csrf,
			Skip:              false,
			RequestedScope:    in.GetScopes(),
			RequestedAudience: in.GetAudiences(),
			Subject:           "",
			Client:            client,
			RequestURL:        iu.String(),
			AuthenticatedAt:   time.Time{},
			RequestedAt:       time.Now().UTC(),
			SessionID:         sessionID,
		},
	); err != nil {
		return errors.WithStack(err)
	}

	out.Login = &auth.ID{
		Challenge: challenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return nil
}

func (h *Handler) AcceptLogin(ctx context.Context, in *auth.AcceptLoginRequest, out *auth.AcceptLoginResponse) error {

	var p consent.HandledLoginRequest
	p.Subject = in.Subject
	p.Challenge = in.Challenge
	p.RequestedAt = time.Now().UTC()
	p.AuthenticatedAt = p.RequestedAt

	_, err := oauth.GetRegistry().ConsentManager().HandleLoginRequest(ctx, in.Challenge, &p)
	if err != nil {
		return err
	}

	return nil
}

func (h *Handler) GetConsent(ctx context.Context, in *auth.GetConsentRequest, out *auth.GetConsentResponse) error {
	req, err := oauth.GetRegistry().ConsentManager().GetConsentRequest(ctx, in.Challenge)
	if err != nil {
		return err
	}

	out.Challenge = req.Challenge
	out.LoginSessionID = req.LoginSessionID
	out.Subject = req.Subject
	out.SubjectIdentifier = req.Subject
	out.ClientID = req.Client.ClientID

	return nil
}

func (h *Handler) CreateConsent(ctx context.Context, in *auth.CreateConsentRequest, out *auth.CreateConsentResponse) error {

	// Set up csrf/challenge/verifier values
	verifier := strings.Replace(uuid.New(), "-", "", -1)
	challenge := strings.Replace(uuid.New(), "-", "", -1)
	csrf := strings.Replace(uuid.New(), "-", "", -1)

	login, err := oauth.GetRegistry().ConsentManager().GetLoginRequest(ctx, in.LoginChallenge)
	if err != nil {
		return err
	}

	client, err := oauth.GetRegistry().ClientManager().GetConcreteClient(ctx, login.Client.ClientID)
	if err != nil {
		return err
	}

	session, err := oauth.GetRegistry().ConsentManager().VerifyAndInvalidateLoginRequest(ctx, login.Verifier)
	if err != nil {
		return err
	}

	if session.Error != nil {
		return fmt.Errorf(session.Error.Name)
	}

	if session.RequestedAt.Add(oauth.GetConfigurationProvider().ConsentRequestMaxAge()).Before(time.Now()) {
		return errors.WithStack(fosite.ErrRequestUnauthorized.WithDebug("The login request has expired, please try again."))
	}

	if err := oauth.GetRegistry().ConsentManager().ConfirmLoginSession(ctx, session.LoginRequest.SessionID, session.Subject, session.Remember); err != nil {
		return err
	}

	// Set the session
	if err := oauth.GetRegistry().ConsentManager().CreateConsentRequest(
		ctx,
		&consent.ConsentRequest{
			Challenge:         challenge,
			Verifier:          verifier,
			CSRF:              csrf,
			Skip:              false,
			RequestedScope:    login.RequestedScope,
			RequestedAudience: login.RequestedAudience,
			Subject:           session.Subject,
			Client:            client,
			RequestURL:        login.RequestURL,
			LoginChallenge:    login.Challenge,
			LoginSessionID:    login.SessionID,
			AuthenticatedAt:   time.Now().UTC(),
			RequestedAt:       time.Now().UTC(),
		},
	); err != nil {
		return errors.WithStack(err)
	}

	out.Consent = &auth.ID{
		Challenge: challenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return nil
}

func (h *Handler) AcceptConsent(ctx context.Context, in *auth.AcceptConsentRequest, out *auth.AcceptConsentResponse) error {

	var p consent.HandledConsentRequest

	p.Challenge = in.Challenge
	p.RequestedAt = time.Now().UTC()
	p.AuthenticatedAt = p.RequestedAt
	p.Session = consent.NewConsentRequestSessionData()
	p.Session.IDToken = map[string]interface{}{
		"name": "admin",
	}
	p.GrantedScope = in.GetScopes()
	p.GrantedAudience = in.GetAudiences()

	_, err := oauth.GetRegistry().ConsentManager().HandleConsentRequest(ctx, in.Challenge, &p)
	if err != nil {
		return err
	}

	return nil
}

func (h *Handler) CreateAuthCode(ctx context.Context, in *auth.CreateAuthCodeRequest, out *auth.CreateAuthCodeResponse) error {

	values := url.Values{}
	values.Set("client_id", in.GetClientID())
	values.Set("redirect_uri", in.GetRedirectURI())
	values.Set("response_type", "code")
	values.Set("consent_verifier", in.GetConsent().GetVerifier())
	values.Set("state", uuid.New())

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	cookieSession, err := oauth.GetRegistry().CookieStore().Get(req, "oauth2_consent_csrf")
	if err != nil {
		return err
	}
	cookieSession.Values["csrf"] = in.GetConsent().GetCSRF()

	ar, err := oauth.GetRegistry().OAuth2Provider().NewAuthorizeRequest(ctx, req)
	if err != nil {
		return err
	}

	session, err := oauth.GetRegistry().ConsentStrategy().HandleOAuth2AuthorizationRequest(http.ResponseWriter(nil), req, ar)
	if errors.Cause(err) == consent.ErrAbortOAuth2Request {
		// do nothing
		return nil
	} else if err != nil {
		return err
	}

	for _, scope := range session.GrantedScope {
		ar.GrantScope(scope)
	}

	for _, audience := range session.GrantedAudience {
		ar.GrantAudience(audience)
	}

	openIDKeyID, err := oauth.GetRegistry().OpenIDJWTStrategy().GetPublicKeyID(ctx)
	if err != nil {
		return err
	}

	var accessTokenKeyID string
	if oauth.GetConfigurationProvider().AccessTokenStrategy() == "jwt" {
		accessTokenKeyID, err = oauth.GetRegistry().AccessTokenJWTStrategy().GetPublicKeyID(ctx)
		if err != nil {
			return err
		}
	}

	ar.SetID(session.Challenge)

	claims := &jwt.IDTokenClaims{
		Subject:     session.ConsentRequest.SubjectIdentifier,
		Issuer:      strings.TrimRight(oauth.GetConfigurationProvider().IssuerURL().String(), "/") + "/",
		IssuedAt:    time.Now().UTC(),
		AuthTime:    time.Now().UTC(),
		RequestedAt: time.Now().UTC(),
		Extra:       session.Session.IDToken,
	}

	claims.Add("sid", session.ConsentRequest.LoginSessionID)

	// done
	response, err := oauth.GetRegistry().OAuth2Provider().NewAuthorizeResponse(ctx, ar, &oauth2.Session{
		DefaultSession: &openid.DefaultSession{
			Claims: claims,
			Headers: &jwt.Headers{Extra: map[string]interface{}{
				"kid": openIDKeyID,
			}},
			Subject: session.ConsentRequest.Subject,
		},
		Extra:            session.Session.AccessToken,
		KID:              accessTokenKeyID,
		ClientID:         ar.GetClient().GetID(),
		ConsentChallenge: session.Challenge,
	})

	if err != nil {
		return err
	}

	out.Code = response.GetCode()

	return nil
}

// Verify checks if the token is valid for hydra
func (h *Handler) Verify(ctx context.Context, in *auth.VerifyTokenRequest, out *auth.VerifyTokenResponse) error {
	session := oauth2.NewSession("")

	tokenType, ar, err := oauth.GetRegistry().OAuth2Provider().IntrospectToken(ctx, in.GetToken(), fosite.AccessToken, session)
	if err != nil {
		return err
	}

	if tokenType != fosite.AccessToken {
		return errors.New("Only access tokens are allowed in the authorization header")
	}

	claims := ar.GetSession().(*oauth2.Session).IDTokenClaims()
	b, err := json.Marshal(claims)

	if err != nil {
		return err
	}

	out.Success = true
	out.Data = b

	return nil
}

// Exchange code for a proper token
func (h *Handler) Exchange(ctx context.Context, in *auth.ExchangeRequest, out *auth.ExchangeResponse) error {
	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", DefaultClientID)
	values.Set("grant_type", "authorization_code")
	values.Set("code", in.Code)
	values.Set("redirect_uri", DefaultRedirectURI)

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := oauth.GetRegistry().OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return err
	}

	resp, err := oauth.GetRegistry().OAuth2Provider().NewAccessResponse(ctx, ar)
	if err != nil {
		return err
	}

	out.AccessToken = resp.GetAccessToken()
	out.IDToken = resp.GetExtra("id_token").(string)
	out.RefreshToken = resp.GetExtra("refresh_token").(string)
	out.Expiry = resp.GetExtra("expires_in").(int64)

	return nil
}

// Refresh token
func (h *Handler) Refresh(ctx context.Context, in *auth.RefreshTokenRequest, out *auth.RefreshTokenResponse) error {
	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", DefaultClientID)
	values.Set("grant_type", "refresh_token")
	values.Set("refresh_token", in.RefreshToken)
	values.Set("redirect_uri", DefaultRedirectURI)

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := oauth.GetRegistry().OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return err
	}

	resp, err := oauth.GetRegistry().OAuth2Provider().NewAccessResponse(ctx, ar)
	if err != nil {
		return err
	}

	out.AccessToken = resp.GetAccessToken()
	// out.IDToken = resp.GetExtra("id_token").(string)
	out.RefreshToken = resp.GetExtra("refresh_token").(string)
	out.Expiry = resp.GetExtra("expires_in").(int64)

	return nil
}
