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
	"fmt"
	"io"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	grpc2 "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	partsCacheConf = cache.Config{
		Eviction:    "48h",
		CleanWindow: "24h",
	}
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
			_ = commons.ForEach(versionStream, er, func(vResp *tree.ListVersionsResponse) error {
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

	}

	sflags := tree.StatFlags(in.GetStatFlags())
	if sflags.Versions() {
		streamer := nodes.NewWrappingStreamer(ctx)
		st, e := v.Next.ListNodes(ctx, in, opts...)
		if e != nil {
			return st, e
		}
		go func() {
			defer streamer.CloseSend()
			_ = commons.ForEach(st, e, func(vResp *tree.ListNodesResponse) error {
				vNode := vResp.GetNode().Clone()
				var ff map[string]string
				if filter := sflags.VersionsFilter(); filter != "" {
					ff = map[string]string{"draftStatus": "\"" + filter + "\""}
				}
				versionStream, er := v.getVersionClient(ctx).ListVersions(ctx, &tree.ListVersionsRequest{Node: vResp.GetNode(), Filters: ff})
				var vv []*tree.ContentRevision
				if ver := commons.ForEach(versionStream, er, func(vResp *tree.ListVersionsResponse) error {
					vv = append(vv, vResp.GetVersion())
					return nil
				}); ver != nil {
					return ver
				}
				if len(vv) > 0 {
					vNode.MustSetMeta(common.MetaNamespaceContentRevisions, vv)
				}
				return streamer.Send(&tree.ListNodesResponse{Node: vNode})
			})
		}()

		return streamer, nil
	}

	return v.Next.ListNodes(ctx, in, opts...)

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

	sflags := tree.StatFlags(req.GetStatFlags())
	if sflags.Versions() {

		resp, er := v.Next.ReadNode(ctx, req, opts...)
		if er != nil {
			return nil, er
		}
		respNode := resp.GetNode().Clone()
		var ff map[string]string
		if filter := sflags.VersionsFilter(); filter != "" {
			ff = map[string]string{"draftStatus": "\"" + filter + "\""}
		}
		versionStream, er := v.getVersionClient(ctx).ListVersions(ctx, &tree.ListVersionsRequest{Node: resp.GetNode(), Filters: ff})
		var vv []*tree.ContentRevision
		if ver := commons.ForEach(versionStream, er, func(vResp *tree.ListVersionsResponse) error {
			vv = append(vv, vResp.GetVersion())
			return nil
		}); ver != nil {
			return nil, ver
		}
		if len(vv) > 0 {
			respNode.MustSetMeta(common.MetaNamespaceContentRevisions, vv)
		}
		return &tree.ReadNodeResponse{Node: respNode}, nil
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
		if h := vResp.GetVersion().GetContentHash(); h != "" {
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
		nodes.MustEnsureDatasourceMeta(ctx, node, "in")
		newTarget, revision, source, er := v.routeUploadToContentRevision(ctx, node.Clone(), requestData.Metadata, requestData.Size)
		if er != nil {
			return models.ObjectInfo{}, er
		}
		ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
		log.Logger(ctx).Info("PutObject With VersionId "+revision.VersionId+" will update to new target in "+source.Name, revision.Zap(), newTarget.Zap())
		oi, er := v.Next.PutObject(ctx, newTarget, reader, requestData)
		if er != nil {
			return models.ObjectInfo{}, er
		}
		revision.ETag = oi.ETag
		if ex, o := reader.(common.ReaderMetaExtractor); o {
			if mm, ok := ex.ExtractedMeta(); ok && mm[common.MetaNamespaceHash] != "" {
				log.Logger(ctx).Info("Update revision with computed Hash" + mm[common.MetaNamespaceHash])
				revision.ContentHash = mm[common.MetaNamespaceHash]
			}
		}
		// Now store version
		_, er = v.getVersionClient(ctx).StoreVersion(ctx, &tree.StoreVersionRequest{Node: node, Version: revision})

		return oi, er

	}
	return v.Next.PutObject(ctx, node, reader, requestData)
}

func (v *Handler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {

	if nodes.IsFlatStorage(ctx, "in") && requestData.Metadata[common.XAmzMetaPrefix+common.InputDraftMode] == "true" {
		nodes.MustEnsureDatasourceMeta(ctx, node, "in")
		target, revision, source, er := v.routeUploadToContentRevision(ctx, node.Clone(), requestData.Metadata, 0)
		if er != nil {
			return "", er
		}
		ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
		uploadId, err := v.Next.MultipartCreate(ctx, target, requestData)
		if err != nil {
			return "", err
		}
		ca, er := v.multipartCache(ctx)
		if er != nil {
			return "", er
		}
		if er = v.cacheProto(ca, uploadId+"-target", target); er != nil {
			return "", er
		}
		if er = v.cacheProto(ca, uploadId+"-revision", revision); er != nil {
			return "", er
		}
		log.Logger(ctx).Debug("Create " + uploadId + " on " + target.GetPath())
		return uploadId, nil
	}
	return v.Next.MultipartCreate(ctx, node, requestData)
}

func (v *Handler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	log.Logger(ctx).Debug("Receive ObjectPart " + uploadID + " on " + target.GetPath())
	if nodes.IsFlatStorage(ctx, "in") {
		ca, er := v.multipartCache(ctx)
		if er != nil {
			return models.MultipartObjectPart{}, er
		}
		newTarget := &tree.Node{}
		if v.protoFromCache(ca, uploadID+"-target", newTarget) == nil {
			log.Logger(ctx).Debug("Switching PutObjectPart target", newTarget.Zap("newTarget"))
			source, err := nodes.GetSourcesPool(ctx).GetDataSourceInfo(newTarget.GetStringMeta(common.MetaNamespaceDatasourceName))
			if err != nil {
				return models.MultipartObjectPart{}, err
			}
			ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
			return v.Next.MultipartPutObjectPart(ctx, newTarget, uploadID, partNumberMarker, reader, requestData)
		}
	}
	return v.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (v *Handler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	if nodes.IsFlatStorage(ctx, "in") {
		ca, er := v.multipartCache(ctx)
		if er != nil {
			return models.ObjectInfo{}, er
		}
		newTarget := &tree.Node{}
		if v.protoFromCache(ca, uploadID+"-target", newTarget) == nil {
			nodes.MustEnsureDatasourceMeta(ctx, target, "in")

			source, err := nodes.GetSourcesPool(ctx).GetDataSourceInfo(newTarget.GetStringMeta(common.MetaNamespaceDatasourceName))
			if err != nil {
				return models.ObjectInfo{}, err
			}
			revision := &tree.ContentRevision{}
			if v.protoFromCache(ca, uploadID+"-revision", revision) != nil {
				return models.ObjectInfo{}, errors.WithMessage(errors.VersionNotFound, "error while loading version from cache")
			}
			log.Logger(ctx).Info("Switching MultipartComplete target", newTarget.Zap("newTarget"))
			ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
			defer func() {
				_ = ca.Delete(uploadID + "-target")
				_ = ca.Delete(uploadID + "-revision")
			}()
			oi, e := v.Next.MultipartComplete(ctx, newTarget, uploadID, uploadedParts)
			if e != nil {
				return oi, err
			}
			// Now update ETag and Store revision
			revision.ETag = oi.ETag
			revision.ContentHash = target.GetStringMeta(common.MetaNamespaceHash)
			_, er = v.getVersionClient(ctx).StoreVersion(ctx, &tree.StoreVersionRequest{Node: target, Version: revision})
			return oi, er
		}
	}

	return v.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (v *Handler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	if nodes.IsFlatStorage(ctx, "in") {
		ca, er := v.multipartCache(ctx)
		if er != nil {
			return er
		}
		newTarget := &tree.Node{}
		if v.protoFromCache(ca, uploadID+"-target", newTarget) == nil {
			source, err := nodes.GetSourcesPool(ctx).GetDataSourceInfo(newTarget.GetStringMeta(common.MetaNamespaceDatasourceName))
			if err != nil {
				return err
			}
			log.Logger(ctx).Info("Switching MultipartAbort target", newTarget.Zap("newTarget"))
			ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source})
			defer func() {
				_ = ca.Delete(uploadID + "-target")
				_ = ca.Delete(uploadID + "-revision")
			}()
			return v.Next.MultipartAbort(ctx, newTarget, uploadID, requestData)
		}
	}
	return v.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (v *Handler) routeUploadToContentRevision(ctx context.Context, node *tree.Node, userMeta map[string]string, knownSize int64) (*tree.Node, *tree.ContentRevision, nodes.LoadedSource, error) {
	versionId := userMeta[common.XAmzMetaPrefix+common.InputVersionId]
	if versionId == "" {
		versionId = uuid.New()
	}
	// CreateVersion (not stored yet)
	u, claims := permissions.FindUserNameInContext(ctx)
	vr, er := v.getVersionClient(ctx).CreateVersion(ctx, &tree.CreateVersionRequest{
		Node:         node,
		VersionUuid:  versionId,
		OwnerName:    u,
		OwnerUuid:    claims.Subject,
		Draft:        true,
		TriggerEvent: &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: node},
	})
	if er != nil {
		return nil, nil, nodes.LoadedSource{}, er
	}
	revision := vr.GetVersion()
	revision.MTime = time.Now().Unix()
	revision.Size = knownSize

	// Refresh target and context from location
	newTarget := vr.GetVersion().GetLocation()
	source, e := nodes.GetSourcesPool(ctx).GetDataSourceInfo(newTarget.GetStringMeta(common.MetaNamespaceDatasourceName))
	return newTarget, revision, source, e

}

// multipartCache initializes a cache for multipart hashes
func (v *Handler) multipartCache(ctx context.Context) (c cache.Cache, e error) {
	return cache_helper.ResolveCache(ctx, common.CacheTypeShared, partsCacheConf)
}

func (v *Handler) cacheProto(c cache.Cache, k string, m proto.Message) error {
	bb, er := proto.Marshal(m)
	if er != nil {
		return er
	}
	return c.Set(k, bb)
}

func (v *Handler) protoFromCache(c cache.Cache, k string, m proto.Message) error {
	var bb []byte
	if !c.Get(k, &bb) {
		return fmt.Errorf("cache entry not found")
	}
	return proto.Unmarshal(bb, m)
}
