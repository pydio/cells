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

package idm

import (
	"context"
	"strings"

	"google.golang.org/protobuf/proto"
)

const (
	UserAttrPrivatePrefix = "pydio:"
	UserAttrPassHashed    = UserAttrPrivatePrefix + "password_hashed"
	UserAttrLabelLike     = UserAttrPrivatePrefix + "labelLike"
	UserAttrOrigin        = UserAttrPrivatePrefix + "origin"

	UserAttrDisplayName = "displayName"
	UserAttrProfile     = "profile"
	UserAttrAvatar      = "avatar"
	UserAttrEmail       = "email"
	UserAttrHasEmail    = "hasEmail"
	UserAttrAuthSource  = "AuthSource"
	UserAttrHidden      = "hidden"
)

func (u *User) WithPublicData(ctx context.Context, policiesContextEditable bool) *User {

	user := proto.Clone(u).(*User)
	if user.Attributes == nil {
		user.Attributes = make(map[string]string)
	}
	user.PoliciesContextEditable = policiesContextEditable

	for k, _ := range user.Attributes {
		if strings.HasPrefix(k, UserAttrPrivatePrefix) {
			delete(user.Attributes, k)
			continue
		}
	}

	if !user.PoliciesContextEditable {
		for k, _ := range user.Attributes {
			if k == UserAttrEmail {
				// Special treatment
				user.Attributes[UserAttrHasEmail] = "true"
				delete(user.Attributes, k)
			}
			if !isPublicAttribute(k) {
				delete(user.Attributes, k)
			}
		}
	}

	return user
}

func isPublicAttribute(att string) (public bool) {

	publicAttributes := []string{
		UserAttrDisplayName,
		UserAttrAvatar,
		UserAttrProfile,
		UserAttrHasEmail,
	}
	for _, a := range publicAttributes {
		if a == att {
			return true
		}
	}

	return
}

func (u *User) IsHidden() bool {
	if u == nil || u.Attributes == nil {
		return false
	}
	if h, o := u.Attributes[UserAttrHidden]; o && h == "true" {
		return true
	}
	return false
}
