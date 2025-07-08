/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/share"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/slug"
)

type Handler struct {
	share.UnimplementedShareServiceServer
}

// ParseRoots is a grpc version of the share.Client library ParseRootNodes method
func (h *Handler) ParseRoots(ctx context.Context, req *share.ParseRootsRequest) (*share.ParseRootsResponse, error) {

	// Load claims in context for further nodes library resolution
	// Why don't we forward the claims always?
	if _, ok := claim.FromContext(ctx); !ok {
		userName := claim.UserNameFromContext(ctx)
		if user, e := permissions.SearchUniqueUser(ctx, userName, ""); e != nil {
			return nil, e
		} else {
			ctx = auth.WithImpersonate(ctx, user)
		}
	}

	response := &share.ParseRootsResponse{
		Nodes: append([]*tree.Node{}, req.GetNodes()...),
	}

	router := compose.PathClient()
	for i, n := range response.Nodes {
		r, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: n})
		if e != nil {
			return nil, e
		}
		// If the virtual root is responded, it may miss the UUID ! Set up manually here
		if r.Node.Uuid == "" {
			r.Node.Uuid = n.Uuid
		}
		response.Nodes[i] = r.Node
	}
	if req.CreateEmpty {

		manager := abstract.GetVirtualProvider()
		internalRouter := compose.PathClientAdmin()
		if root, exists := manager.ByUuid(ctx, "cells"); exists {
			parentNode, err := manager.ResolveInContext(ctx, root, true)
			if err != nil {
				return nil, err
			}
			index := 0
			labelSlug := slug.Make(req.CreateLabel)
			baseSlug := labelSlug
			for {
				if existingResp, err := internalRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug}}); err == nil && existingResp.Node != nil {
					index++
					labelSlug = fmt.Sprintf("%s-%v", baseSlug, index)
				} else {
					break
				}
			}
			createResp, err := internalRouter.CreateNode(ctx, &tree.CreateNodeRequest{
				Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug},
			})
			if err != nil {
				log.Logger(ctx).Error("share/cells : create empty root", zap.Error(err))
				return nil, err
			}
			// Update node meta
			createResp.Node.MustSetMeta(common.MetaFlagCellNode, true)
			metaClient := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
			if _, er := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: createResp.Node}); er != nil {
				return nil, er
			}
			response.Nodes = append(response.Nodes, createResp.Node)
		} else {
			return nil, errors.WithMessagef(errors.StatusInternalServerError, "Wrong configuration, missing rooms virtual node")
		}
	}
	if len(response.Nodes) == 0 {
		return nil, errors.WithMessage(errors.InvalidParameters, "Wrong configuration, missing RootNodes in CellRequest")
	}
	log.Logger(ctx).Info("ParseRootNodes (service)", log.DangerouslyZapSmallSlice("r", response.Nodes))
	return response, nil

}
