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
	"encoding/base64"
	"fmt"
	"path"
	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	proto "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/idm/auth"
)

func NewAuthTokenRevokerHandler() (proto.AuthTokenRevokerHandler, error) {
	h := &TokenRevokerHandler{}
	dataDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH)
	if e != nil {
		return nil, e
	}
	dao, err := auth.NewBoltStore("tokens", path.Join(dataDir, "auth-revoked-token.db"))
	if err != nil {
		return nil, err
	}
	h.dao = dao
	return h, nil
}

type TokenRevokerHandler struct {
	dao auth.DAO
}

// MatchInvalid checks if token is part of revocation list
func (h *TokenRevokerHandler) MatchInvalid(ctx context.Context, in *proto.MatchInvalidTokenRequest, out *proto.MatchInvalidTokenResponse) error {
	info, err := h.dao.GetInfo(in.Token)
	if err != nil || len(info) == 0 {
		out.State = proto.State_NO_MATCH
	} else {
		out.State = proto.State_REVOKED
	}
	out.RevocationInfo = info
	return nil
}

// Revoke adds token to revocation list and eventually clear RefreshToken as well (directly inside Dex)
func (h *TokenRevokerHandler) Revoke(ctx context.Context, in *proto.RevokeTokenRequest, out *proto.RevokeTokenResponse) error {
	// Put in revocation list for IdToken
	return h.dao.PutToken(in.Token)

}

// PruneTokens garbage collect expired IdTokens and Tokens
func (h *TokenRevokerHandler) PruneTokens(ctx context.Context, in *proto.PruneTokensRequest, out *proto.PruneTokensResponse) error {
	return nil
}

// Util
func parseJWT(p string) ([]byte, error) {
	parts := strings.Split(p, ".")
	if len(parts) < 2 {
		return nil, fmt.Errorf("oidc: malformed jwt, expected 3 parts got %d", len(parts))
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("oidc: malformed jwt payload: %v", err)
	}
	return payload, nil
}
