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

package acl

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/permissions"
)

type ctxUserAccessListKey struct{}

func ToContext(ctx context.Context, acl *permissions.AccessList) context.Context {
	return context.WithValue(ctx, ctxUserAccessListKey{}, acl)
}

func FromContext(ctx context.Context) (*permissions.AccessList, bool) {
	val := ctx.Value(ctxUserAccessListKey{})
	if val == nil {
		return nil, false
	}
	acl, ok := val.(*permissions.AccessList)
	return acl, ok
}

func MustFromContext(ctx context.Context) *permissions.AccessList {
	val := ctx.Value(ctxUserAccessListKey{})
	if val == nil {
		panic("MustFromContext called without AccessList in context")
	}
	return val.(*permissions.AccessList)
}

type ctxAdminContextKey struct{}

func WithAdminKey(ctx context.Context) context.Context {
	return context.WithValue(ctx, ctxAdminContextKey{}, true)
}

func HasAdminKey(ctx context.Context) bool {
	k := ctx.Value(ctxAdminContextKey{})
	return k != nil && k.(bool)
}

type ctxKeepAccessListKey struct{}

func WithPresetACL(ctx context.Context, acl *permissions.AccessList) context.Context {
	if acl != nil {
		ctx = ToContext(ctx, acl)
	}
	return context.WithValue(ctx, ctxKeepAccessListKey{}, true)
}

func HasPresetACL(ctx context.Context) bool {
	k := ctx.Value(ctxKeepAccessListKey{})
	a := ctx.Value(ctxUserAccessListKey{})
	return k != nil && k.(bool) && a != nil
}
