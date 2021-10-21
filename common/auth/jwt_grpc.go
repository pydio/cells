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

	"github.com/mitchellh/mapstructure"
	"github.com/ory/fosite/token/jwt"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/auth/hydra"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/auth"
	json "github.com/pydio/cells/x/jsonx"
)

type grpcVerifier struct {
	pType   ProviderType
	service string
}

func (p *grpcVerifier) GetType() ProviderType {
	return ProviderTypePAT
}

func (p *grpcVerifier) Verify(ctx context.Context, rawIDToken string) (IDToken, error) {

	cli := auth.NewAuthTokenVerifierClient(p.service, defaults.NewClient())

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

func (p *grpcProvider) PasswordCredentialsToken(ctx context.Context, userName string, password string) (*oauth2.Token, error) {
	return hydra.PasswordCredentialsToken(ctx, userName, password)
}

func (p *grpcProvider) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return hydra.Exchange(ctx, code)
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
		addProvider(p)
	case ProviderTypePAT:
		p := new(grpcVerifier)
		p.service = service
		addProvider(p)
	}

}
