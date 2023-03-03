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
	"fmt"
	"github.com/pydio/cells/v4/common/auth/hydra"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/consent"
	"github.com/ory/hydra/oauth2"
	"github.com/ory/x/sqlxx"
	"github.com/ory/x/urlx"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	pauth "github.com/pydio/cells/v4/common/proto/auth"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// Handler for the plugin
type Handler struct {
	name string
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

func (h *Handler) Name() string {
	return h.name
}

func (h *Handler) LongVerifier() string {
	return strings.ReplaceAll(uuid.New()+uuid.New(), "-", "")
}

func (h *Handler) GetLogin(ctx context.Context, in *pauth.GetLoginRequest) (*pauth.GetLoginResponse, error) {
	req, err := auth.GetRegistry().ConsentManager().GetLoginRequest(ctx, in.Challenge)
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
	out.ClientID = req.Client.GetID()

	return out, nil
}

func (h *Handler) CreateLogin(ctx context.Context, in *pauth.CreateLoginRequest) (*pauth.CreateLoginResponse, error) {

	// Set up csrf/challenge/verifier values
	verifier := strings.Replace(uuid.New(), "-", "", -1)
	challenge := strings.Replace(uuid.New(), "-", "", -1)
	csrf := strings.Replace(uuid.New(), "-", "", -1)

	// Generate the request URL
	host, _ := servicecontext.HttpMetaFromGrpcContext(ctx, servicecontext.HttpMetaHost)
	provider := auth.GetConfigurationProvider(host)
	iu := urlx.AppendPaths(provider.GetProvider().IssuerURL(), provider.GetProvider().OAuth2AuthURL().Path)
	sessionID := uuid.New()

	if err := auth.GetRegistry().ConsentManager().CreateLoginSession(ctx, &consent.LoginSession{
		ID:              sessionID,
		Subject:         "",
		AuthenticatedAt: sqlxx.NullTime(time.Now().UTC()),
		Remember:        false,
	}); err != nil {
		return nil, err
	}

	client, err := auth.GetRegistry().ClientManager().GetConcreteClient(ctx, in.GetClientID())
	if err != nil {
		return nil, err
	}

	// Set the session
	if err := auth.GetRegistry().ConsentManager().CreateLoginRequest(
		ctx,
		&consent.LoginRequest{
			ID:                challenge,
			Verifier:          verifier,
			CSRF:              csrf,
			Skip:              false,
			RequestedScope:    in.GetScopes(),
			RequestedAudience: in.GetAudiences(),
			Subject:           "",
			Client:            client,
			RequestURL:        iu.String(),
			AuthenticatedAt:   sqlxx.NullTime{},
			RequestedAt:       time.Now().UTC(),
			SessionID:         sqlxx.NullString(sessionID),
		},
	); err != nil {
		return nil, errors.WithStack(err)
	}

	out := &pauth.CreateLoginResponse{}
	out.Login = &pauth.ID{
		Challenge: challenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return out, nil
}

func (h *Handler) AcceptLogin(ctx context.Context, in *pauth.AcceptLoginRequest) (*pauth.AcceptLoginResponse, error) {

	var p consent.HandledLoginRequest
	p.Subject = in.Subject
	p.ID = in.Challenge
	p.RequestedAt = time.Now().UTC()
	p.AuthenticatedAt = sqlxx.NullTime(p.RequestedAt)

	_, err := auth.GetRegistry().ConsentManager().HandleLoginRequest(ctx, in.Challenge, &p)
	if err != nil {
		return nil, err
	}

	return &pauth.AcceptLoginResponse{}, nil
}

func (h *Handler) GetConsent(ctx context.Context, in *pauth.GetConsentRequest) (*pauth.GetConsentResponse, error) {
	req, err := auth.GetRegistry().ConsentManager().GetConsentRequest(ctx, in.Challenge)
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

	// Set up csrf/challenge/verifier values
	verifier := strings.Replace(uuid.New(), "-", "", -1)
	challenge := strings.Replace(uuid.New(), "-", "", -1)
	csrf := strings.Replace(uuid.New(), "-", "", -1)

	login, err := auth.GetRegistry().ConsentManager().GetLoginRequest(ctx, in.LoginChallenge)
	if err != nil {
		return nil, err
	}

	client, err := auth.GetRegistry().ClientManager().GetConcreteClient(ctx, login.ClientID)
	if err != nil {
		return nil, err
	}
	session, err := auth.GetRegistry().ConsentManager().VerifyAndInvalidateLoginRequest(ctx, login.Verifier)
	if err != nil {
		return nil, err
	}

	if session.Error != nil && session.Error.IsError() {
		return nil, fmt.Errorf(session.Error.Name)
	}

	host, _ := servicecontext.HttpMetaFromGrpcContext(ctx, servicecontext.HttpMetaHost)
	if session.RequestedAt.Add(auth.GetConfigurationProvider(host).GetProvider().ConsentRequestMaxAge()).Before(time.Now()) {
		return nil, errors.WithStack(fosite.ErrRequestUnauthorized.WithDebug("The login request has expired, please try again."))
	}

	if err := auth.GetRegistry().ConsentManager().ConfirmLoginSession(ctx, session.LoginRequest.SessionID.String(), session.RequestedAt, session.Subject, session.Remember); err != nil {
		return nil, err
	}

	// Set the session
	if err := auth.GetRegistry().ConsentManager().CreateConsentRequest(
		ctx,
		&consent.ConsentRequest{
			ID:                challenge,
			Verifier:          verifier,
			CSRF:              csrf,
			Skip:              false,
			RequestedScope:    login.RequestedScope,
			RequestedAudience: login.RequestedAudience,
			Subject:           session.Subject,
			Client:            client,
			RequestURL:        login.RequestURL,
			LoginChallenge:    sqlxx.NullString(login.ID),
			LoginSessionID:    login.SessionID,
			AuthenticatedAt:   sqlxx.NullTime(time.Now().UTC()),
			RequestedAt:       time.Now().UTC(),
		},
	); err != nil {
		return nil, errors.WithStack(err)
	}

	out := &pauth.CreateConsentResponse{}
	out.Consent = &pauth.ID{
		Challenge: challenge,
		Verifier:  verifier,
		CSRF:      csrf,
	}

	return out, nil
}

func (h *Handler) AcceptConsent(ctx context.Context, in *pauth.AcceptConsentRequest) (*pauth.AcceptConsentResponse, error) {

	var p consent.HandledConsentRequest

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
	p.Session = consent.NewConsentRequestSessionData()
	p.Session.AccessToken = accessToken
	p.Session.IDToken = idToken
	p.GrantedScope = in.GetScopes()
	p.GrantedAudience = in.GetAudiences()

	_, err := auth.GetRegistry().ConsentManager().HandleConsentRequest(ctx, in.Challenge, &p)
	if err != nil {
		return nil, err
	}

	return &pauth.AcceptConsentResponse{}, nil
}

func (h *Handler) CreateAuthCode(ctx context.Context, in *pauth.CreateAuthCodeRequest) (*pauth.CreateAuthCodeResponse, error) {

	values := url.Values{}
	values.Set("client_id", in.GetClientID())
	values.Set("redirect_uri", in.GetRedirectURI())
	values.Set("response_type", "code")
	values.Set("consent_verifier", in.GetConsent().GetVerifier())
	values.Set("code_challenge", in.GetCodeChallenge())
	values.Set("code_challenge_method", in.GetCodeChallengeMethod())

	values.Set("state", uuid.New())

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	cookieSession, err := auth.GetRegistry().CookieStore().Get(req, "oauth2_consent_csrf")
	if err != nil {
		return nil, err
	}
	cookieSession.Values["csrf"] = in.GetConsent().GetCSRF()

	ar, err := auth.GetRegistry().OAuth2Provider().NewAuthorizeRequest(ctx, req)
	if err != nil {
		e := fosite.ErrorToRFC6749Error(err)
		log.Logger(ctx).Error("Could not create authorize request", zap.Error(e))
		return nil, err
	}

	session, err := auth.GetRegistry().ConsentStrategy().HandleOAuth2AuthorizationRequest(http.ResponseWriter(nil), req, ar)
	if errors.Cause(err) == consent.ErrAbortOAuth2Request {
		// do nothing
		return &pauth.CreateAuthCodeResponse{}, nil
	} else if err != nil {
		e := fosite.ErrorToRFC6749Error(err)
		log.Logger(ctx).Error("Could not handle authorize request", zap.Error(e))
		return nil, err
	}

	for _, scope := range session.GrantedScope {
		ar.GrantScope(scope)
	}

	for _, audience := range session.GrantedAudience {
		ar.GrantAudience(audience)
	}

	openIDKeyID, err := auth.GetRegistry().OpenIDJWTStrategy().GetPublicKeyID(ctx)
	if err != nil {
		return nil, err
	}

	var accessTokenKeyID string
	host, _ := servicecontext.HttpMetaFromGrpcContext(ctx, servicecontext.HttpMetaHost)
	configProvider := auth.GetConfigurationProvider(host)
	if configProvider.GetProvider().AccessTokenStrategy() == "jwt" {
		accessTokenKeyID, err = auth.GetRegistry().AccessTokenJWTStrategy().GetPublicKeyID(ctx)
		if err != nil {
			return nil, err
		}
	}

	ar.SetID(session.ID)

	claims := &jwt.IDTokenClaims{
		Subject:     session.ConsentRequest.SubjectIdentifier,
		Issuer:      strings.TrimRight(configProvider.GetProvider().IssuerURL().String(), "/") + "/",
		IssuedAt:    time.Now().UTC(),
		AuthTime:    time.Now().UTC(),
		RequestedAt: time.Now().UTC(),
		Extra:       session.Session.IDToken,
	}

	claims.Add("sid", session.ConsentRequest.LoginSessionID)

	// done
	response, err := auth.GetRegistry().OAuth2Provider().NewAuthorizeResponse(ctx, ar, &oauth2.Session{
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
	})

	if err != nil {
		e := fosite.ErrorToRFC6749Error(err)
		log.Logger(ctx).Error("Could not create authorize response", zap.Error(e), zap.String("debug", e.Debug()))
		return nil, err
	}

	return &pauth.CreateAuthCodeResponse{Code: response.GetCode()}, nil
}

func (h *Handler) CreateLogout(ctx context.Context, in *pauth.CreateLogoutRequest) (*pauth.CreateLogoutResponse, error) {

	challenge := strings.Replace(uuid.New(), "-", "", -1)
	host, _ := servicecontext.HttpMetaFromGrpcContext(ctx, servicecontext.HttpMetaHost)

	// Set the session
	if err := auth.GetRegistry().ConsentManager().CreateLogoutRequest(
		ctx,
		&consent.LogoutRequest{
			ID:          challenge,
			RequestURL:  in.RequestURL,
			Subject:     in.Subject,
			SessionID:   in.SessionID,
			Verifier:    uuid.New(),
			RPInitiated: false,

			PostLogoutRedirectURI: auth.GetConfigurationProvider(host).GetProvider().LogoutRedirectURL().String(),
		},
	); err != nil {
		return nil, errors.WithStack(err)
	}

	return &pauth.CreateLogoutResponse{Logout: &pauth.ID{Challenge: challenge}}, nil
}

func (h *Handler) AcceptLogout(ctx context.Context, in *pauth.AcceptLogoutRequest) (*pauth.AcceptLogoutResponse, error) {

	// Accept the logout
	logout, err := auth.GetRegistry().ConsentManager().AcceptLogoutRequest(ctx, in.GetChallenge())
	if err != nil {
		return nil, errors.WithStack(err)
	}

	// Validating directly the logout
	if _, err := auth.GetRegistry().ConsentManager().VerifyAndInvalidateLogoutRequest(ctx, logout.Verifier); err != nil {
		return nil, errors.WithStack(err)
	}

	if err := auth.GetRegistry().ConsentManager().DeleteLoginSession(ctx, logout.SessionID); err != nil {
		return nil, errors.WithStack(err)
	}

	accessSignature := auth.GetRegistrySQL().OAuth2HMACStrategy().AccessTokenSignature(in.GetAccessToken())
	refreshSignature := auth.GetRegistrySQL().OAuth2HMACStrategy().RefreshTokenSignature(in.GetRefreshToken())

	if err := auth.GetRegistry().OAuth2Storage().DeleteAccessTokenSession(ctx, accessSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	if err := auth.GetRegistry().OAuth2Storage().DeleteRefreshTokenSession(ctx, refreshSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	if err := auth.GetRegistry().OAuth2Storage().DeleteOpenIDConnectSession(ctx, refreshSignature); err != nil {
		return nil, errors.WithStack(err)
	}

	return &pauth.AcceptLogoutResponse{}, nil
}

// Verify checks if the token is valid for hydra
func (h *Handler) Verify(ctx context.Context, in *pauth.VerifyTokenRequest) (*pauth.VerifyTokenResponse, error) {
	session := oauth2.NewSession("")

	tokenType, ar, err := auth.GetRegistry().OAuth2Provider().IntrospectToken(ctx, in.GetToken(), fosite.AccessToken, session)
	if err != nil {
		return nil, err
	}

	if tokenType != fosite.AccessToken {
		return nil, errors.New("Only access tokens are allowed in the authorization header")
	}

	claims := ar.GetSession().(*oauth2.Session).IDTokenClaims()
	b, err := json.Marshal(claims)

	if err != nil {
		return nil, err
	}

	out := &pauth.VerifyTokenResponse{}
	out.Success = true
	out.Data = b

	return out, nil
}

func (h *Handler) PasswordCredentialsCode(ctx context.Context, in *pauth.PasswordCredentialsCodeRequest) (*pauth.PasswordCredentialsCodeResponse, error) {

	// Getting or creating challenge
	challenge := in.GetChallenge()
	if challenge == "" {
		if c, err := hydra.CreateLogin(ctx, config.DefaultOAuthClientID, []string{"openid", "profile", "offline"}, []string{}); err != nil {
			return nil, err
		} else {
			challenge = c.Challenge
		}
	}

	var identity auth.Identity
	var valid bool
	var err error

	connectors := auth.GetConnectors()
	source := ""
	for _, c := range connectors {
		cc, ok := c.Conn().(auth.PasswordConnector)
		if !ok {
			continue
		}

		// Creating a timeout for context
		loginctx, _ := context.WithTimeout(ctx, 5*time.Second)
		identity, valid, err = cc.Login(loginctx, auth.Scopes{}, in.GetUsername(), in.GetPassword())
		// Error means the user is unknwown to the system, we continue to the next round
		if err != nil {
			continue
		}

		// Invalid means we found the user but did not match the password
		if !valid {
			err = errors.New("password does not match")
			continue
		}

		source = c.Name()

		break
	}

	if err != nil {
		return nil, err
	}

	// Searching login challenge
	login, err := hydra.GetLogin(ctx, challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to get login ", zap.Error(err))
		return nil, err
	}

	// Accepting login challenge
	if _, err := hydra.AcceptLogin(ctx, challenge, identity.UserID); err != nil {
		log.Logger(ctx).Error("Failed to accept login ", zap.Error(err))
		return nil, err
	}

	// Creating consent
	consent, err := hydra.CreateConsent(ctx, challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to create consent ", zap.Error(err))
		return nil, err
	}

	// Accepting consent
	if _, err := hydra.AcceptConsent(
		ctx,
		consent.Challenge,
		login.GetRequestedScope(),
		login.GetRequestedAudience(),
		map[string]string{},
		map[string]string{
			"name":       identity.Username,
			"email":      identity.Email,
			"authSource": source,
		},
	); err != nil {
		log.Logger(ctx).Error("Failed to accept consent ", zap.Error(err))
		return nil, err
	}

	requestURL, err := url.Parse(login.GetRequestURL())
	if err != nil {
		return nil, err
	}

	requestURLValues := requestURL.Query()

	redirectURL, err := auth.GetRedirectURIFromRequestValues(requestURLValues)
	if err != nil {
		return nil, err
	}

	code, err := hydra.CreateAuthCode(ctx, consent, login.GetClientID(), redirectURL, requestURLValues.Get("code_challenge"), requestURLValues.Get("code_challenge_method"))
	if err != nil {
		log.Logger(ctx).Error("Failed to create auth code ", zap.Error(err))
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	out := &pauth.PasswordCredentialsCodeResponse{
		Code: code,
	}

	return out, err
}

// PasswordCredentialsToken validates the login information and generates a token
func (h *Handler) PasswordCredentialsToken(ctx context.Context, in *pauth.PasswordCredentialsTokenRequest) (*pauth.PasswordCredentialsTokenResponse, error) {

	codeResp, err := h.PasswordCredentialsCode(ctx, &pauth.PasswordCredentialsCodeRequest{
		Username: in.GetUsername(),
		Password: in.GetPassword(),
	})
	if err != nil {
		return nil, err
	}

	tokenResp, err := h.Exchange(ctx, &pauth.ExchangeRequest{
		Code: codeResp.GetCode(),
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
	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", config.DefaultOAuthClientID)
	values.Set("grant_type", "authorization_code")
	values.Set("code", in.Code)
	values.Set("code_verifier", in.CodeVerifier)
	values.Set("redirect_uri", config.GetDefaultSiteURL()+"/auth/callback")

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := auth.GetRegistry().OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return nil, err
	}

	resp, err := auth.GetRegistry().OAuth2Provider().NewAccessResponse(ctx, ar)
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
	session := oauth2.NewSession("")

	values := url.Values{}
	values.Set("client_id", config.DefaultOAuthClientID)
	values.Set("grant_type", "refresh_token")
	values.Set("refresh_token", in.RefreshToken)
	values.Set("response_type", "id_token token")
	values.Set("redirect_uri", config.GetDefaultSiteURL()+"/auth/callback")

	req, err := http.NewRequest("POST", "", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	ar, err := auth.GetRegistry().OAuth2Provider().NewAccessRequest(ctx, req, session)
	if err != nil {
		return nil, err
	}

	resp, err := auth.GetRegistry().OAuth2Provider().NewAccessResponse(ctx, ar)
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

	accessSignature := auth.GetRegistrySQL().OAuth2HMACStrategy().AccessTokenSignature(in.GetToken().GetAccessToken())
	refreshSignature := auth.GetRegistrySQL().OAuth2HMACStrategy().RefreshTokenSignature(in.GetToken().GetRefreshToken())

	accessTokenSession, err := auth.GetRegistry().OAuth2Storage().GetAccessTokenSession(ctx, accessSignature, nil)
	if err != nil {
		return nil, err
	}

	refreshTokenSession, err := auth.GetRegistry().OAuth2Storage().GetRefreshTokenSession(ctx, refreshSignature, nil)
	if err != nil {
		return nil, err
	}

	if err := auth.GetRegistry().OAuth2Storage().RevokeAccessToken(ctx, accessTokenSession.GetID()); err != nil {
		return nil, err
	}

	if err := auth.GetRegistry().OAuth2Storage().RevokeRefreshToken(ctx, refreshTokenSession.GetID()); err != nil {
		return nil, err
	}

	return &pauth.RevokeTokenResponse{}, nil

}

// PruneTokens garbage collect expired IdTokens and Tokens
func (h *Handler) PruneTokens(ctx context.Context, in *pauth.PruneTokensRequest) (*pauth.PruneTokensResponse, error) {

	storage := auth.GetRegistry().OAuth2Storage()
	err := storage.FlushInactiveAccessTokens(ctx, time.Now(), 1000, 100)
	if err != nil {
		return nil, err
	}

	err = storage.FlushInactiveLoginConsentRequests(ctx, time.Now(), 1000, 100)
	if err != nil {
		return nil, err
	}

	// Flush inactive refresh tokens older than 3 months
	err = storage.FlushInactiveRefreshTokens(ctx, time.Now().Add(-90*24*time.Hour), 1000, 100)
	if err != nil {
		return nil, err
	}

	return &pauth.PruneTokensResponse{}, nil
}
