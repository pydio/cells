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
	"fmt"

	"github.com/pydio/cells/common"
	context2 "github.com/pydio/cells/common/utils/context"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/melody"
	"go.uber.org/zap"
	"golang.org/x/time/rate"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

const (
	SessionRolesKey      = "roles"
	SessionWorkspacesKey = "workspaces"
	SessionAccessListKey = "accessList"
	SessionUsernameKey   = "user"
	SessionProfileKey    = "profile"
	SessionClaimsKey     = "claims"
	SessionSubjectsKey   = "subjects"
	SessionLimiterKey    = "limiter"
	SessionMetaContext   = "metaContext"
)

const LimiterRate = 30
const LimiterBurst = 20

func updateSessionFromClaims(session *melody.Session, claims claim.Claims, pool views.SourcesPool) {

	ctx := context.WithValue(context.Background(), claim.ContextKey, claims)
	vNodeResolver := views.GetVirtualNodesManager().GetResolver(pool, true)
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		log.Logger(ctx).Error("Error while setting workspaces in session", zap.Error(err))
		ClearSession(session)
		return
	}
	roles := accessList.OrderedRoles
	workspaces := accessList.Workspaces
	// Resolve workspaces roots in the current context
	for _, workspaces := range workspaces {
		var resolvedRoots []string
		for _, rootId := range workspaces.RootUUIDs {
			if resolved, ok := vNodeResolver(ctx, &tree.Node{Uuid: rootId}); ok {
				resolvedRoots = append(resolvedRoots, resolved.Uuid)
			} else {
				resolvedRoots = append(resolvedRoots, rootId)
			}
		}
		workspaces.RootUUIDs = resolvedRoots
	}
	log.Logger(ctx).Debug("Setting workspaces in session", zap.Any("workspaces", workspaces))
	session.Set(SessionRolesKey, roles)
	session.Set(SessionWorkspacesKey, workspaces)
	session.Set(SessionAccessListKey, accessList)
	session.Set(SessionUsernameKey, claims.Name)
	session.Set(SessionProfileKey, claims.Profile)
	session.Set(SessionClaimsKey, claims)
	session.Set(SessionSubjectsKey, append([]string{"*"}, auth.SubjectsFromClaim(claims)...))
	session.Set(SessionLimiterKey, rate.NewLimiter(LimiterRate, LimiterBurst))
	ctx = servicecontext.HttpRequestInfoToMetadata(context.Background(), session.Request)
	if md, ok := metadata.FromContext(ctx); ok {
		session.Set(SessionMetaContext, md)
	}

}

func ClearSession(session *melody.Session) {

	session.Set(SessionRolesKey, nil)
	session.Set(SessionWorkspacesKey, nil)
	session.Set(SessionAccessListKey, nil)
	session.Set(SessionUsernameKey, nil)
	session.Set(SessionProfileKey, nil)
	session.Set(SessionClaimsKey, nil)
	session.Set(SessionSubjectsKey, nil)
	session.Set(SessionLimiterKey, nil)

}

func prepareRemoteContext(session *melody.Session) (context.Context, error) {
	claims, o1 := session.Get(SessionClaimsKey)
	if !o1 {
		return nil, fmt.Errorf("unexpected error: websocket session has no claims")
	}
	metaCtx := auth.ContextFromClaims(context.Background(), claims.(claim.Claims))
	metaCtx = servicecontext.WithServiceName(metaCtx, common.ServiceGatewayNamespace_+common.ServiceWebSocket)
	if md, o := session.Get(SessionMetaContext); o {
		metaCtx = context2.WithAdditionalMetadata(metaCtx, md.(metadata.Metadata))
	}
	return metaCtx, nil
}
