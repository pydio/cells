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
	"errors"

	"github.com/ory/fosite"
	"github.com/ory/hydra/oauth2"

	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/idm/oauth"
)

// Handler for the plugin
type Handler struct{}

var (
	_ auth.AuthTokenVerifierHandler = (*Handler)(nil)
)

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
