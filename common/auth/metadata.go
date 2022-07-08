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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

const (
	rolesMaxLength     = 6 * 1024
	rolesRequireReload = "__RolesRequireReload__"
	claimsContextKey   = "x-pydio-claims"
)

// ContextFromClaims feeds context with correct Keys and Metadata for a given Claims
func ContextFromClaims(ctx context.Context, claims claim.Claims) context.Context {
	// Set context keys
	ctx = context.WithValue(ctx, claim.ContextKey, claims)
	ctx = context.WithValue(ctx, common.PydioContextUserKey, claims.Name)

	// Set context Metadata
	md := make(map[string]string)
	if existing, ok := metadata.FromContextRead(ctx); ok {
		for k, v := range existing {
			// Ignore existing version of PydioContextUserKey, it will be replaced after
			if k == strings.ToLower(common.PydioContextUserKey) {
				continue
			}
			md[k] = v
		}
	}
	md[common.PydioContextUserKey] = claims.Name
	// Check string length for Roles as it may blow up the Header size
	metaClaims := claims
	if len(claims.Roles) > rolesMaxLength {
		//fmt.Println("Removing Roles from Claims", len(claims.Roles))
		metaClaims.Roles = rolesRequireReload
	}
	data, _ := json.Marshal(metaClaims)
	md[claimsContextKey] = string(data)
	return metadata.NewContext(ctx, md)
}

// ClaimsFromMetadata loads Claims from metadata (be passed along by grpc queries)
func ClaimsFromMetadata(ctx context.Context) (c claim.Claims, o bool) {
	md, o := metadata.FromContextCopy(ctx)
	if !o {
		return c, false
	}
	js, o := md[claimsContextKey]
	if !o {
		return c, false
	}
	err := json.Unmarshal([]byte(js), &c)
	if err != nil {
		return c, false
	}
	if c.Name != "" && c.Roles == rolesRequireReload {
		// Create a ctx for this request or it will loop on rolesRequireReload!
		internalContext := metadata.NewContext(context.Background(), map[string]string{
			common.PydioContextUserKey: common.PydioSystemUsername,
		})
		u, err := permissions.SearchUniqueUser(internalContext, c.Name, "")
		if err != nil {
			return c, false
		}
		var roles []string
		for _, role := range u.Roles {
			roles = append(roles, role.Uuid)
		}
		//fmt.Println("Reloaded Roles to Claims", len(roles))
		c.Roles = strings.Join(roles, ",")
	}

	return c, true
}
