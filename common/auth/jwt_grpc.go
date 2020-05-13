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

package auth

import (
	"context"
	"encoding/json"

	"github.com/mitchellh/mapstructure"
	"github.com/ory/fosite/token/jwt"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common/auth/hydra"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/auth"
)

type grpcprovider struct {
	service string
}

type grpctoken struct {
	claims *jwt.IDTokenClaims
}

type grpcclaims interface {
	ToMap() map[string]interface{}
}

func RegisterGRPCProvider(service string) {
	p := new(grpcprovider)

	p.service = service

	addProvider(p)
}

func (p *grpcprovider) GetType() ProviderType {
	return ProviderTypeGrpc
}

func (c *grpcprovider) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return hydra.Exchange(ctx, code)
}

func (c *grpcprovider) Verify(ctx context.Context, rawIDToken string) (IDToken, error) {

	cli := auth.NewAuthTokenVerifierClient(c.service, defaults.NewClient())

	resp, err := cli.Verify(ctx, &auth.VerifyTokenRequest{
		Token: rawIDToken,
	})
	if err != nil {
		return nil, err
	}

	token := new(grpctoken)

	if err := json.Unmarshal(resp.GetData(), &token.claims); err != nil {
		return nil, err
	}

	return token, nil
}

func (t *grpctoken) Claims(v interface{}) error {
	return mapstructure.Decode(t.claims.ToMap(), &v)
}
