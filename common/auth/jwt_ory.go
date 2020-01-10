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
	"errors"

	"github.com/ory/fosite"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/oauth2"
)

type oryprovider struct {
	oauth2Provider fosite.OAuth2Provider
}

type orytoken struct {
	claims *jwt.IDTokenClaims
}

func RegisterOryProvider(o fosite.OAuth2Provider) {
	p := new(oryprovider)

	p.oauth2Provider = o

	addProvider(p)
}

func (p *oryprovider) GetType() ProviderType {
	return ProviderTypeOry
}

func (c *oryprovider) Verify(ctx context.Context, accessToken string) (IDToken, error) {

	session := oauth2.NewSession("")

	tokenType, ar, err := c.oauth2Provider.IntrospectToken(ctx, accessToken, fosite.AccessToken, session)
	if err != nil {
		return nil, err
	}

	if tokenType != fosite.AccessToken {
		return nil, errors.New("Only access tokens are allowed in the authorization header")
	}

	return &orytoken{ar.GetSession().(*oauth2.Session).IDTokenClaims()}, nil
}

func (t *orytoken) Claims(v interface{}) error {

	data, err := json.Marshal(t.claims.ToMap())
	if err != nil {
		return err
	}

	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}

	return nil
}
