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

package views

import (
	"context"
	"io"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

// VersionHandler capture ListNodes and GetObject calls to find existing nodes versions and retrieve them.
type VersionHandler struct {
	AbstractHandler
	versionClient tree.NodeVersionerClient
}

func (v *VersionHandler) getVersionClient() tree.NodeVersionerClient {
	if v.versionClient == nil {
		v.versionClient = tree.NewNodeVersionerClient(common.ServiceGrpcNamespace_+common.ServiceVersions, defaults.NewClient())
	}
	return v.versionClient
}

// Create list of nodes if the Versions are required
func (v *VersionHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	ctx, err := v.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	if in.WithVersions {

		streamer := NewWrappingStreamer()
		resp, e := v.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: in.Node})
		if e != nil {
			return streamer, e
		}
		versionStream, er := v.getVersionClient().ListVersions(ctx, &tree.ListVersionsRequest{Node: resp.Node})
		if er != nil {
			return streamer, er
		}
		go func() {
			defer versionStream.Close()
			defer streamer.Close()

			log.Logger(ctx).Debug("should list versions of object", zap.Any("node", resp.Node), zap.Error(er))
			for {
				vResp, vE := versionStream.Recv()
				if vE != nil {
					break
				}
				if vResp == nil {
					continue
				}
				log.Logger(ctx).Debug("received version", zap.Any("version", vResp))
				vNode := resp.Node
				vNode.Etag = string(vResp.Version.Data)
				vNode.MTime = vResp.Version.MTime
				vNode.Size = vResp.Version.Size
				vNode.SetMeta("versionId", vResp.Version.Uuid)
				vNode.SetMeta("versionDescription", vResp.Version.Description)
				streamer.Send(&tree.ListNodesResponse{
					Node: vNode,
				})
			}
		}()
		return streamer, nil

	} else {
		return v.next.ListNodes(ctx, in, opts...)
	}

}

func (v *VersionHandler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	if vId := req.Node.GetStringMeta("versionId"); vId != "" {
		// Load Info from Version Service?
		log.Logger(ctx).Debug("Reading Node with Version ID", zap.String("versionId", vId))
		node := req.Node
		if len(node.Uuid) == 0 {
			resp, e := v.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				return nil, e
			}
			node = resp.Node
		}
		log.Logger(ctx).Debug("Reading Node with Version ID - Found node")
		vResp, err := v.getVersionClient().HeadVersion(ctx, &tree.HeadVersionRequest{Node: node, VersionId: vId})
		if err != nil {
			return nil, err
		}
		log.Logger(ctx).Debug("Reading Node with Version ID - Found version", zap.Any("version", vResp.Version))
		node.Etag = string(vResp.Version.Data)
		node.MTime = vResp.Version.MTime
		node.Size = vResp.Version.Size
		return &tree.ReadNodeResponse{Node: node}, nil

	}

	return v.next.ReadNode(ctx, req, opts...)
}

// GetObject redirects to Version Store if request contains a VersionID
func (v *VersionHandler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, err := v.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	if len(requestData.VersionId) > 0 {

		// We are trying to load a specific versionId => switch to vID store
		if len(node.Uuid) == 0 {
			resp, e := v.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				return nil, e
			}
			node = resp.Node
		}
		vResp, err := v.getVersionClient().HeadVersion(ctx, &tree.HeadVersionRequest{Node: node, VersionId: requestData.VersionId})
		if err != nil {
			return nil, err
		}
		node = vResp.Version.GetLocation()
		// Append Version information
		node.Size = vResp.Version.Size
		node.Etag = string(vResp.Version.Data)
		node.MTime = vResp.Version.MTime
		// Refresh context from location
		dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
		source, e := v.clientsPool.GetDataSourceInfo(dsName)
		if e != nil {
			return nil, e
		}
		branchInfo := BranchInfo{LoadedSource: source}
		ctx = WithBranchInfo(ctx, "in", branchInfo)
		log.Logger(ctx).Debug("GetObject With VersionId", zap.Any("node", node))
	}
	return v.next.GetObject(ctx, node, requestData)

}

// CopyObject intercept request with a SrcVersionId to read original from Version Store
func (v *VersionHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	ctx, err := v.wrapContext(ctx)
	if err != nil {
		return 0, err
	}
	log.Logger(ctx).Debug("CopyObject Has VersionId?", zap.Any("from", from), zap.Any("to", to), zap.Any("requestData", requestData))
	if len(requestData.SrcVersionId) > 0 {

		// We are trying to load a specific versionId => switch to vID store
		if len(from.Uuid) == 0 {
			resp, e := v.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: from})
			if e != nil {
				return 0, e
			}
			from = resp.Node
		}
		vResp, err := v.getVersionClient().HeadVersion(ctx, &tree.HeadVersionRequest{Node: from, VersionId: requestData.SrcVersionId})
		if err != nil {
			return 0, err
		}
		if requestData.Metadata == nil {
			requestData.Metadata = make(map[string]string, 1)
		}
		requestData.Metadata[common.XAmzMetaNodeUuid] = from.Uuid // Make sure to keep Uuid!
		from = vResp.GetVersion().GetLocation()
		// Refresh context from location
		source, e := v.clientsPool.GetDataSourceInfo(from.GetStringMeta(common.MetaNamespaceDatasourceName))
		if e != nil {
			return 0, e
		}
		srcInfo := BranchInfo{LoadedSource: source}
		ctx = WithBranchInfo(ctx, "from", srcInfo)
		log.Logger(ctx).Debug("CopyObject With VersionId", zap.Any("from", from), zap.Any("branchInfo", srcInfo), zap.Any("to", to))
	}

	return v.next.CopyObject(ctx, from, to, requestData)
}
