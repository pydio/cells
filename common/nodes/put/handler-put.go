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

package put

import (
	"bytes"
	"context"
	"io"
	"path"
	"strconv"
	"strings"
	"time"

	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/meta"
)

func WithPutInterceptor() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &Handler{})
	}
}

// Handler handles Put requests by creating temporary files in the index before forwarding data to the object service.
// This temporary entry is updated later on by the sync service, once the object is written. It is deleted if the Put operation fails.
type Handler struct {
	abstract.Handler
	metaClient meta.UserMetaClient
}

func (m *Handler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	m.AdaptOptions(c, options)
	return m
}

type onCreateErrorFunc func()

func (m *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	var ns string
	var nsOk bool
	var draftCtx context.Context
	var draftCa context.CancelFunc
	if bi, e := nodes.GetBranchInfo(ctx, "in"); e == nil && bi.Workspace != nil {
		draftCtx, draftCa = context.WithCancel(ctx)
		defer draftCa()
		go func() {
			defer draftCa()
			ns, nsOk = m.getMetaClient().DraftMetaNamespace(draftCtx, bi.Workspace)
		}()
	}

	resp, er := m.Next.ReadNode(ctx, req, opts...)
	if er != nil {
		return resp, er
	}
	if draftCtx != nil {
		<-draftCtx.Done()
		if nsOk && resp.GetNode().GetMetaBool(ns) {
			n := resp.GetNode().Clone()
			n.MustSetMeta(common.MetaNamespaceNodeDraftMode, true)
			resp.Node = n
		}
	}
	return resp, er
}

func (m *Handler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	var ns string
	var nsOk bool
	var draftCtx context.Context
	var draftCa context.CancelFunc
	if bi, e := nodes.GetBranchInfo(ctx, "in"); e == nil && bi.Workspace != nil {
		draftCtx, draftCa = context.WithCancel(ctx)
		defer draftCa()
		go func() {
			defer draftCa()
			ns, nsOk = m.getMetaClient().DraftMetaNamespace(draftCtx, bi.Workspace)
		}()
	}

	stream, er := m.Next.ListNodes(ctx, in, opts...)
	if er != nil {
		return nil, er
	}
	if draftCtx != nil {
		<-draftCtx.Done()
		if nsOk {
			s := nodes.NewWrappingStreamer(stream.Context())
			go func() {
				defer s.CloseSend()
				for {
					resp, err := stream.Recv()
					if err != nil {
						if !errors.IsStreamFinished(err) {
							_ = s.SendError(err)
						}
						break
					}
					if resp == nil {
						continue
					}
					if resp.GetNode().GetMetaBool(ns) {
						n := resp.GetNode().Clone()
						n.MustSetMeta(common.MetaNamespaceNodeDraftMode, true)
						resp.Node = n
					}
					_ = s.Send(resp)
				}
			}()
			return s, nil
		}
	}
	return stream, er
}

// CreateNode recursively creates parents if they do not already exist
// Only applicable to COLLECTION inside a structured storage (need to create .pydio hidden files)
func (m *Handler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if info, er := nodes.GetBranchInfo(ctx, "in"); er == nil && (info.FlatStorage || info.Binary || info.IsInternal()) || in.Node.IsLeaf() {
		resp, err := m.Next.CreateNode(ctx, in, opts...)
		if err != nil || !nodes.IsFlatStorage(ctx, "in") {
			return resp, err
		}
		// Handle input metadata, unless specified (typically when creating resources at Move)
		if !nodes.HasSkipDefaultMeta(ctx) {
			_, err = m.getMetaClient().ExtractAndPut(ctx, resp.GetNode(), nodes.GetContextWorkspaceOrNil(ctx, "in"), in.GetNode().GetMetaStore(), meta.ExtractNodeMetadata)
		}
		return resp, err
	}
	if e := m.createParentIfNotExist(ctx, in.GetNode().Clone(), in.GetIndexationSession()); e != nil {
		return nil, e
	}
	return m.Next.CreateNode(ctx, in, opts...)
}

// PutObject eventually creates an index N, captures body to extract Mime Type and compute custom Hash
func (m *Handler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	log.Logger(ctx).Debug("[HANDLER PUT] > Putting object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))

	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && branchInfo.Binary {
		return m.Next.PutObject(ctx, node, reader, requestData)
	}

	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		if test, e := m.GetObject(ctx, node, &models.GetRequestData{Length: -1}); e == nil {
			data, _ := io.ReadAll(test)
			log.Logger(ctx).Error("Cannot override the content of .pydio as it already has the ID " + string(data))
			test.Close()
			return models.ObjectInfo{}, errors.New("do not override folder uuid")
		}
		return m.Next.PutObject(ctx, node, reader, requestData)
	}

	var updateNode *tree.Node
	if no, e := m.checkTypeChange(ctx, node); e != nil {
		return models.ObjectInfo{}, e
	} else if no != nil {
		updateNode = no
	}

	if updateNode == nil {
		if e := m.createParentIfNotExist(ctx, node, ""); e != nil {
			return models.ObjectInfo{}, e
		}
	}

	if requestData.Metadata == nil {
		requestData.Metadata = make(map[string]string)
	}

	if node.Uuid != "" {

		log.Logger(ctx).Debug("PUT: Appending node Uuid to request metadata: " + node.Uuid)
		requestData.Metadata[common.XAmzMetaNodeUuid] = node.Uuid
		if requestData.ContentTypeUnknown() {
			reader = nodes.WrapReaderForMime(ctx, node.Clone(), reader)
		}
		return m.Next.PutObject(ctx, node, reader, requestData)

	} else {
		// PreCreate a node in the tree.
		newNode, onErrorFunc, nodeErr := m.getOrCreatePutNode(ctx, node.Path, requestData, updateNode)
		log.Logger(ctx).Debug("PreLoad or PreCreate Node in tree", zap.String("path", node.Path), zap.Any("node", newNode), zap.Error(nodeErr))
		if nodeErr != nil {
			return models.ObjectInfo{}, nodeErr
		}
		if !newNode.IsLeaf() {
			// This was a PydioSyncHiddenFile and the folder already exists, replace the content
			// with the actual folder Uuid to avoid replacing it We should never pass there???
			reader = bytes.NewBufferString(newNode.Uuid)
		} else if requestData.ContentTypeUnknown() {
			reader = nodes.WrapReaderForMime(ctx, newNode.Clone(), reader)
		}

		requestData.Metadata[common.XAmzMetaNodeUuid] = newNode.Uuid
		node.Uuid = newNode.Uuid

		oi, err := m.Next.PutObject(ctx, node, reader, requestData)
		if err != nil && onErrorFunc != nil {
			log.Logger(ctx).Debug("Return of PutObject", zap.String("path", node.Path), zap.Error(err))
			onErrorFunc()
		}
		return oi, err

	}

}

// MultipartCreate registers a node in the virtual fs with size 0 and ETag: temporary
// (we do not have the real size at this point because we are using streams.)
func (m *Handler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	log.Logger(ctx).Debug("PUT - MULTIPART CREATE: before middle ware method")

	// What is it? to be checked
	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		return m.Next.MultipartCreate(ctx, node, requestData)
	}

	var updateNode *tree.Node
	if no, e := m.checkTypeChange(ctx, node); e != nil {
		return "", e
	} else if no != nil {
		updateNode = no
	}

	if updateNode == nil {
		if e := m.createParentIfNotExist(ctx, node, ""); e != nil {
			return "", e
		}
	}

	if requestData.Metadata == nil {
		requestData.Metadata = make(map[string]string)
	}
	var createErrorFunc onCreateErrorFunc
	if node.Uuid == "" { // PreCreate a node in the tree.
		var size int64
		if metaSize, ok := requestData.Metadata[common.XAmzMetaClearSize]; ok {
			size, _ = strconv.ParseInt(metaSize, 10, 64)
		}
		newNode, onErrorFunc, nodeErr := m.getOrCreatePutNode(ctx, node.Path, &models.PutRequestData{Size: size, Metadata: requestData.Metadata}, updateNode)
		log.Logger(ctx).Info("PreLoad or PreCreate Node in tree", zap.String("path", node.Path), zap.Any("node", newNode), zap.Error(nodeErr))
		if nodeErr != nil {
			if onErrorFunc != nil {
				log.Logger(ctx).Debug("cannot get or create node ", zap.String("path", node.Path), zap.Error(nodeErr))
				onErrorFunc()
			} else {
				return "", nodeErr
			}
		}
		createErrorFunc = onErrorFunc
		node.Uuid = newNode.Uuid
	} else { // Overwrite existing node
		log.Logger(ctx).Debug("PUT - MULTIPART CREATE: Appending node Uuid to request metadata: " + node.Uuid)
	}

	requestData.Metadata[common.XAmzMetaNodeUuid] = node.Uuid

	// Call Next handler
	multipartId, err := m.Next.MultipartCreate(ctx, node, requestData)
	if err != nil {
		log.Logger(ctx).Debug("minio.MultipartCreate has failed, for node at path: " + node.Path)
		if createErrorFunc != nil {
			createErrorFunc()
		}
		return "", err
	}
	return multipartId, err
}

func (m *Handler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	// Feed target node with pre-created one
	resp, err := nodes.GetSourcesPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: strings.TrimLeft(target.Path, "/"),
		},
	})
	if err != nil {
		return models.MultipartObjectPart{}, errors.New("cannot find initial multipart node, this is not normal")
	}

	if partNumberMarker == 1 && requestData.ContentTypeUnknown() {
		cl := resp.GetNode().Clone()
		cl.Type = tree.NodeType_LEAF // Force leaf!
		reader = nodes.WrapReaderForMime(ctx, cl, reader)
	}

	return m.Next.MultipartPutObjectPart(ctx, resp.Node, uploadID, partNumberMarker, reader, requestData)
}

func (m *Handler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {

	// Feed target node with pre-created one
	resp, err := nodes.GetSourcesPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: strings.TrimLeft(target.Path, "/"),
		},
	})
	if err != nil {
		return models.ObjectInfo{}, errors.New("cannot find initial multipart node, this is not normal")
	}
	target.Uuid = resp.GetNode().GetUuid()
	target.Size = resp.GetNode().GetSize()

	return m.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (m *Handler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {

	deleteTemporary := func() {
		treeReader := nodes.GetSourcesPool(ctx).GetTreeClient()
		treeWriter := nodes.GetSourcesPool(ctx).GetTreeClientWrite()
		treePath := strings.TrimLeft(target.Path, "/")
		existingResp, err := treeReader.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: treePath,
			},
		})
		if err == nil && existingResp.Node != nil && existingResp.Node.Etag == common.NodeFlagEtagTemporary {
			log.Logger(ctx).Info("Received MultipartAbort - Clean temporary node:", existingResp.Node.Zap())
			// Delete Temporary N Now!
			treeWriter.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{
				Path: string(norm.NFC.Bytes([]byte(treePath))),
				Type: tree.NodeType_LEAF,
			}})
		}
	}

	if !nodes.IsFlatStorage(ctx, "in") {
		deleteTemporary()
	}
	e := m.Next.MultipartAbort(ctx, target, uploadID, requestData)
	if nodes.IsFlatStorage(ctx, "in") {
		deleteTemporary()
	}
	return e
}

// CopyObject captures Copy operation (not move) to set default metadata
func (m *Handler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	oi, er := m.Next.CopyObject(ctx, from, to, requestData)
	if !requestData.IsMove() {
		ctxWs := nodes.GetContextWorkspaceOrNil(ctx, "to")
		if _, err := m.getMetaClient().ExtractAndPut(ctx, to, ctxWs, nil, meta.ExtractNone); err != nil {
			return models.ObjectInfo{}, err
		}
	}
	return oi, er
}

func retryOnDuplicate(ctx context.Context, callback func(context.Context) (*tree.CreateNodeResponse, error), retries ...int) (*tree.CreateNodeResponse, error) {
	resp, e := callback(ctx)
	var r int
	if len(retries) > 0 {
		r = retries[0]
	}
	if e != nil && errors.Is(e, errors.NodeIndexConflict) && r < 3 {
		<-time.After(100 * time.Millisecond)
		resp, e = retryOnDuplicate(ctx, callback, r+1)
	}
	return resp, e
}

// getOrCreatePutNode creates a temporary node before calling a Put request.
// If it is an update, should send back the already existing node.
// Returns the node, a flag to tell whether it is created or not, and eventually an error
// The Put event will afterward update the index
func (m *Handler) getOrCreatePutNode(ctx context.Context, nodePath string, requestData *models.PutRequestData, preloadedNode ...*tree.Node) (*tree.Node, onCreateErrorFunc, error) {
	var skipRead bool
	if len(preloadedNode) > 0 {
		if preloadedNode[0] != nil {
			return preloadedNode[0], nil, nil
		} else {
			skipRead = true
		}
	}
	treeReader := nodes.GetSourcesPool(ctx).GetTreeClient()
	treeWriter := nodes.GetSourcesPool(ctx).GetTreeClientWrite()

	treePath := strings.TrimLeft(nodePath, "/")

	if !skipRead {
		existingResp, err := treeReader.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: treePath,
			},
		})
		if err == nil && existingResp.Node != nil {
			return existingResp.Node, nil, nil
		}
	}
	// As we are not going through the real FS, make sure to normalize now the file path
	tmpNode := &tree.Node{
		Path:  string(norm.NFC.Bytes([]byte(treePath))),
		MTime: time.Now().Unix(),
		Size:  requestData.Size,
		Type:  tree.NodeType_LEAF,
		Etag:  common.NodeFlagEtagTemporary,
	}

	for k, v := range requestData.CheckedMetadata {
		tmpNode.MustSetMeta(k, v)
	}

	if !requestData.ContentTypeUnknown() {
		tmpNode.MustSetMeta(common.MetaNamespaceMime, requestData.MetaContentType())
	}

	// Uuid is passed for input node - double check that it does not already exist!
	if id := requestData.InputResourceUuid(); id != "" {
		if _, er := treeReader.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: id}, StatFlags: []uint32{tree.StatFlagNone}}); er == nil {
			return nil, nil, errors.WithStack(errors.NodeIndexConflict)
		}
		tmpNode.SetUuid(id)
	}

	createResp, er := retryOnDuplicate(ctx, func(c context.Context) (*tree.CreateNodeResponse, error) {
		return treeWriter.CreateNode(c, &tree.CreateNodeRequest{Node: tmpNode})
	})
	if er != nil {
		return nil, nil, er
	}

	ctxWs := nodes.GetContextWorkspaceOrNil(ctx, "in")
	createdNode := createResp.GetNode()
	if _, er = m.getMetaClient().ExtractAndPut(ctx, createdNode, ctxWs, requestData.Metadata, meta.ExtractAmzHeaders); er != nil {
		return nil, nil, er
	}

	delNode := createdNode.Clone()
	errorFunc := func() {
		if ctx.Err() != nil {
			ctx = propagator.ForkedBackgroundWithMeta(ctx)
		}
		_, e := treeWriter.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: delNode})
		if e != nil {
			log.Logger(ctx).Error("Error while trying to delete temporary node after upload failure", zap.Error(e), delNode.Zap())
		}
	}
	return createdNode, errorFunc, nil

}

// checkTypeChange verify if a node is about to be overriden with a different type
func (m *Handler) checkTypeChange(ctx context.Context, node *tree.Node) (*tree.Node, error) {
	resp, er := m.ReadNode(ctx, &tree.ReadNodeRequest{Node: node.Clone()})
	if er != nil || resp == nil || resp.GetNode() == nil {
		return nil, nil // Node does not already exist, ignore
	}
	srcLeaf := node.GetType() == tree.NodeType_LEAF || node.GetType() == tree.NodeType_UNKNOWN
	tgtLeaf := resp.GetNode().GetType() == tree.NodeType_LEAF
	if srcLeaf != tgtLeaf {
		if tgtLeaf {
			return nil, errors.WithMessagef(errors.NodeTypeConflict, "A file already exists with the same name")
		} else {
			return nil, errors.WithMessagef(errors.NodeTypeConflict, "A folder already exists with the same name")
		}
	}
	return resp.GetNode(), nil
}

// createParentIfNotExist Recursively create parents
func (m *Handler) createParentIfNotExist(ctx context.Context, node *tree.Node, session string) error {
	parentNode := &tree.Node{
		Path:  path.Dir(node.Path),
		Type:  tree.NodeType_COLLECTION,
		MTime: time.Now().Unix(),
	}
	parentNode.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Dir(node.GetStringMeta(common.MetaNamespaceDatasourcePath)))

	if parentNode.Path == "/" || parentNode.Path == "" || parentNode.Path == "." {
		return nil
	}
	if _, e := m.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: parentNode, StatFlags: []uint32{tree.StatFlagNone}}); e != nil {
		if er := m.createParentIfNotExist(ctx, parentNode, session); er != nil {
			return er
		}
		if r, er2 := m.Next.CreateNode(ctx, &tree.CreateNodeRequest{Node: parentNode, IndexationSession: session}); er2 != nil {
			if errors.Is(er2, errors.StatusConflict) {
				return nil
			}
			return er2
		} else if r != nil {
			log.Logger(ctx).Debug("[PUT HANDLER] > Created parent node in S3", r.Node.Zap())
			// As we are not going through the real FS, make sure to normalize now the file path
			tmpNode := &tree.Node{
				Uuid:  r.Node.Uuid,
				Path:  string(norm.NFC.Bytes([]byte(r.Node.Path))),
				MTime: time.Now().Unix(),
				Size:  36,
				Type:  tree.NodeType_COLLECTION,
				Etag:  "-1",
			}
			treeWriter := nodes.GetSourcesPool(ctx).GetTreeClientWrite()
			log.Logger(ctx).Debug("[PUT HANDLER] > Create Parent Node In Index", zap.String("UUID", tmpNode.Uuid), zap.String("Path", tmpNode.Path))
			_, er := treeWriter.CreateNode(ctx, &tree.CreateNodeRequest{Node: tmpNode, IndexationSession: session})
			if er != nil {
				if errors.Is(er, errors.StatusConflict) {
					return nil
				}
				return er
			}
		}
	}
	return nil
}

func (m *Handler) getMetaClient() meta.UserMetaClient {
	if m.metaClient == nil {
		m.metaClient = meta.NewUserMetaClient(cache.Config{
			Prefix:      "nodes/metadata",
			Eviction:    "10s",
			CleanWindow: "3m",
		})
	}
	return m.metaClient
}
