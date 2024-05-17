/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package hydra

import (
	"context"
	"time"

	"golang.org/x/oauth2"
	grpc2 "google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/auth"
)

type ConsentResponse struct {
	Challenge                    string   `json:"challenge"`
	Skip                         bool     `json:"skip"`
	Subject                      string   `json:"subject"`
	RequestedScope               []string `json:"requested_scope"`
	RequestedAccessTokenAudience []string `json:"requested_access_token_audience"`
}

type LogoutResponse struct {
	RequestURL  string `json:"request_url"`
	RPInitiated bool   `json:"rp_initiated"`
	SID         string `json:"sid"`
	Subject     string `json:"subject"`
}

type RedirectResponse struct {
	Challenge string `json:"challenge"`
}

type TokenResponse struct {
	IDToken      string `json:"id_token"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

func OAuthConn(ctx context.Context) grpc2.ClientConnInterface {
	return grpc.ResolveConn(ctx, common.ServiceOAuth)
}

func GetLogin(ctx context.Context, challenge string) (*auth.GetLoginResponse, error) {
	c := auth.NewLoginProviderClient(OAuthConn(ctx))
	resp, err := c.GetLogin(ctx, &auth.GetLoginRequest{
		Challenge: challenge,
	})
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func CreateLogin(ctx context.Context, clientID string, scopes, audiences []string) (*auth.ID, error) {
	c := auth.NewLoginProviderClient(OAuthConn(ctx))
	resp, err := c.CreateLogin(ctx, &auth.CreateLoginRequest{
		ClientID:  clientID,
		Scopes:    scopes,
		Audiences: audiences,
	})
	if err != nil {
		return nil, err
	}

	return resp.GetLogin(), nil
}

func AcceptLogin(ctx context.Context, challenge string, subject string) (*RedirectResponse, error) {
	c := auth.NewLoginProviderClient(OAuthConn(ctx))
	res, err := c.AcceptLogin(ctx, &auth.AcceptLoginRequest{
		Challenge: challenge,
		Subject:   subject,
	})
	if err != nil {
		return nil, err
	}

	return &RedirectResponse{Challenge: res.GetChallenge()}, nil
}

func CreateConsent(ctx context.Context, loginChallenge string) (*auth.ID, error) {

	//login, err := GetLogin(ctx, loginChallenge)
	//if err != nil {
	//	return nil, err
	//}

	c := auth.NewConsentProviderClient(OAuthConn(ctx))
	resp, err := c.CreateConsent(ctx, &auth.CreateConsentRequest{
		LoginChallenge: loginChallenge,
	})
	if err != nil {
		return nil, err
	}

	return resp.GetConsent(), nil
}

func AcceptConsent(ctx context.Context, challenge string, scopes, audiences []string, accessToken, idToken map[string]string) (*RedirectResponse, error) {
	c := auth.NewConsentProviderClient(OAuthConn(ctx))
	res, err := c.AcceptConsent(ctx, &auth.AcceptConsentRequest{
		Challenge:   challenge,
		Scopes:      scopes,
		Audiences:   audiences,
		AccessToken: accessToken,
		IDToken:     idToken,
	})
	if err != nil {
		return nil, err
	}

	return &RedirectResponse{Challenge: res.GetChallenge()}, nil
}

func CreateLogout(ctx context.Context, url, subject, sessionID string) (*auth.ID, error) {
	c := auth.NewLogoutProviderClient(OAuthConn(ctx))
	resp, err := c.CreateLogout(ctx, &auth.CreateLogoutRequest{
		RequestURL: url,
		Subject:    subject,
		SessionID:  sessionID,
	})
	if err != nil {
		return nil, err
	}

	return resp.GetLogout(), nil
}

func AcceptLogout(ctx context.Context, challenge string, accessToken string, refreshToken string) error {
	c := auth.NewLogoutProviderClient(OAuthConn(ctx))
	_, err := c.AcceptLogout(ctx, &auth.AcceptLogoutRequest{
		Challenge:    challenge,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
	if err != nil {
		return err
	}

	return nil
}

func CreateAuthCode(ctx context.Context, consent *auth.ID, clientID, redirectURI, codeChallenge, codeChallengeMethod string) (string, error) {
	c := auth.NewAuthCodeProviderClient(OAuthConn(ctx))
	resp, err := c.CreateAuthCode(ctx, &auth.CreateAuthCodeRequest{
		Consent:             consent,
		ClientID:            clientID,
		RedirectURI:         redirectURI,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
	})
	if err != nil {
		return "", err
	}

	return resp.Code, nil
}

func PasswordCredentialsToken(ctx context.Context, username, password string) (*oauth2.Token, error) {
	c := auth.NewPasswordCredentialsTokenClient(OAuthConn(ctx))
	resp, err := c.PasswordCredentialsToken(ctx, &auth.PasswordCredentialsTokenRequest{
		Username: username,
		Password: password,
	})
	if err != nil {
		return nil, err
	}

	token := &oauth2.Token{
		AccessToken:  resp.AccessToken,
		RefreshToken: resp.RefreshToken,
		Expiry:       time.Now().Add(time.Duration(resp.Expiry) * time.Second),
	}

	token = token.WithExtra(map[string]interface{}{
		"expires_in": resp.Expiry,
		"id_token":   resp.IDToken,
	})

	return token, nil
}

func Exchange(ctx context.Context, code string, verifier string) (*oauth2.Token, error) {

	c := auth.NewAuthCodeExchangerClient(OAuthConn(ctx))
	resp, err := c.Exchange(ctx, &auth.ExchangeRequest{
		Code:         code,
		CodeVerifier: verifier,
	})
	if err != nil {
		return nil, err
	}

	token := &oauth2.Token{
		AccessToken:  resp.AccessToken,
		RefreshToken: resp.RefreshToken,
		Expiry:       time.Now().Add(time.Duration(resp.Expiry) * time.Second),
	}

	token = token.WithExtra(map[string]interface{}{
		"expires_in": resp.Expiry,
		"id_token":   resp.IDToken,
	})

	return token, nil
}

func Refresh(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	c := auth.NewAuthTokenRefresherClient(OAuthConn(ctx))
	resp, err := c.Refresh(ctx, &auth.RefreshTokenRequest{
		RefreshToken: refreshToken,
	})
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		AccessToken:  resp.AccessToken,
		IDToken:      resp.IDToken,
		RefreshToken: resp.RefreshToken,
		ExpiresIn:    resp.Expiry,
	}, nil
}
