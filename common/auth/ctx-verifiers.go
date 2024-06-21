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
	"fmt"

	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
)

func init() {
	AddContextVerifier(LockVerifier{})
	AddContextVerifier(OIDCPoliciesVerifier{})
}

type LockVerifier struct{}

func (l LockVerifier) Verify(ctx context.Context, user *idm.User) error {
	if permissions.IsUserLocked(user) {
		return fmt.Errorf("user is locked")
	}
	return nil
}

type OIDCPoliciesVerifier struct{}

func (O OIDCPoliciesVerifier) Verify(ctx context.Context, user *idm.User) error {
	return checkOIDCPolicies(ctx, user)
}
