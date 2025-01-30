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

package version

import (
	"context"
	"io"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	grpc2 "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

func WithVersions() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &Handler{})
	}
}

// Handler capture ListNodes and GetObject calls to find existing nodes versions and retrieve them.
type Handler struct {
	abstract.Handler
	versionClient tree.NodeVersionerClient
}

func (v *Handler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func (v *Handler) getVersionClient(ctx context.Context) tree.NodeVersionerClient {
	return tree.NewNodeVersionerClient(grpc2.ResolveConn(ctx, common.ServiceVersionsGRPC))
}

// ListNodes creates a list of nodes if the Versions are required
func (v *Handler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	ctx, err := v.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	if in.WithVersions {
		streamer := nodes.NewWrappingStreamer(ctx)
		resp, e := v.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: in.Node})
		if e != nil {
			return streamer, e
		}
		versionStream, er := v.getVersionClient(ctx).ListVersions(ctx, &tree.ListVersionsRequest{Node: resp.Node})
		if er != nil {
			return streamer, er
		}
		go func() {
			defer streamer.CloseSend()
			_ = commons.ForEach(versionStream, nil, func(vResp *tree.ListVersionsResponse) error {
				log.Logger(ctx).Debug("received version", zap.Any("version", vResp))
				vNode := resp.Node.Clone()
				vNode.Etag = vResp.Version.ETag
				vNode.MTime = vResp.Version.MTime
				vNode.Size = vResp.Version.Size
				vNode.MustSetMeta(common.MetaNamespaceVersionId, vResp.Version.VersionId)
				vNode.MustSetMeta(common.MetaNamespaceVersionDesc, vResp.Version.Description)
				if vResp.Version.Draft {
					vNode.MustSetMeta(common.MetaNamespaceVersionDraft, true)
				}
				return streamer.Send(&tree.ListNodesResponse{
					Node: vNode,
				})
			})
		}()
		return streamer, nil

	} else {
		return v.Next.ListNodes(ctx, in, opts...)
	}

}

// ReadNode retrieves information about a specific version
func (v *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {

	if vId := req.Node.GetStringMeta(common.MetaNamespaceVersionId); vId != "" {
		// Load Info from Version Service?
		log.Logger(ctx).Debug("Reading Node with Version ID", zap.String("versionId", vId))
		node := req.Node
		if len(node.Uuid) == 0 {
			resp, e := v.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				return nil, e
			}
			node = resp.Node
		}
		log.Logger(ctx).Debug("Reading Node with Version ID - Found node")
		vResp, err := v.getVersionClient(ctx).HeadVersion(ctx, &tree.HeadVersionRequest{NodeUuid: node.GetUuid(), VersionId: vId})
		if err != nil {
			return nil, err
		}
		log.Logger(ctx).Debug("Reading Node with Version ID - Found version", zap.Any("version", vResp.Version))
		node.Etag = vResp.Version.ETag
		node.MTime = vResp.Version.MTime
		node.Size = vResp.Version.Size
		return &tree.ReadNodeResponse{Node: node}, nil

	}

	return v.Next.ReadNode(ctx, req, opts...)
}

// GetObject redirects to Version Store if request contains a VersionID
func (v *Handler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, err := v.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	if len(requestData.VersionId) > 0 {

		// We are trying to load a specific versionId => switch to vID store
		if len(node.Uuid) == 0 {
			resp, e := v.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				return nil, e
			}
			node = resp.Node
		}
		vResp, err := v.getVersionClient(ctx).HeadVersion(ctx, &tree.HeadVersionRequest{NodeUuid: node.GetUuid(), VersionId: requestData.VersionId})
		if err != nil {
			return nil, err
		}
		node = vResp.Version.GetLocation()
		// Append Version information
		node.Size = vResp.Version.Size
		node.Etag = vResp.Version.ETag
		node.MTime = vResp.Version.MTime
		// Refresh context from location
		dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
		source, e := nodes.GetSourcesPool(ctx).GetDataSourceInfo(dsName)
		if e != nil {
			return nil, e
		}
		branchInfo := nodes.BranchInfo{LoadedSource: source}
		ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)
		log.Logger(ctx).Debug("GetObject With VersionId", zap.Any("node", node))
	}
	return v.Next.GetObject(ctx, node, requestData)

}

// CopyObject intercept request with a SrcVersionId to read original from Version Store
func (v *Handler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	ctx, err := v.WrapContext(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	log.Logger(ctx).Debug("CopyObject Has VersionId?", zap.Any("from", from), zap.Any("to", to), zap.Any("requestData", requestData))
	if len(requestData.SrcVersionId) > 0 {

		// We are trying to load a specific versionId => switch to vID store
		if len(from.Uuid) == 0 {
			resp, e := v.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: from})
			if e != nil {
				return models.ObjectInfo{}, e
			}
			from = resp.Node
		}
		vResp, err := v.getVersionClient(ctx).HeadVersion(ctx, &tree.HeadVersionRequest{NodeUuid: from.GetUuid(), VersionId: requestData.SrcVersionId})
		if err != nil {
			return models.ObjectInfo{}, err
		}
		if requestData.Metadata == nil {
			requestData.Metadata = make(map[string]string, 1)
		}
		requestData.Metadata[common.XAmzMetaNodeUuid] = from.Uuid // Make sure to keep Uuid!
		if h := vResp.GetVersion().GetLocation().GetStringMeta(common.MetaNamespaceHash); h != "" {
			// log.Logger(ctx).Info("Setting MetaNamespaceHash in CopyRequest meta")
			requestData.Metadata[common.MetaNamespaceHash] = h
		}
		from = vResp.GetVersion().GetLocation()
		// Refresh context from location
		source, e := nodes.GetSourcesPool(ctx).GetDataSourceInfo(from.GetStringMeta(common.MetaNamespaceDatasourceName))
		if e != nil {
			return models.ObjectInfo{}, e
		}
		srcInfo := nodes.BranchInfo{LoadedSource: source}
		ctx = nodes.WithBranchInfo(ctx, "from", srcInfo)
		log.Logger(ctx).Debug("CopyObject With VersionId", zap.Any("from", from), zap.Any("branchInfo", srcInfo), zap.Any("to", to))
	}

	return v.Next.CopyObject(ctx, from, to, requestData)
}

func (v *Handler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	ctx, err := v.WrapContext(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	if !nodes.IsFlatStorage(ctx, "in") {
		return v.Next.PutObject(ctx, node, reader, requestData)
	}

	if requestData.Metadata[common.XAmzMetaPrefix+common.InputDraftMode] == "true" {

		versionId := requestData.Metadata[common.XAmzMetaPrefix+common.InputVersionId]
		if versionId == "" {
			versionId = uuid.New()
		}
		clone := node.Clone()
		if clone.GetStringMeta(common.MetaNamespaceDatasourceName) == "" {
			branchInfo, _ := nodes.GetBranchInfo(ctx, "in")
			clone.MustSetMeta(common.MetaNamespaceDatasourceName, branchInfo.Name)
		}

		// CreateVersion (not stored yet)
		u, claims := permissions.FindUserNameInContext(ctx)
		vr, er := v.getVersionClient(ctx).CreateVersion(ctx, &tree.CreateVersionRequest{
			Node:         clone,
			VersionUuid:  versionId,
			OwnerName:    u,
			OwnerUuid:    claims.Subject,
			Draft:        true,
			TriggerEvent: &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: clone},
		})
		if er != nil {
			return models.ObjectInfo{}, er
		}
		revision := vr.GetVersion()
		revision.MTime = time.Now().Unix()
		revision.Size = requestData.Size

		// Refresh target and context from location
		newTarget := vr.GetVersion().GetLocation()
		source, e := nodes.GetSourcesPool(ctx).GetDataSourceInfo(newTarget.GetStringMeta(common.MetaNamespaceDatasourceName))
		if e != nil {
			return models.ObjectInfo{}, e
		}
		ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
		log.Logger(ctx).Info("PutObject With VersionId "+versionId+" will update to new target in "+source.Name, revision.Zap(), newTarget.Zap())
		oi, er := v.Next.PutObject(ctx, newTarget, reader, requestData)
		if er != nil {
			return models.ObjectInfo{}, er
		}
		if ex, o := reader.(common.ReaderMetaExtractor); o {
			if mm, ok := ex.ExtractedMeta(); ok && mm[common.MetaNamespaceHash] != "" {
				log.Logger(ctx).Info("Update revision with computed ETag" + mm[common.MetaNamespaceHash])
				revision.ETag = mm[common.MetaNamespaceHash]
			}
		}
		// Now store version
		_, er = v.getVersionClient(ctx).StoreVersion(ctx, &tree.StoreVersionRequest{Node: clone, Version: revision})

		return oi, er

	}
	return v.Next.PutObject(ctx, node, reader, requestData)
}
