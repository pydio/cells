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
	"path"
	"strings"
	"sync"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/rest"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/share"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/slug"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

func (sc *Client) getUuidRouter(ctx context.Context) nodes.Handler {
	return compose.UuidClient()
}

// LoadDetectedRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func (sc *Client) LoadDetectedRootNodes(ctx context.Context, detectedRoots []string, accessList *permissions.AccessList) (rootNodes map[string]*tree.Node) {

	router := sc.getUuidRouter(ctx)
	throttle := make(chan struct{}, 5)
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
			request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rid}, StatFlags: []uint32{tree.StatFlagMetaMinimal}}
			if resp, err := router.ReadNode(ensureCtx, request); err == nil {
				loaded = append(loaded, resp.GetNode().WithoutReservedMetas())
			} else {
				log.Logger(ctx).Warn("Share Load - Ignoring Root Node, probably not synced yet", zap.String("nodeId", rid), zap.Error(err))
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

// ContextualizeRootToWorkspace looks up inside the node AppearsIn metadata to replace absolute path with relative one
func (sc *Client) contextualizeRootToWorkspace(node *tree.Node, workspaceUUID string, pathPrefixes ...string) bool {
	for _, ai := range node.AppearsIn {
		test := path.Join(ai.WsSlug, ai.Path)
		if ai.Path == "" {
			test += "/"
		}
		if len(pathPrefixes) > 0 {
			for _, pp := range pathPrefixes {
				if strings.HasPrefix(test, pp) {
					node.Path = test
					return true
				}
			}
		} else if workspaceUUID == "" || ai.WsUuid == workspaceUUID {
			node.Path = test
			return true
		}
	}
	return false
}

// ServiceParseRootNodes is similar to ParseRootNodes but it sends a call to a deported service instead of
// using the local nodes.Client
func (sc *Client) ServiceParseRootNodes(ctx context.Context, cell *rest.Cell, createEmpty bool) (bool, error) {
	client := share.NewShareServiceClient(grpc.ResolveConn(ctx, common.ServiceShareGRPC))
	resp, er := client.ParseRoots(ctx, &share.ParseRootsRequest{
		CreateEmpty: createEmpty,
		CreateLabel: cell.Label,
		Nodes:       cell.RootNodes,
	})
	if er != nil {
		return false, er
	}
	parsedRoots := resp.GetNodes()
	hasReadonly, err := sc.CheckWriteAllowedOnRoots(ctx, parsedRoots, cell.ACLs)
	if err != nil {
		return false, err
	}
	cell.RootNodes = parsedRoots
	log.Logger(ctx).Debug("ParseRootNodes", log.DangerouslyZapSmallSlice("r", cell.RootNodes), zap.Bool("readonly", hasReadonly))
	return hasReadonly, nil

}

// ParseRootNodes reads the request property to either create a new node using the "rooms" Virtual node,
// or just verify that the root nodes are not empty.
func (sc *Client) ParseRootNodes(ctx context.Context, cell *rest.Cell, createEmpty bool) (bool, error) {

	router := compose.PathClient()
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

		manager := abstract.GetVirtualProvider()
		internalRouter := compose.PathClientAdmin()
		if root, exists := manager.ByUuid(ctx, "cells"); exists {
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
			metaClient := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
			if _, er := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: createResp.Node}); er != nil {
				return false, er
			}
			cell.RootNodes = append(cell.RootNodes, createResp.Node)
		} else {
			return false, errors.WithMessagef(errors.StatusInternalServerError, "Wrong configuration, missing rooms virtual node")
		}
	}
	if len(cell.RootNodes) == 0 {
		return false, errors.WithMessage(errors.InvalidParameters, "Wrong configuration, missing RootNodes in CellRequest")
	}
	hasReadonly, err := sc.CheckWriteAllowedOnRoots(ctx, cell.RootNodes, cell.ACLs)
	if err != nil {
		return false, err
	}
	log.Logger(ctx).Debug("ParseRootNodes", log.DangerouslyZapSmallSlice("r", cell.RootNodes), zap.Bool("readonly", hasReadonly))
	return hasReadonly, nil

}

func (sc *Client) CheckWriteAllowedOnRoots(ctx context.Context, roots []*tree.Node, cellAcls map[string]*rest.CellAcl) (bool, error) {

	var hasReadonly bool
	for _, root := range roots {
		if root.GetStringMeta(common.MetaFlagReadonly) != "" {
			hasReadonly = true
		}
	}
	if hasReadonly {
		for _, a := range cellAcls {
			for _, action := range a.GetActions() {
				if action.Name == permissions.AclWrite.Name {
					return false, errors.WithMessage(errors.PathReadonly, "One of the resource you are sharing is readonly. You cannot assign write permission on this Cell.")
				}
			}
		}
	}
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
		claims, ok := claim.FromContext(ctx)
		if !ok {
			return "", errors.WithStack(errors.MissingClaims)
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
			for _, a := range acls {
				if a.RoleID == role.Uuid && a.Action.Name == "default-cells-policy" {
					parentPol = strings.TrimPrefix(strings.Trim(a.Action.Value, `"`), "policy:")
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
func (sc *Client) DeleteRootNodeRecursively(ctx context.Context, ownerUser *idm.User, roomNode *tree.Node) error {

	manager := abstract.GetVirtualProvider()
	root, exists := manager.ByUuid(ctx, "cells")
	if !exists {
		return errors.WithMessage(errors.StatusInternalServerError, "Root node does not exist")
	}
	parentNode, err := manager.ResolveInContext(auth.WithImpersonate(ctx, ownerUser), root, true)
	if err != nil {
		return err
	}
	router := compose.UuidClient(nodes.AsAdmin())
	resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: roomNode.GetUuid()}, StatFlags: []uint32{tree.StatFlagNone}})
	if er != nil {
		return er
	}
	if !strings.HasPrefix(resp.Node.GetPath(), parentNode.GetPath()) {
		return fmt.Errorf("resolved root node is not a cells template path child, this is not normal")
	}

	log.Logger(ctx).Info("Cell Deletion implies removing custom node", resp.Node.Zap())

	// Now send deletion to scheduler
	crtUser := claim.UserNameFromContext(ctx)
	// Now send deletion to scheduler
	cli := jobsc.JobServiceClient(ctx)
	jobUuid := "cells-delete-" + uuid.New()
	q, _ := anypb.New(&tree.Query{
		Paths: []string{resp.GetNode().GetPath()},
	})
	job := &jobs.Job{
		ID:             jobUuid,
		Owner:          crtUser,
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
	if _, er = cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
		return er
	}
	return nil
}

// CheckLinkRootNodes loads the root nodes and check if one of the is readonly. If so, check that
// link permissions do not try to set the Upload mode.
func (sc *Client) CheckLinkRootNodes(ctx context.Context, link *rest.ShareLink) (workspaces []*tree.WorkspaceRelativePath, files, folders bool, e error) {

	router := sc.getUuidRouter(ctx)
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
	router := sc.getUuidRouter(ctx)
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
	router := compose.UuidClient(nodes.AsAdmin())
	metaClient := treec.ServiceNodeProviderClient(ctx, common.ServiceMeta)
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
