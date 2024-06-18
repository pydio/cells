/*
 * Copyright (c) 2022. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/rest"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/slug"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func (sc *Client) getUuidRouter() nodes.Handler {
	if sc.uuidRouter == nil {
		sc.uuidRouter = compose.UuidClient(sc.GetRuntimeContext())
	}
	return sc.uuidRouter
}

func (sc *Client) getUuidAdminRouter() nodes.Handler {
	if sc.uuidAdmin == nil {
		sc.uuidAdmin = compose.UuidClient(sc.GetRuntimeContext(), nodes.AsAdmin())
	}
	return sc.uuidAdmin
}

func (sc *Client) getPathRouter() nodes.Handler {
	if sc.pathRouter == nil {
		sc.pathRouter = compose.PathClient(sc.GetRuntimeContext())
	}
	return sc.pathRouter
}

// LoadDetectedRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func (sc *Client) LoadDetectedRootNodes(ctx context.Context, detectedRoots []string, accessList *permissions.AccessList) (rootNodes map[string]*tree.Node) {

	router := sc.getUuidRouter()
	throttle := make(chan struct{}, 5)
	eventFilter := compose.ReverseClient(sc.RuntimeContext, nodes.AsAdmin())
	wg := &sync.WaitGroup{}
	wg.Add(len(detectedRoots))
	var loaded []*tree.Node
	ensureCtx := acl.WithPresetACL(ctx, accessList)
	for _, rootId := range detectedRoots {
		throttle <- struct{}{}
		go func(rid string) {
			defer func() {
				wg.Done()
				<-throttle
			}()
			request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rid}}
			if resp, err := router.ReadNode(ensureCtx, request); err == nil {
				node := resp.Node
				var multipleMeta []*tree.WorkspaceRelativePath
				for _, ws := range accessList.GetWorkspaces() {
					if filtered, ok := eventFilter.WorkspaceCanSeeNode(ensureCtx, accessList, ws, resp.Node); ok {
						multipleMeta = append(multipleMeta, &tree.WorkspaceRelativePath{
							WsLabel: ws.Label,
							WsUuid:  ws.UUID,
							WsSlug:  ws.Slug,
							Path:    filtered.Path,
						})
						node = filtered
					}
				}
				if len(multipleMeta) == 0 {
					log.Logger(ctx).Error("Trying to load a node that does not correspond to accessible workspace, this is not normal", node.Zap("input"))
					return
				}
				node.AppearsIn = multipleMeta
				loaded = append(loaded, node.WithoutReservedMetas())
			} else {
				log.Logger(ctx).Debug("Share Load - Ignoring Root Node, probably not synced yet", zap.String("nodeId", rid), zap.Error(err))
			}
		}(rootId)
	}
	wg.Wait()
	rootNodes = make(map[string]*tree.Node)
	for _, n := range loaded {
		rootNodes[n.GetUuid()] = n
	}
	return

}

// ParseRootNodes reads the request property to either create a new node using the "rooms" Virtual node,
// or just verify that the root nodes are not empty.
func (sc *Client) ParseRootNodes(ctx context.Context, cell *rest.Cell, createEmpty bool) (bool, error) {

	router := sc.getPathRouter()
	for i, n := range cell.RootNodes {
		r, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: n})
		if e != nil {
			return false, e
		}
		// If the virtual root is responded, it may miss the UUID ! Set up manually here
		if r.Node.Uuid == "" {
			r.Node.Uuid = n.Uuid
		}
		cell.RootNodes[i] = r.Node
	}
	if createEmpty {

		manager := abstract.GetVirtualNodesManager(sc.RuntimeContext)
		internalRouter := compose.PathClientAdmin(sc.RuntimeContext)
		if root, exists := manager.ByUuid("cells"); exists {
			parentNode, err := manager.ResolveInContext(ctx, root, true)
			if err != nil {
				return false, err
			}
			index := 0
			labelSlug := slug.Make(cell.Label)
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
				return false, err
			}
			// Update node meta
			createResp.Node.MustSetMeta(common.MetaFlagCellNode, true)
			metaClient := tree.NewNodeReceiverClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceMeta))
			metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: createResp.Node})
			cell.RootNodes = append(cell.RootNodes, createResp.Node)
		} else {
			return false, errors.WithMessagef(errors.StatusInternalServerError, "Wrong configuration, missing rooms virtual node")
		}
	}
	if len(cell.RootNodes) == 0 {
		return false, errors.WithMessage(errors.InvalidParameters, "Wrong configuration, missing RootNodes in CellRequest")
	}

	// First check of incoming ACLs
	var hasReadonly bool
	for _, root := range cell.RootNodes {
		if root.GetStringMeta(common.MetaFlagReadonly) != "" {
			hasReadonly = true
		}
	}
	if hasReadonly {
		for _, a := range cell.GetACLs() {
			for _, action := range a.GetActions() {
				if action.Name == permissions.AclWrite.Name {
					return true, errors.WithMessage(errors.PathReadonly, "One of the resource you are sharing is readonly. You cannot assign write permission on this Cell.")
				}
			}
		}
	}
	log.Logger(ctx).Debug("ParseRootNodes", log.DangerouslyZapSmallSlice("r", cell.RootNodes), zap.Bool("readonly", hasReadonly))
	return hasReadonly, nil

}

func (sc *Client) DetectInheritedPolicy(ctx context.Context, roots []*tree.Node, loadedParents []*tree.WorkspaceRelativePath) (string, error) {

	var parentPol string

	var cellNode bool
	for _, r := range roots {
		if r.GetMetaBool(common.MetaFlagCellNode) {
			cellNode = true
			break
		}
	}
	if cellNode {
		// Check if there is a default policy set for cells using custom folders
		claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
		if !ok {
			return "", errors.WithStack(errors.InvalidIDToken)
		}
		roles, er := permissions.GetRoles(ctx, strings.Split(claims.Roles, ","))
		if er != nil {
			return "", er
		}
		acls, er := permissions.GetACLsForRoles(ctx, roles, &idm.ACLAction{Name: "default-cells-policy"})
		if er != nil {
			return "", er
		}

		for _, role := range roles {
			for _, acl := range acls {
				if acl.RoleID == role.Uuid && acl.Action.Name == "default-cells-policy" {
					parentPol = strings.TrimPrefix(strings.Trim(acl.Action.Value, `"`), "policy:")
				}
			}
		}
	}

	accessList, e := permissions.AccessListFromContextClaims(ctx)
	if e != nil {
		return "", e
	}
	if !accessList.HasPolicyBasedAcls() {
		return parentPol, nil
	}

	var ww []*tree.WorkspaceRelativePath
	if loadedParents != nil {
		ww = loadedParents
	} else {
		rpw, e := sc.RootsParentWorkspaces(ctx, roots)
		if e != nil {
			return "", e
		}
		ww = rpw
	}
	wsNodes := accessList.GetWorkspacesRoots()
	for _, w := range ww {
		if nn, ok := wsNodes[w.WsUuid]; ok {
			for _, b := range nn {
				if b.BitmaskFlag&permissions.FlagPolicy != 0 {
					for _, p := range b.PolicyIds {
						if strings.HasSuffix(p, "-ro") || strings.HasSuffix(p, "-rw") || strings.HasSuffix(p, "-wo") {
							continue
						}
						if parentPol != "" && parentPol != p {
							return "", errors.WithMessage(errors.StatusConflict, "roots have conflicting access policies, cannot assign permissions")
						} else {
							parentPol = p
						}
					}
				}
			}
		}
	}
	return parentPol, nil
}

// DeleteRootNodeRecursively loads all children of a root node and delete them, including the
// .pydio hidden files when they are folders.
func (sc *Client) DeleteRootNodeRecursively(ctx context.Context, ownerName string, roomNode *tree.Node) error {

	manager := abstract.GetVirtualNodesManager(sc.RuntimeContext)
	if root, exists := manager.ByUuid("cells"); exists {
		parentNode, err := manager.ResolveInContext(ctx, root, true)
		if err != nil {
			return err
		}
		realNode := &tree.Node{Path: parentNode.Path + "/" + strings.TrimRight(roomNode.Path, "/")}
		// Now send deletion to scheduler
		cli := jobsc.JobServiceClient(ctx)
		jobUuid := "cells-delete-" + uuid.New()
		q, _ := anypb.New(&tree.Query{
			Paths: []string{realNode.Path},
		})
		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          ownerName,
			Label:          "Deleting Cell specific data",
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.tree.delete",
					Parameters: map[string]string{},
					NodesSelector: &jobs.NodesSelector{
						Query: &service.Query{SubQueries: []*anypb.Any{q}},
					},
				},
			},
		}
		if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			return er
		}
	}
	return nil
}

// CheckLinkRootNodes loads the root nodes and check if one of the is readonly. If so, check that
// link permissions do not try to set the Upload mode.
func (sc *Client) CheckLinkRootNodes(ctx context.Context, link *rest.ShareLink) (workspaces []*tree.WorkspaceRelativePath, files, folders bool, e error) {

	router := sc.getUuidRouter()
	var hasReadonly bool
	for i, r := range link.RootNodes {
		resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: r})
		if er != nil {
			e = er
			return
		}
		if resp.Node == nil {
			e = errors.WithMessage(errors.NodeNotFound, "cannot find root node")
			return
		}
		link.RootNodes[i] = resp.Node
		if resp.Node.GetStringMeta(common.MetaFlagReadonly) != "" {
			hasReadonly = true
		}
		workspaces = append(workspaces, resp.Node.AppearsIn...)
		if resp.Node.IsLeaf() {
			files = true
		} else {
			folders = true
		}
	}
	if hasReadonly {
		for _, p := range link.Permissions {
			if p == rest.ShareLinkAccessType_Upload {
				e = errors.WithMessage(errors.PathNotWriteable, "This resource is not writeable, you are not allowed to set this permission.")
				return
			}
		}
	}
	return

}

// RootsParentWorkspaces reads parents and find the root node of the workspace
func (sc *Client) RootsParentWorkspaces(ctx context.Context, rr []*tree.Node) (ww []*tree.WorkspaceRelativePath, e error) {
	router := sc.getUuidRouter()
	for _, r := range rr {
		if r.GetMetaBool(common.MetaFlagCellNode) {
			continue
		}
		resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: r.Uuid}})
		if er != nil {
			e = er
			return
		}
		if resp.Node == nil {
			e = errors.WithMessage(errors.NodeNotFound, "cannot find root node")
			return
		}
		ww = append(ww, resp.Node.AppearsIn...)
	}
	return
}

// LoadAdminRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func (sc *Client) LoadAdminRootNodes(ctx context.Context, detectedRoots []string) (rootNodes map[string]*tree.Node) {

	rootNodes = make(map[string]*tree.Node)
	router := sc.getUuidAdminRouter()
	metaClient := treec.ServiceNodeProviderClient(sc.GetRuntimeContext(), common.ServiceMeta)
	for _, rootId := range detectedRoots {
		request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}}
		if resp, err := router.ReadNode(ctx, request); err == nil {
			node := resp.Node
			if metaResp, e := metaClient.ReadNode(ctx, request); e == nil && metaResp.GetNode().GetMetaBool(common.MetaFlagCellNode) {
				node.MustSetMeta(common.MetaFlagCellNode, true)
			}
			rootNodes[node.GetUuid()] = node.WithoutReservedMetas()
		} else {
			log.Logger(ctx).Error("Share Load - Ignoring Root Node, probably deleted", zap.String("nodeId", rootId), zap.Error(err))
		}
	}
	return

}
