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
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/v2/client"
	"github.com/ory/hydra/v2/consent"
	"github.com/ory/hydra/v2/flow"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/ory/hydra/v2/oauth2/flowctx"
	"github.com/ory/x/errorsx"
	"github.com/ory/x/sqlxx"
	"github.com/ory/x/urlx"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/middleware/keys"
	pauth "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/runtime/manager"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/oauth"
)

func NewOAuthGRPCHandler() *Handler {
	return &Handler{}
}

// Handler for the plugin
type Handler struct {
	pauth.UnimplementedLoginProviderServer
	pauth.UnimplementedConsentProviderServer
	pauth.UnimplementedAuthCodeProviderServer
	pauth.UnimplementedAuthCodeExchangerServer
	pauth.UnimplementedAuthTokenRevokerServer
	pauth.UnimplementedAuthTokenVerifierServer
	pauth.UnimplementedAuthTokenRefresherServer
	pauth.UnimplementedAuthTokenPrunerServer
	pauth.UnimplementedPasswordCredentialsTokenServer
	pauth.UnimplementedLogoutProviderServer
	pauth.UnimplementedPasswordCredentialsCodeServer
}

var (
	_ pauth.LoginProviderServer      = (*Handler)(nil)
	_ pauth.ConsentProviderServer    = (*Handler)(nil)
	_ pauth.AuthCodeProviderServer   = (*Handler)(nil)
	_ pauth.AuthCodeExchangerServer  = (*Handler)(nil)
	_ pauth.AuthTokenVerifierServer  = (*Handler)(nil)
	_ pauth.AuthTokenRefresherServer = (*Handler)(nil)
	_ pauth.AuthTokenRevokerServer   = (*Handler)(nil)
)

func (h *Handler) makeUUID(long bool) string {
	if long {
		return strings.ReplaceAll(uuid.New()+uuid.New(), "-", "")
	} else {
		return strings.ReplaceAll(uuid.New(), "-", "")
	}
}

func (h *Handler) GetLogin(ctx context.Context, in *pauth.GetLoginRequest) (*pauth.GetLoginResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	req, err := reg.ConsentManager().GetLoginRequest(ctx, in.Challenge)
	if err != nil {
		return nil, err
	}
	out := &pauth.GetLoginResponse{}
	out.Challenge = req.ID
	out.SessionID = req.SessionID.String()
	out.RequestURL = req.RequestURL
	out.Subject = req.Subject
	out.RequestedScope = req.RequestedScope
	out.RequestedAudience = req.RequestedAudience
	out.ClientID = req.ClientID
	if req.Client != nil {
		out.ClientID = req.Client.GetID()
	}

	return out, nil
}

func (h *Handler) CreateLogin(ctx context.Context, in *pauth.CreateLoginRequest) (*pauth.CreateLoginResponse, error) {

	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	// Set up csrf/challenge/verifier values
	verifier := h.makeUUID(false)
	csrf := h.makeUUID(false)

	f, err := h.createLoginFlow(ctx, reg, in, verifier, csrf)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	loginChallenge, err := f.ToLoginChallenge(ctx, reg)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	out := &pauth.CreateLoginResponse{}
	out.Login = &pauth.ID{
		Challenge: loginChallenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return out, nil
}

func (h *Handler) AcceptLogin(ctx context.Context, in *pauth.AcceptLoginRequest) (*pauth.AcceptLoginResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	var p flow.HandledLoginRequest
	p.Subject = in.Subject
	p.ID = in.Challenge
	p.RequestedAt = time.Now().UTC()
	p.AuthenticatedAt = sqlxx.NullTime(p.RequestedAt)

	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), in.Challenge, flowctx.AsLoginChallenge)
	if err != nil {
		return nil, err
	}

	if _, err := reg.ConsentManager().HandleLoginRequest(ctx, f, in.Challenge, &p); err != nil {
		return nil, err
	}

	challenge, err := f.ToLoginVerifier(ctx, reg)
	if err != nil {
		return nil, err
	}

	return &pauth.AcceptLoginResponse{
		Challenge: challenge,
	}, nil
}

func (h *Handler) GetConsent(ctx context.Context, in *pauth.GetConsentRequest) (*pauth.GetConsentResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	req, err := reg.ConsentManager().GetConsentRequest(ctx, in.Challenge)
	if err != nil {
		return nil, err
	}
	out := &pauth.GetConsentResponse{}

	out.Challenge = req.ID
	out.LoginSessionID = req.LoginSessionID.String()
	out.Subject = req.Subject
	out.SubjectIdentifier = req.Subject
	out.ClientID = req.ClientID

	return out, nil
}

func (h *Handler) CreateConsent(ctx context.Context, in *pauth.CreateConsentRequest) (*pauth.CreateConsentResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	// We decode the flow from the cookie again because VerifyAndInvalidateLoginRequest does not return the flow
	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), in.LoginChallenge, flowctx.AsLoginVerifier)
	if err != nil {
		return nil, errors.WithMessagef(errors.StatusUnauthorized, "Login verifier is invalid: %v", err)
	}

	// Set up csrf/challenge/verifier values
	verifier := h.makeUUID(false)
	challenge := h.makeUUID(false)
	csrf := h.makeUUID(false)

	//login, err := reg.ConsentManager().GetLoginRequest(ctx, in.LoginChallenge)
	//if err != nil {
	//	return nil, err
	//}
	//
	//// Checking the client exists
	//if _, err := reg.ClientManager().GetConcreteClient(ctx, login.ClientID); err != nil {
	//	return nil, err
	//}

	session, err := reg.ConsentManager().VerifyAndInvalidateLoginRequest(ctx, in.LoginChallenge)
	if err != nil {
		return nil, err
	}

	if session.Error != nil && session.Error.IsError() {
		return nil, fmt.Errorf(session.Error.Name)
	}

	if session.RequestedAt.Add(reg.Config().ConsentRequestMaxAge(ctx)).Before(time.Now()) {
		return nil, errors.WithStack(fosite.ErrRequestUnauthorized.WithDebug("The login request has expired, please try again."))
	}

	if err := reg.ConsentManager().ConfirmLoginSession(ctx, &flow.LoginSession{
		ID:       session.LoginRequest.SessionID.String(),
		Subject:  session.Subject,
		Remember: session.Remember,
	}); err != nil {
		return nil, err
	}

	as := f.GetHandledLoginRequest()

	// Set the session
	if err := reg.ConsentManager().CreateConsentRequest(
		ctx,
		f,
		&flow.OAuth2ConsentRequest{
			ID:                     challenge,
			Verifier:               verifier,
			CSRF:                   csrf,
			Skip:                   false,
			RequestedScope:         f.RequestedScope,
			RequestedAudience:      f.RequestedAudience,
			Subject:                session.Subject,
			ClientID:               f.ClientID,
			RequestURL:             as.LoginRequest.RequestURL,
			AuthenticatedAt:        as.AuthenticatedAt,
			RequestedAt:            as.RequestedAt,
			ForceSubjectIdentifier: as.ForceSubjectIdentifier,
			OpenIDConnectContext:   as.LoginRequest.OpenIDConnectContext,
			LoginSessionID:         as.LoginRequest.SessionID,
			LoginChallenge:         sqlxx.NullString(as.LoginRequest.ID),
			Context:                as.Context,
		},
	); err != nil {
		return nil, errors.WithStack(err)
	}

	consentChallenge, err := f.ToConsentChallenge(ctx, reg)
	if err != nil {
		return nil, err
	}

	out := &pauth.CreateConsentResponse{}
	out.Consent = &pauth.ID{
		Challenge: consentChallenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return out, nil
}

func (h *Handler) AcceptConsent(ctx context.Context, in *pauth.AcceptConsentRequest) (*pauth.AcceptConsentResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	var p flow.AcceptOAuth2ConsentRequest

	// We decode the flow here once again because VerifyAndInvalidateConsentRequest does not return the flow
	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), in.GetChallenge(), flowctx.AsConsentChallenge)
	if err != nil {
		return nil, errorsx.WithStack(fosite.ErrAccessDenied.WithHint("The consent verifier has already been used, has not been granted, or is invalid."))
	}

	accessToken := make(map[string]interface{})
	idToken := make(map[string]interface{})

	for k, v := range in.GetAccessToken() {
		accessToken[k] = v
	}

	for k, v := range in.GetIDToken() {
		idToken[k] = v
	}

	p.ID = in.Challenge
	p.RequestedAt = time.Now().UTC()
	p.AuthenticatedAt = sqlxx.NullTime(p.RequestedAt)
	p.Session = flow.NewConsentRequestSessionData()
	p.Session.AccessToken = accessToken
	p.Session.IDToken = idToken
	p.GrantedScope = in.GetScopes()
	p.GrantedAudience = in.GetAudiences()
	p.HandledAt = sqlxx.NullTime(time.Now().UTC())

	if _, err := reg.ConsentManager().HandleConsentRequest(ctx, f, &p); err != nil {
		return nil, err
	}

	challenge, err := f.ToConsentVerifier(ctx, reg)
	if err != nil {
		return nil, err
	}
	return &pauth.AcceptConsentResponse{
		Challenge: challenge,
	}, nil
}

func (h *Handler) CreateAuthCode(ctx context.Context, in *pauth.CreateAuthCodeRequest) (*pauth.CreateAuthCodeResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	host, _ := middleware.HttpMetaFromGrpcContext(ctx, keys.HttpMetaHost)

	values := url.Values{}
	values.Set("client_id", in.GetClientID())
	values.Set("redirect_uri", in.GetRedirectURI())
	values.Set("response_type", "code")
	values.Set("consent_verifier", in.GetConsent().GetChallenge())
	values.Set("state", uuid.New())

	req, err := http.NewRequestWithContext(ctx, "POST", "http://"+host, strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}

	query := req.URL.Query()
	query.Set("client_id", in.GetClientID())
	query.Set("redirect_uri", in.GetRedirectURI())
	query.Set("response_type", "code")
	query.Set("consent_verifier", in.GetConsent().GetChallenge())
	query.Set("state", uuid.New())

	req.URL.RawQuery = query.Encode()

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := reg.OAuth2Provider().NewAuthorizeRequest(ctx, req)
	if err != nil {
		return nil, errors.WithMessage(err, "while trying to create authorize request")
	}

	cookieStore, err := reg.CookieStore(ctx)
	if err != nil {
		return nil, err
	}

	cl := ar.GetClient().(*client.Client)
	clientSpecificCookieNameConsentCSRF := fmt.Sprintf("%s_%s", reg.Config().CookieNameConsentCSRF(ctx), cl.CookieSuffix())

	cookieSession, err := cookieStore.Get(req, clientSpecificCookieNameConsentCSRF)
	if err != nil {
		return nil, err
	}
	cookieSession.Values["csrf"] = in.GetConsent().GetCSRF()

	session, f, err := reg.ConsentStrategy().HandleOAuth2AuthorizationRequest(ctx, http.ResponseWriter(nil), req, ar)
	if errors.Is(err, consent.ErrAbortOAuth2Request) {
		// do nothing
		return &pauth.CreateAuthCodeResponse{}, nil
	} else if err != nil {
		return nil, errors.WithMessage(err, "while trying to authorize request")
	}

	for _, scope := range session.GrantedScope {
		ar.GrantScope(scope)
	}

	for _, audience := range session.GrantedAudience {
		ar.GrantAudience(audience)
	}

	openIDKeyID, err := reg.OpenIDJWTStrategy().GetPublicKeyID(ctx)
	if err != nil {
		return nil, err
	}

	var accessTokenKeyID string

	if reg.Config().AccessTokenStrategy(ctx) == "jwt" {
		accessTokenKeyID, err = reg.AccessTokenJWTStrategy().GetPublicKeyID(ctx)
		if err != nil {
			return nil, err
		}
	}

	ar.SetID(session.ID)

	claims := &jwt.IDTokenClaims{
		Subject:     session.ConsentRequest.Subject,
		Issuer:      strings.TrimRight(reg.Config().IssuerURL(ctx).String(), "/") + "/",
		IssuedAt:    time.Now().UTC(),
		AuthTime:    time.Now().UTC(),
		RequestedAt: time.Now().UTC(),
		Extra:       session.Session.IDToken,
	}

	claims.Add("sid", session.ConsentRequest.LoginSessionID)

	// done
	response, err := reg.OAuth2Provider().NewAuthorizeResponse(ctx, ar, &oauth2.Session{
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
		ConsentChallenge: session.ID,
		Flow:             f,
	})

	if err != nil {
		return nil, errors.WithMessage(err, "while trying to authorize response")
	}

	return &pauth.CreateAuthCodeResponse{Code: response.GetCode()}, nil
}

func (h *Handler) CreateLogout(ctx context.Context, in *pauth.CreateLogoutRequest) (*pauth.CreateLogoutResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	challenge := h.makeUUID(false)

	// Set the session
	if err := reg.ConsentManager().CreateLogoutRequest(
		ctx,
		&flow.LogoutRequest{
			ID:          challenge,
			RequestURL:  in.RequestURL,
			Subject:     in.Subject,
			SessionID:   in.SessionID,
			Verifier:    uuid.New(),
			RPInitiated: false,

			PostLogoutRedirectURI: reg.Config().LogoutRedirectURL(ctx).String(),
		},
	); err != nil {
		return nil, errors.WithStack(err)
	}

	return &pauth.CreateLogoutResponse{Logout: &pauth.ID{Challenge: challenge}}, nil
}

func (h *Handler) AcceptLogout(ctx context.Context, in *pauth.AcceptLogoutRequest) (*pauth.AcceptLogoutResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	// Accept the logout
	logout, err := reg.ConsentManager().AcceptLogoutRequest(ctx, in.GetChallenge())
	if err != nil {
		return nil, errors.WithStack(err)
	}

	// Validating directly the logout
	if _, err := reg.ConsentManager().VerifyAndInvalidateLogoutRequest(ctx, logout.Verifier); err != nil {
		return nil, errors.WithStack(err)
	}

	if _, err := reg.ConsentManager().DeleteLoginSession(ctx, logout.SessionID); err != nil {
		return nil, errors.WithStack(err)
	}

	accessSignature := reg.OAuth2HMACStrategy().AccessTokenSignature(ctx, in.GetAccessToken())
	refreshSignature := reg.OAuth2HMACStrategy().RefreshTokenSignature(ctx, in.GetRefreshToken())

	if err := reg.OAuth2Storage().DeleteAccessTokenSession(ctx, accessSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	if err := reg.OAuth2Storage().DeleteRefreshTokenSession(ctx, refreshSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	if err := reg.OAuth2Storage().DeleteOpenIDConnectSession(ctx, refreshSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	return &pauth.AcceptLogoutResponse{}, nil
}

// Verify checks if the token is valid for hydra
func (h *Handler) Verify(ctx context.Context, in *pauth.VerifyTokenRequest) (*pauth.VerifyTokenResponse, error) {
	span := trace.SpanFromContext(ctx)
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}
	span.AddEvent("Registry Resolved")

	session := oauth2.NewSession("")
	span.AddEvent("Session Created")

	tokenType, ar, err := reg.OAuth2Provider().IntrospectToken(ctx, in.GetToken(), fosite.AccessToken, session)
	if err != nil {
		return nil, errors.Tag(err, errors.InvalidIDToken)
	}

	span.AddEvent("Token Validated")

	if tokenType != fosite.AccessToken {
		return nil, errors.WithMessage(errors.InvalidIDToken, "only access tokens are allowed in the authorization header")
	}

	claims := ar.GetSession().(*oauth2.Session).IDTokenClaims()
	b, err := json.Marshal(claims)

	if err != nil {
		return nil, errors.Tag(errors.InvalidIDToken, err)
	}

	out := &pauth.VerifyTokenResponse{}
	out.Success = true
	out.Data = b

	return out, nil
}

// PasswordCredentialsCode validates the code information and generates a token
func (h *Handler) PasswordCredentialsCode(ctx context.Context, in *pauth.PasswordCredentialsCodeRequest) (*pauth.PasswordCredentialsCodeResponse, error) {

	reg, er := manager.Resolve[oauth.Registry](ctx)
	if er != nil {
		return nil, er
	}

	// Getting or creating challenge
	challenge := in.GetChallenge()
	var requestedScope, requestedAudience []string
	var requestURL, clientID string
	if challenge == "" {
		verif := h.makeUUID(false)
		csrf := h.makeUUID(false)
		f, er := h.createLoginFlow(ctx, reg, &pauth.CreateLoginRequest{
			ClientID:  config.DefaultOAuthClientID,
			Scopes:    []string{"openid", "profile", "offline"},
			Audiences: []string{},
		}, verif, csrf)
		if er != nil {
			return nil, er
		}
		challenge, _ = f.ToLoginChallenge(ctx, reg)
		requestedAudience = f.RequestedAudience
		requestedScope = f.RequestedScope
		requestURL = f.RequestURL
		clientID = f.ClientID
	} else {
		req, err := reg.ConsentManager().GetLoginRequest(ctx, challenge)
		if err != nil {
			return nil, err
		}
		requestURL = req.RequestURL
		requestedScope = req.RequestedScope
		requestedAudience = req.RequestedAudience
		clientID = req.Client.GetID()
	}

	code, err := h.loginToCode(ctx, challenge, in.GetUsername(), in.GetPassword(), requestedScope, requestedAudience, requestURL, clientID)
	if err != nil {
		return nil, errors.WithMessage(err, "while creating auth code")
	}
	out := &pauth.PasswordCredentialsCodeResponse{
		Code: code,
	}
	return out, err

}

// PasswordCredentialsToken validates the login information and generates a token
func (h *Handler) PasswordCredentialsToken(ctx context.Context, in *pauth.PasswordCredentialsTokenRequest) (*pauth.PasswordCredentialsTokenResponse, error) {

	reg, err := manager.Resolve[oauth.Registry](ctx)
	verif := h.makeUUID(false)
	csrf := h.makeUUID(false)

	// Getting or creating challenge
	f, err := h.createLoginFlow(ctx, reg, &pauth.CreateLoginRequest{
		ClientID:  config.DefaultOAuthClientID,
		Scopes:    []string{"openid", "profile", "offline"},
		Audiences: []string{},
	}, verif, csrf)
	if err != nil {
		return nil, errors.WithMessage(err, "while trying to CreateLogin")
	}

	// Get login challenge
	challenge, err := f.ToLoginChallenge(ctx, reg)
	if err != nil {
		return nil, errors.WithMessage(err, "while trying to GetLogin")
	}

	clientID := f.ClientID
	if f.Client != nil {
		clientID = f.Client.GetID()
	}
	code, err := h.loginToCode(ctx, challenge, in.GetUsername(), in.GetPassword(), f.RequestedScope, f.RequestedAudience, f.RequestURL, clientID)

	tokenResp, err := h.Exchange(ctx, &pauth.ExchangeRequest{
		Code:         code,
		CodeVerifier: verif,
	})
	if err != nil {
		return nil, err
	}

	out := &pauth.PasswordCredentialsTokenResponse{
		AccessToken:  tokenResp.GetAccessToken(),
		IDToken:      tokenResp.GetIDToken(),
		RefreshToken: tokenResp.GetRefreshToken(),
		Expiry:       tokenResp.GetExpiry(),
	}

	return out, nil
}

// Exchange code for a proper token
func (h *Handler) Exchange(ctx context.Context, in *pauth.ExchangeRequest) (*pauth.ExchangeResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", config.DefaultOAuthClientID)
	values.Set("grant_type", "authorization_code")
	values.Set("code", in.Code)
	values.Set("code_verifier", "")
	values.Set("redirect_uri", routing.GetDefaultSiteURL(ctx)+"/auth/callback")

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := reg.OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return nil, err
	}

	resp, err := reg.OAuth2Provider().NewAccessResponse(ctx, ar)
	if err != nil {
		return nil, err
	}

	out := &pauth.ExchangeResponse{}
	out.AccessToken = resp.GetAccessToken()
	out.IDToken = resp.GetExtra("id_token").(string)
	out.RefreshToken = resp.GetExtra("refresh_token").(string)
	out.Expiry = resp.GetExtra("expires_in").(int64)

	return out, nil
}

// Refresh token
func (h *Handler) Refresh(ctx context.Context, in *pauth.RefreshTokenRequest) (*pauth.RefreshTokenResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", config.DefaultOAuthClientID)
	values.Set("grant_type", "refresh_token")
	values.Set("refresh_token", in.RefreshToken)
	values.Set("response_type", "id_token token")
	values.Set("redirect_uri", routing.GetDefaultSiteURL(ctx)+"/auth/callback")

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := reg.OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return nil, err
	}

	resp, err := reg.OAuth2Provider().NewAccessResponse(ctx, ar)
	if err != nil {
		return nil, err
	}

	out := &pauth.RefreshTokenResponse{}
	out.AccessToken = resp.GetAccessToken()
	out.IDToken = resp.GetExtra("id_token").(string)
	out.RefreshToken = resp.GetExtra("refresh_token").(string)
	out.Expiry = resp.GetExtra("expires_in").(int64)

	return out, nil
}

// Revoke adds token to revocation list and eventually clear RefreshToken as well (directly inside Dex)
func (h *Handler) Revoke(ctx context.Context, in *pauth.RevokeTokenRequest) (*pauth.RevokeTokenResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	accessSignature := reg.OAuth2HMACStrategy().AccessTokenSignature(ctx, in.GetToken().GetAccessToken())
	refreshSignature := reg.OAuth2HMACStrategy().RefreshTokenSignature(ctx, in.GetToken().GetRefreshToken())

	accessTokenSession, err := reg.OAuth2Storage().GetAccessTokenSession(ctx, accessSignature, nil)
	if err != nil {
		return nil, err
	}

	refreshTokenSession, err := reg.OAuth2Storage().GetRefreshTokenSession(ctx, refreshSignature, nil)
	if err != nil {
		return nil, err
	}

	if err := reg.OAuth2Storage().RevokeAccessToken(ctx, accessTokenSession.GetID()); err != nil {
		return nil, err
	}

	if err := reg.OAuth2Storage().RevokeRefreshToken(ctx, refreshTokenSession.GetID()); err != nil {
		return nil, err
	}

	return &pauth.RevokeTokenResponse{}, nil

}

// PruneTokens garbage collect expired IdTokens and Tokens
func (h *Handler) PruneTokens(ctx context.Context, in *pauth.PruneTokensRequest) (*pauth.PruneTokensResponse, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	storage := reg.OAuth2Storage()
	// internal will recheck config.GetAccessTokenLifespan
	if err = storage.FlushInactiveAccessTokens(ctx, time.Now().Add(-1*time.Hour), 1000, 100); err != nil {
		return nil, err
	}

	if err = storage.FlushInactiveLoginConsentRequests(ctx, time.Now().Add(-1*time.Hour), 1000, 100); err != nil {
		return nil, err
	}

	// Flush inactive refresh tokens older than 3 months
	if err = storage.FlushInactiveRefreshTokens(ctx, time.Now().Add(-90*24*time.Hour), 1000, 100); err != nil {
		return nil, err
	}

	// Return -1 as "unknown count"
	return &pauth.PruneTokensResponse{Count: -1}, nil
}

// INTERNAL

func (h *Handler) createLoginFlow(ctx context.Context, reg oauth.Registry, in *pauth.CreateLoginRequest, verifier, csrf string) (*flow.Flow, error) {
	reg, err := manager.Resolve[oauth.Registry](ctx)
	if err != nil {
		return nil, err
	}

	// Set up csrf/challenge/verifier values
	challenge := h.makeUUID(false)

	// Generate the request URL
	iu := urlx.AppendPaths(reg.Config().IssuerURL(ctx), reg.Config().OAuth2AuthURL(ctx).Path)
	sessionID := uuid.New()

	if err := reg.ConsentManager().CreateLoginSession(ctx, &flow.LoginSession{
		ID:              sessionID,
		Subject:         "",
		AuthenticatedAt: sqlxx.NullTime(time.Now().UTC()),
		Remember:        false,
	}); err != nil {
		return nil, err
	}

	// Checking the client exists
	cl, err := reg.ClientManager().GetConcreteClient(ctx, in.GetClientID())
	if err != nil {
		return nil, err
	}

	// Set the session
	return reg.ConsentManager().CreateLoginRequest(
		ctx,
		&flow.LoginRequest{
			ID:                challenge,
			Verifier:          verifier,
			CSRF:              csrf,
			Skip:              false,
			RequestedScope:    in.GetScopes(),
			RequestedAudience: in.GetAudiences(),
			Subject:           "",
			ClientID:          in.GetClientID(),
			Client:            cl,
			RequestURL:        iu.String(),
			AuthenticatedAt:   sqlxx.NullTime{},
			RequestedAt:       time.Now().UTC(),
			SessionID:         sqlxx.NullString(sessionID),
		},
	)

}

// rangePasswordConnectors ranges over connectors to identify user
func (h *Handler) rangePasswordConnectors(ctx context.Context, username, password string) (identity auth.Identity, source string, err error) {

	var valid bool
	attempt := 0
	reg, er := manager.Resolve[oauth.Registry](ctx)
	if er != nil {
		err = er
		return
	}

	for _, c := range reg.Connectors(ctx) {
		cc, ok := c.Conn().(auth.PasswordConnector)
		if !ok {
			continue
		}

		attempt++
		loginCtx, can := context.WithTimeout(ctx, 5*time.Second)
		defer can()
		identity, valid, err = cc.Login(loginCtx, auth.Scopes{}, username, password)
		if valid {
			source = c.Name()
			break
		}
	}

	if attempt == 0 {
		err = errors.WithMessage(errors.StatusInternalServerError, "No password connector found")
		return
	}
	if !valid {
		if err == nil {
			err = errors.WithMessage(errors.StatusUnauthorized, "no connector could validate connexion")
		}
		return
	}

	return

}

// loginToCode mimicks a full password identification, login+challenge validation, consent creation/acceptation and finally a code
func (h *Handler) loginToCode(ctx context.Context, challenge, username, password string, requestedScope, requestedAudience []string, requestURL, clientID string) (string, error) {

	// Range PasswordConnectors
	identity, source, err := h.rangePasswordConnectors(ctx, username, password)
	if err != nil {
		return "", err
	}

	// Accepting login challenge
	verifyLogin, err := h.AcceptLogin(ctx, &pauth.AcceptLoginRequest{Challenge: challenge, Subject: identity.UserID})
	if err != nil {
		return "", errors.WithMessage(err, "while trying to AcceptLogin")
	}

	// Creating consent
	cstResp, err := h.CreateConsent(ctx, &pauth.CreateConsentRequest{LoginChallenge: verifyLogin.Challenge})
	if err != nil {
		return "", errors.WithMessage(err, "while creating consent")
	}
	cst := cstResp.GetConsent()

	// Accepting consent
	acceptResp, err := h.AcceptConsent(ctx, &pauth.AcceptConsentRequest{
		Challenge:   cst.Challenge,
		Scopes:      requestedScope,
		Audiences:   requestedAudience,
		AccessToken: map[string]string{},
		IDToken: map[string]string{
			"name":       identity.Username,
			"email":      identity.Email,
			"authSource": source,
		},
	})
	if err != nil {
		return "", errors.WithMessage(err, "while accepting consent")
	}
	cst.Challenge = acceptResp.GetChallenge()

	parsedURL, err := url.Parse(requestURL)
	if err != nil {
		return "", err
	}

	requestURLValues := parsedURL.Query()

	redirectURL, err := oauth.GetRedirectURIFromRequestValues(requestURLValues)
	if err != nil {
		return "", err
	}

	verifier := cst.Challenge // Must be > 43 characters
	hash := sha256.New()
	if _, err = hash.Write([]byte(verifier)); err != nil {
		return "", err
	}

	codeChallenge := base64.RawURLEncoding.EncodeToString(hash.Sum([]byte{}))
	codeChallengeMethod := "S256"

	codeResponse, err := h.CreateAuthCode(ctx, &pauth.CreateAuthCodeRequest{
		Consent:             cst,
		ClientID:            clientID,
		RedirectURI:         redirectURL,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
	})
	if err != nil {
		return "", errors.WithMessage(err, "while creating auth code")
	}

	return codeResponse.GetCode(), nil
}
