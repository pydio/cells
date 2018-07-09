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

// Package websocket starts a WebSocket service forwarding internal events to http clients
package websocket

import (
	"context"

	"go.uber.org/zap"
	"gopkg.in/olahol/melody.v1"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
)

const SessionRolesKey = "roles"
const SessionWorkspacesKey = "workspaces"
const SessionUsernameKey = "user"
const SessionProfileKey = "profile"

func UpdateSessionFromClaims(session *melody.Session, claims claim.Claims, pool *views.ClientsPool) {

	ctx := context.WithValue(context.Background(), claim.ContextKey, claims)
	vNodeManager := views.GetVirtualNodesManager()
	if accessList, err := utils.AccessListFromContextClaims(ctx); err == nil {
		roles := accessList.OrderedRoles
		workspaces := accessList.Workspaces
		// Resolve workspaces roots in the current context
		for _, workspaces := range workspaces {
			var resolvedRoots []string
			for _, rootId := range workspaces.RootUUIDs {
				if vNode, exists := vNodeManager.ByUuid(rootId); exists {
					if resolved, e := vNodeManager.ResolveInContext(ctx, vNode, pool, true); e == nil && resolved.Uuid != "" {
						resolvedRoots = append(resolvedRoots, resolved.Uuid)
					}
					continue // skip this node totally if the resolution failed
				}
				resolvedRoots = append(resolvedRoots, rootId)
			}
			workspaces.RootUUIDs = resolvedRoots
		}
		log.Logger(ctx).Debug("Setting workspaces in session", zap.Any("workspaces", workspaces))
		session.Set(SessionRolesKey, roles)
		session.Set(SessionWorkspacesKey, workspaces)
		session.Set(SessionUsernameKey, claims.Name)
		session.Set(SessionProfileKey, claims.Profile)
	} else {
		log.Logger(ctx).Error("Error while setting workspaces in session", zap.Error(err))
		ClearSession(session)
	}

}

func ClearSession(session *melody.Session) {

	session.Set(SessionRolesKey, nil)
	session.Set(SessionWorkspacesKey, nil)
	session.Set(SessionUsernameKey, nil)
	session.Set(SessionProfileKey, nil)

}
