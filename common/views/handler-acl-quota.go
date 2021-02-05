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

package views

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

type AclQuotaFilter struct {
	AbstractHandler
}

// PutObject checks quota on PutObject operation.
func (a *AclQuotaFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {

	// Note : as the temporary file created by PutHandler is already in index,
	// currentUsage ALREADY takes into account the input data size.

	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && !branchInfo.Binary {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, &branchInfo.Workspace); err != nil {
			return 0, err
		} else if maxQuota > 0 && currentUsage > maxQuota {
			return 0, errors.New("quota.exceeded", fmt.Sprintf("Your allowed quota of %d is reached", maxQuota), 422)
		}
	}

	return a.next.PutObject(ctx, node, reader, requestData)
}

// MultipartPutObjectPart checks quota on MultipartPutObjectPart.
func (a *AclQuotaFilter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {

	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && !branchInfo.Binary {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, &branchInfo.Workspace); err != nil {
			return minio.ObjectPart{}, err
		} else if maxQuota > 0 && currentUsage > maxQuota {
			return minio.ObjectPart{}, errors.New("quota.exceeded", fmt.Sprintf("Your allowed quota of %d is reached", maxQuota), 422)
		}
	}

	return a.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

// CopyObject checks quota on CopyObject operation.
func (a *AclQuotaFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {

	if branchInfo, ok := GetBranchInfo(ctx, "to"); ok && !branchInfo.Binary {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, &branchInfo.Workspace); err != nil {
			return 0, err
		} else if maxQuota > 0 && currentUsage+from.Size > maxQuota {
			return 0, errors.New("quota.exceeded", fmt.Sprintf("Your allowed quota of %d is reached", maxQuota), 422)
		}
	}

	return a.next.CopyObject(ctx, from, to, requestData)
}

// WrappedCanApply will perform checks on quota to make sure an operation is authorized
func (a *AclQuotaFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	switch operation.GetType() {
	case tree.NodeChangeEvent_CREATE:
		targetNode := operation.GetTarget()
		if bI, ok := GetBranchInfo(targetCtx, "in"); ok && !bI.Binary {
			if maxQuota, currentUsage, err := a.ComputeQuota(targetCtx, &bI.Workspace); err != nil {
				return err
			} else if maxQuota > 0 && currentUsage+targetNode.Size > maxQuota {
				return errors.New("quota.exceeded", fmt.Sprintf("Your allowed quota of %d is reached", maxQuota), 422)
			}
		}
	case tree.NodeChangeEvent_UPDATE_PATH:
		src, o := GetBranchInfo(srcCtx, "from")
		tgt, o2 := GetBranchInfo(targetCtx, "to")
		if o && o2 && src.Workspace.UUID != tgt.Workspace.UUID {
			log.Logger(srcCtx).Info("Move across workspace, check quota on target!")
			if maxQuota, currentUsage, err := a.ComputeQuota(targetCtx, &tgt.Workspace); err != nil {
				return err
			} else if maxQuota > 0 && currentUsage+operation.GetTarget().Size > maxQuota {
				return errors.New("quota.exceeded", fmt.Sprintf("Your allowed quota of %d is reached", maxQuota), 422)
			}
		}
	}
	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}

// ComputeQuota finds quota and current usage for a given workspace
func (a *AclQuotaFilter) ComputeQuota(ctx context.Context, workspace *idm.Workspace) (quota int64, usage int64, err error) {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok {
		return
	}
	orderedRoles := strings.Split(claims.Roles, ",")

	q, u, e := a.QuotaForWorkspace(ctx, workspace, orderedRoles)
	if e != nil {
		err = e
		return
	}
	if q > 0 {
		log.Logger(ctx).Debug("got quota from current workspace", zap.Int64("q", q), zap.Int64("u", u))
		return q, u, nil
	}
	var ownerUuid string
	for _, p := range workspace.Policies {
		if p.Action == service.ResourcePolicyAction_OWNER {
			ownerUuid = p.Subject
		}
	}
	if ownerUuid == "" {
		return
	}

	// Recurse to parents
	parents, parentContext, e := a.FindParentWorkspaces(ctx, workspace)
	if e != nil {
		err = e
		return
	}
	for _, parent := range parents {
		if pQ, pU, pE := a.ComputeQuota(parentContext, parent); pE != nil {
			return 0, 0, pE
		} else if pQ > 0 {
			log.Logger(ctx).Debug("got quota from parent workspace", zap.Int64("q", pQ), zap.Int64("u", pU))
			return pQ, pU, nil
		}
	}

	return
}

// FindParentWorkspaces finds possible parents for the current workspace based on the RESOURCE_OWNER uuid.
// TODO: add virtual nodes manager.
func (a *AclQuotaFilter) FindParentWorkspaces(ctx context.Context, workspace *idm.Workspace) (parentWorkspaces []*idm.Workspace, parentContext context.Context, err error) {

	var ownerUuid string
	for _, p := range workspace.Policies {
		if p.Action == service.ResourcePolicyAction_OWNER {
			ownerUuid = p.Subject
		}
	}
	if ownerUuid == "" {
		return
	}

	ownerAcls, userObject, e := permissions.AccessListFromUser(ctx, ownerUuid, true)
	if e != nil {
		err = e
		return
	}
	log.Logger(ctx).Debug("AccessList From User", zap.Any("ownerUuid", ownerUuid), zap.Any("accessList", ownerAcls))

	var roleIds []string
	for _, r := range ownerAcls.OrderedRoles {
		roleIds = append(roleIds, r.Uuid)
	}
	claims := claim.Claims{
		Name:      userObject.Login,
		Roles:     strings.Join(roleIds, ","),
		GroupPath: userObject.GroupPath,
	}
	parentContext = context.WithValue(ctx, claim.ContextKey, claims)

	vManager := GetVirtualNodesManager()
	ownerWsRoots := make(map[string]*idm.Workspace)
	for _, ws := range ownerAcls.Workspaces {
		for _, originalRoot := range ws.RootUUIDs {
			realId := originalRoot
			if virtual, exists := vManager.ByUuid(originalRoot); exists {
				resolvedRoot, e := vManager.ResolveInContext(parentContext, virtual, a.clientsPool, false)
				if e != nil {
					err = e
					return
				}
				log.Logger(ctx).Debug("Updating Access List with resolved node Uuid", zap.Any("resolved", resolvedRoot))
				realId = resolvedRoot.Uuid
			}
			if aclNodeMask, has := ownerAcls.GetNodesBitmasks()[originalRoot]; has && aclNodeMask.HasFlag(ctx, permissions.FlagRead) && !aclNodeMask.HasFlag(ctx, permissions.FlagDeny) {
				ownerWsRoots[realId] = ws
			}
		}
	}

	treeClient := tree.NewNodeProviderClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())
	for _, root := range workspace.RootUUIDs {

		if virtual, exists := vManager.ByUuid(root); exists {
			resolvedRoot, e := vManager.ResolveInContext(ctx, virtual, a.clientsPool, false)
			if e != nil {
				err = e
				return
			}
			log.Logger(ctx).Debug("Updating Workspace Root To", zap.Any("resolved", resolvedRoot))
			root = resolvedRoot.Uuid
		}

		ancestors, er := BuildAncestorsList(ctx, treeClient, &tree.Node{Uuid: root})
		if er != nil {
			log.Logger(ctx).Error("AncestorsList for rootNode", zap.Any("r", root), zap.Any("ancestors", ancestors), zap.Any("ownerWsRoots", ownerWsRoots))
			err = er
			return
		}
		for _, ancestor := range ancestors {
			if ws, has := ownerWsRoots[ancestor.Uuid]; has && ws.UUID != workspace.UUID {
				parentWorkspaces = append(parentWorkspaces, ws)
			}
		}
		log.Logger(ctx).Debug("Workspace Parents?", zap.Any("parents", parentWorkspaces))
		if len(parentWorkspaces) > 0 {
			return parentWorkspaces, parentContext, nil
		}
	}

	return
}

// QuotaForWorkspace finds quota and computes current usage from ACLs and Tree for a given workspace, in a specific context
// given by the orderedRoles list.
func (a *AclQuotaFilter) QuotaForWorkspace(ctx context.Context, workspace *idm.Workspace, orderedRoles []string) (maxQuota int64, currentUsage int64, err error) {

	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	q2, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{WorkspaceIDs: []string{workspace.UUID}})
	stream, er := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q2}}})
	if er != nil {
		err = er
		return
	}
	log.Logger(ctx).Debug("Searching Quota ACLs for", zap.Any("q", q2))
	roleValues := make(map[string]string)
	detectedRoots := make(map[string]bool)

	defer stream.Close()
	for {
		resp, e := stream.Recv()
		if e != nil {
			break
		}
		if resp.ACL.Action.Name == permissions.AclQuota.Name {
			if resp.ACL.Action.Value != "" {
				roleValues[resp.ACL.RoleID] = resp.ACL.Action.Value
			}
		} else if resp.ACL.NodeID != "" {
			detectedRoots[resp.ACL.NodeID] = true
		}
	}

	if len(roleValues) == 0 {
		return
	}

	for _, r := range orderedRoles {
		if val, ok := roleValues[r]; ok {
			if intVal, e := strconv.ParseInt(val, 10, 64); e != nil {
				err = e
				return
			} else {
				maxQuota = intVal
			}
		}
	}

	vManager := GetVirtualNodesManager()
	if maxQuota > 0 {
		log.Logger(ctx).Debug("Found Quota", zap.Any("q", maxQuota), zap.Any("roots", detectedRoots))
		treeClient := tree.NewNodeProviderClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())
		for nodeId, _ := range detectedRoots {
			var rootNode *tree.Node
			if root, exists := vManager.ByUuid(nodeId); exists {
				if rootNode, err = vManager.ResolveInContext(ctx, root, a.clientsPool, false); err != nil {
					return
				}
			} else {
				if resp, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeId}}); e != nil {
					err = e
					return
				} else {
					rootNode = resp.Node
				}
			}
			if rootNode != nil {
				currentUsage += rootNode.GetSize()
			}
		}
	}

	return
}
