/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"strings"

	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/utils/permissions"
)

const (
	rolesMaxLength     = 6 * 1024
	rolesRequireReload = "__RolesRequireReload__"
	claimsContextKey   = "x-pydio-claims"
)

// ToMetadata stores Claims in metadata (to be passed along by grpc queries)
func ToMetadata(ctx context.Context, claims claim.Claims) context.Context {
	// Check string length for Roles as it may blow up the Header size
	if len(claims.Roles) > rolesMaxLength {
		//fmt.Println("Removing Roles from Claims", len(claims.Roles))
		claims.Roles = rolesRequireReload
	}
	md := make(map[string]string)
	if existing, ok := metadata.FromContext(ctx); ok {
		for k, v := range existing {
			md[k] = v
		}
	}
	data, _ := json.Marshal(claims)
	md[claimsContextKey] = string(data)
	return metadata.NewContext(ctx, md)
}

// FromMetadata loads Claims from metadata (be passed along by grpc queries)
func FromMetadata(ctx context.Context) (c claim.Claims, o bool) {
	md, o := metadata.FromContext(ctx)
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
