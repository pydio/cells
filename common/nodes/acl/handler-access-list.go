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

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

func WithAccessList() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, NewAccessListHandler(options.AdminView))
	}
}

// AccessListHandler appends permissions.AccessList to the context.
type AccessListHandler struct {
	abstract.Handler
}

func (a *AccessListHandler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

// NewAccessListHandler creates a new AccessListHandler
func NewAccessListHandler(adminView bool) *AccessListHandler {
	a := &AccessListHandler{}
	a.CtxWrapper = func(ctx context.Context) (context.Context, error) {
		if adminView {
			return WithAdminKey(ctx), nil
		}
		if HasPresetACL(ctx) {
			// Already loaded and context is instructed to not reload access list
			return ctx, nil
		}
		accessList, err := permissions.AccessListFromContextClaims(ctx)
		if err != nil {
			log.Logger(ctx).Error("Failed to get accessList", zap.Error(err))
			return ctx, err
		}
		ctx = ToContext(ctx, accessList)
		return ctx, nil
	}
	return a
}
