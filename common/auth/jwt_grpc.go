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

package auth

import (
	"context"
	"net/url"

	"github.com/mitchellh/mapstructure"
	"github.com/ory/fosite/token/jwt"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/auth/hydra"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/auth"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type grpcVerifier struct {
	RuntimeCtx context.Context
	service    string
}

func (p *grpcVerifier) GetType() ProviderType {
	return ProviderTypePAT
}

func (p *grpcVerifier) Verify(ctx context.Context, rawIDToken string) (IDToken, error) {

	cli := auth.NewAuthTokenVerifierClient(grpc.ResolveConn(ctx, p.service))

	resp, err := cli.Verify(ctx, &auth.VerifyTokenRequest{
		Token: rawIDToken,
	})
	if err != nil {
		return nil, err
	}

	token := new(grpcToken)

	if err := json.Unmarshal(resp.GetData(), &token.claims); err != nil {
		return nil, err
	}

	return token, nil
}

type grpcProvider struct {
	grpcVerifier
}

func (p *grpcProvider) GetType() ProviderType {
	return ProviderTypeGrpc
}

// PasswordCredentialsToken forwards the call to gRPC service
func (p *grpcProvider) PasswordCredentialsToken(ctx context.Context, userName string, password string) (*oauth2.Token, error) {
	return hydra.PasswordCredentialsToken(ctx, userName, password)
}

// PasswordCredentialsCode forwards the call to gRPC service
func (p *grpcProvider) PasswordCredentialsCode(ctx context.Context, userName string, password string, opts ...TokenOption) (string, error) {
	v := url.Values{}
	for _, opt := range opts {
		opt.SetValue(v)
	}
	return hydra.PasswordCredentialsCode(ctx, userName, password, v.Get("challenge"))
}

func (p *grpcProvider) LoginChallengeCode(ctx context.Context, claims claim.Claims, opts ...TokenOption) (*auth.GetLoginResponse, string, error) {
	v := url.Values{}
	for _, opt := range opts {
		opt.SetValue(v)
	}

	// Getting or creating challenge
	challenge := v.Get("challenge")
	claimsAsMap := map[string]string{
		"subject":    claims.Subject,
		"name":       claims.Name,
		"email":      claims.Email,
		"authSource": claims.AuthSource,
	}
	return hydra.LoginChallengeCode(ctx, challenge, claimsAsMap)
	/*
		if challenge == "" {
			if c, err := hydra.CreateLogin(ctx, config.DefaultOAuthClientID, []string{"openid", "profile", "offline"}, []string{}); err != nil {
				return nil, "", err
			} else {
				challenge = c.Challenge
			}
		}

		// Searching login challenge
		login, err := hydra.GetLogin(ctx, challenge)
		if err != nil {
			log.Logger(ctx).Error("Failed to get login ", zap.Error(err))
			return nil, "", err
		}

		// Accepting login challenge
		verify, err := hydra.AcceptLogin(ctx, challenge, claims.Subject)
		if err != nil {
			log.Logger(ctx).Error("Failed to accept login ", zap.Error(err))
			return nil, "", err
		}

		// Creating consent
		consent, err := hydra.CreateConsent(ctx, verify.Challenge)
		if err != nil {
			log.Logger(ctx).Error("Failed to create consent ", zap.Error(err))
			return nil, "", err
		}

		claimsMap := map[string]string{
			"name":  claims.Name,
			"email": claims.Email,
		}
		if claims.AuthSource != "" {
			claimsMap["authSource"] = claims.AuthSource
		}
		// Accepting consent
		acceptResp, err := hydra.AcceptConsent(ctx,
			consent.Challenge,
			login.GetRequestedScope(),
			login.GetRequestedAudience(),
			map[string]string{},
			claimsMap,
		)
		if err != nil {
			log.Logger(ctx).Error("Failed to accept consent ", zap.Error(err))
			return nil, "", err
		}
		consent.Challenge = acceptResp.Challenge
		verifier := consent.Challenge // Must be > 43 characters
		hash := sha256.New()
		if _, err = hash.Write([]byte(verifier)); err != nil {
			return nil, "", err
		}

		codeChallenge := base64.RawURLEncoding.EncodeToString(hash.Sum([]byte{}))
		codeChallengeMethod := "S256"

		requestURL, err := url.Parse(login.GetRequestURL())
		if err != nil {
			return nil, "", err
		}

		requestURLValues := requestURL.Query()

		redirectURL, err := url.QueryUnescape(requestURLValues.Get("redirect_uri"))
		if err != nil {
			return nil, "", err
		}

		code, err := hydra.CreateAuthCode(ctx, consent, login.GetClientID(), redirectURL, codeChallenge, codeChallengeMethod)
		if err != nil {
			log.Logger(ctx).Error("Failed to create auth code ", zap.Error(err))
			return nil, "", err
		}

		return login, code, err

	*/
}

func (p *grpcProvider) Logout(ctx context.Context, requestUrl, username, sessionID string, opts ...TokenOption) error {

	v := url.Values{}
	for _, opt := range opts {
		opt.SetValue(v)
	}

	logout, err := hydra.CreateLogout(ctx, requestUrl, username, sessionID)
	if err != nil {
		return err
	}

	return hydra.AcceptLogout(ctx, logout.Challenge, v.Get("access_token"), v.Get("refresh_token"))

}

func (p *grpcProvider) Exchange(ctx context.Context, code, codeVerifier string) (*oauth2.Token, error) {
	return hydra.Exchange(ctx, code, codeVerifier)
}

type grpcToken struct {
	claims *jwt.IDTokenClaims
}

func (t *grpcToken) Claims(v interface{}) error {
	return mapstructure.Decode(t.claims.ToMap(), &v)
}

func (t *grpcToken) ScopedClaims(claims *claim.Claims) error {
	// Check key from claims.Extra to set ProvidesScopes flag
	// Content is already parsed into Scopes field
	if ss := t.claims.Get("scopes"); ss != nil {
		claims.ProvidesScopes = true
	}
	return nil
}

func RegisterGRPCProvider(pType ProviderType, service string) {

	switch pType {
	case ProviderTypeGrpc:
		p := new(grpcProvider)
		p.service = service
		RegisterProvider(p)
	case ProviderTypePAT:
		p := new(grpcVerifier)
		p.service = service
		RegisterProvider(p)
	}

}
