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
	"io"
	"strconv"
	"strings"
	"sync"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

func WithQuota() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if !options.AdminView {
			options.Wrappers = append(options.Wrappers, &QuotaFilter{})
		}
	}
}

// QuotaFilter applies storage quota limitation on a per-workspace basis.
type QuotaFilter struct {
	abstract.Handler
	readCache *openurl.Pool[cache.Cache]
	once      sync.Once
}

func (a *QuotaFilter) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

// ReadNode append quota info on workspace roots
func (a *QuotaFilter) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	resp, err := a.Next.ReadNode(ctx, in, opts...)
	if err != nil {
		return resp, err
	}

	branch, be := nodes.GetBranchInfo(ctx, "in")
	if be != nil || branch.Workspace == nil || branch.UUID == "ROOT" || branch.Workspace.UUID == "" || branch.Root == nil || branch.Root.Uuid != resp.Node.Uuid {
		return resp, err
	}
	type qCache struct {
		no bool
		q  int64
		u  int64
	}
	var er error
	a.once.Do(func() {
		a.readCache, er = cache.OpenPool(runtime.ShortCacheURL("evictionTime", "30s", "cleanWindow", "3m"))
	})
	if er != nil {
		return nil, er
	}
	var cacheKey string
	ca, _ := a.readCache.Get(ctx)
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		cacheKey = branch.Workspace.UUID + "-" + claims.Name
		var qc *qCache
		if ca != nil && ca.Get(cacheKey, &qc) {
			if qc.no {
				return resp, nil
			}
			n := resp.Node.Clone()
			n.MustSetMeta("ws_quota", qc.q)
			n.MustSetMeta("ws_quota_usage", qc.u)
			resp.Node = n
			return resp, nil
		}
	}
	if q, u, e := a.ComputeQuota(ctx, branch.Workspace); e == nil && q > 0 {
		n := resp.Node.Clone()
		n.MustSetMeta("ws_quota", q)
		n.MustSetMeta("ws_quota_usage", u)
		resp.Node = n
		if ca != nil && cacheKey != "" {
			_ = ca.Set(cacheKey, &qCache{q: q, u: u})
		}
	} else if ca != nil && cacheKey != "" {
		_ = ca.Set(cacheKey, &qCache{no: true})
	}
	return resp, err
}

// PutObject checks quota on PutObject operation.
func (a *QuotaFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {

	// Note : as the temporary file created by PutHandler is already in index,
	// currentUsage ALREADY takes into account the input data size.

	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && !branchInfo.IsInternal() {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, branchInfo.Workspace); err != nil {
			return models.ObjectInfo{}, err
		} else if maxQuota > 0 && currentUsage > maxQuota {
			return models.ObjectInfo{}, errors.WithMessagef(errors.StatusQuotaReached, "Your allowed quota of %d is reached", maxQuota)
		}
	}

	return a.Next.PutObject(ctx, node, reader, requestData)
}

// MultipartPutObjectPart checks quota on MultipartPutObjectPart.
func (a *QuotaFilter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {

	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && !branchInfo.IsInternal() {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, branchInfo.Workspace); err != nil {
			return models.MultipartObjectPart{}, err
		} else if maxQuota > 0 && currentUsage > maxQuota {
			return models.MultipartObjectPart{}, errors.WithMessagef(errors.StatusQuotaReached, "Your allowed quota of %d is reached", maxQuota)
		}
	}

	return a.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

// CopyObject checks quota on CopyObject operation.
func (a *QuotaFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {

	if branchInfo, er := nodes.GetBranchInfo(ctx, "to"); er == nil && !branchInfo.IsInternal() {
		if maxQuota, currentUsage, err := a.ComputeQuota(ctx, branchInfo.Workspace); err != nil {
			return models.ObjectInfo{}, err
		} else if maxQuota > 0 && currentUsage+from.Size > maxQuota {
			return models.ObjectInfo{}, errors.WithMessagef(errors.StatusQuotaReached, "Your allowed quota of %d is reached", maxQuota)
		}
	}

	return a.Next.CopyObject(ctx, from, to, requestData)
}

// WrappedCanApply will perform checks on quota to make sure an operation is authorized
func (a *QuotaFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	switch operation.GetType() {
	case tree.NodeChangeEvent_CREATE:
		targetNode := operation.GetTarget()
		if bI, er := nodes.GetBranchInfo(targetCtx, "in"); er == nil && !bI.IsInternal() {
			if maxQuota, currentUsage, err := a.ComputeQuota(targetCtx, bI.Workspace); err != nil {
				return err
			} else if maxQuota > 0 && currentUsage+targetNode.Size > maxQuota {
				return errors.WithMessagef(errors.StatusQuotaReached, "Your allowed quota of %d is reached", maxQuota)
			}
		}
	case tree.NodeChangeEvent_UPDATE_PATH:
		src, er1 := nodes.GetBranchInfo(srcCtx, "from")
		tgt, er2 := nodes.GetBranchInfo(targetCtx, "to")
		if er1 == nil && er2 == nil && src.Workspace.UUID != tgt.Workspace.UUID {
			log.Logger(srcCtx).Info("Move across workspace, check quota on target!")
			if maxQuota, currentUsage, err := a.ComputeQuota(targetCtx, tgt.Workspace); err != nil {
				return err
			} else if maxQuota > 0 && currentUsage+operation.GetTarget().Size > maxQuota {
				return errors.WithMessagef(errors.StatusQuotaReached, "Your allowed quota of %d is reached", maxQuota)
			}
		}
	}
	return a.Next.WrappedCanApply(srcCtx, targetCtx, operation)
}

// ComputeQuota finds quota and current usage for a given workspace
func (a *QuotaFilter) ComputeQuota(ctx context.Context, workspace *idm.Workspace) (quota int64, usage int64, err error) {

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
func (a *QuotaFilter) FindParentWorkspaces(ctx context.Context, workspace *idm.Workspace) (parentWorkspaces []*idm.Workspace, parentContext context.Context, err error) {

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
	for _, r := range ownerAcls.GetRoles() {
		roleIds = append(roleIds, r.Uuid)
	}
	claims := claim.Claims{
		Name:      userObject.Login,
		Roles:     strings.Join(roleIds, ","),
		GroupPath: userObject.GroupPath,
	}
	parentContext = context.WithValue(ctx, claim.ContextKey, claims)
	vResolver := abstract.GetVirtualNodesManager(a.RuntimeCtx).GetResolver(false)
	ownerWsRoots := make(map[string]*idm.Workspace)

	for _, ws := range ownerAcls.GetWorkspaces() {
		for _, originalRoot := range ws.RootUUIDs {
			realId := originalRoot
			if n, o := vResolver(parentContext, &tree.Node{Uuid: realId}); o {
				realId = n.Uuid
			}
			if aclNodeMask, has := ownerAcls.GetNodesBitmasks()[originalRoot]; has && aclNodeMask.HasFlag(ctx, permissions.FlagRead) && !aclNodeMask.HasFlag(ctx, permissions.FlagDeny) {
				ownerWsRoots[realId] = ws
			}
		}
	}

	treeClient := treec.NodeProviderClient(ctx)
	for _, root := range workspace.RootUUIDs {
		if n, o := vResolver(ctx, &tree.Node{Uuid: root}); o {
			root = n.Uuid
		}
		ancestors, er := nodes.BuildAncestorsListOrParent(ctx, treeClient, &tree.Node{Uuid: root})
		if er != nil {
			log.Logger(ctx).Debug("AncestorsList for rootNode", zap.Any("r", root), zap.Int("ancestors length", len(ancestors)), zap.Any("ownerWsRoots", ownerWsRoots))
			err = er
			return
		}
		for _, ancestor := range ancestors {
			if ws, has := ownerWsRoots[ancestor.Uuid]; has && ws.UUID != workspace.UUID {
				parentWorkspaces = append(parentWorkspaces, ws)
			}
		}
		if len(parentWorkspaces) > 0 {
			return parentWorkspaces, parentContext, nil
		}
	}

	return
}

// QuotaForWorkspace finds quota and computes current usage from ACLs and Tree for a given workspace, in a specific context
// given by the orderedRoles list.
func (a *QuotaFilter) QuotaForWorkspace(ctx context.Context, workspace *idm.Workspace, orderedRoles []string) (maxQuota int64, currentUsage int64, err error) {

	aclClient := idmc.ACLServiceClient(ctx)
	q2, _ := anypb.New(&idm.ACLSingleQuery{WorkspaceIDs: []string{workspace.UUID}})
	stream, er := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q2}}})
	if er != nil {
		err = er
		return
	}
	log.Logger(ctx).Debug("Searching Quota ACLs for", zap.Any("q", q2))
	roleValues := make(map[string]string)
	detectedRoots := make(map[string]bool)

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

	if maxQuota > 0 {
		log.Logger(ctx).Debug("Found Quota", zap.Any("q", maxQuota), zap.Any("roots", detectedRoots))
		treeClient := treec.NodeProviderClient(ctx)
		resolver := abstract.GetVirtualNodesManager(a.RuntimeCtx).GetResolver(false)
		for nodeId := range detectedRoots {
			var rootNode *tree.Node
			if n, o := resolver(ctx, &tree.Node{Uuid: nodeId}); o {
				rootNode = n
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
