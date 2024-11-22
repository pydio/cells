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
	"strings"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// ContextFromClaims feeds context with correct Keys and Metadata for a given Claims
func ContextFromClaims(ctx context.Context, claims claim.Claims) context.Context {
	// Set context keys
	ctx = context.WithValue(ctx, claim.ContextKey, claims)
	ctx = context.WithValue(ctx, common.PydioContextUserKey, claims.Name)

	// Set context Metadata
	md := make(map[string]string)
	if existing, ok := propagator.FromContextRead(ctx); ok {
		for k, v := range existing {
			// Ignore existing version of PydioContextUserKey, it will be replaced after
			if k == strings.ToLower(common.PydioContextUserKey) {
				continue
			}
			md[k] = v
		}
	}
	md[common.PydioContextUserKey] = claims.Name
	return propagator.NewContext(ctx, md)
}
