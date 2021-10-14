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
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

// PutHandler handles Put requests by creating temporary files in the index before forwarding data to the object service.
// This temporary entry is updated later on by the sync service, once the object is written. It is deleted if the Put operation fails.
type PutHandler struct {
	AbstractHandler
}

type onCreateErrorFunc func()

func retryOnDuplicate(callback func() (*tree.CreateNodeResponse, error), retries ...int) (*tree.CreateNodeResponse, error) {
	resp, e := callback()
	var r int
	if len(retries) > 0 {
		r = retries[0]
	}
	if e != nil && strings.Contains(e.Error(), "Duplicate entry") && r < 3 {
		<-time.After(100 * time.Millisecond)
		resp, e = retryOnDuplicate(callback, r+1)
	}
	return resp, e
}

// getOrCreatePutNode creates a temporary node before calling a Put request.
// If it is an update, should send back the already existing node.
// Returns the node, a flag to tell wether it is created or not, and eventually an error
// The Put event will afterward update the index
func (m *PutHandler) getOrCreatePutNode(ctx context.Context, nodePath string, requestData *models.PutRequestData) (*tree.Node, error, onCreateErrorFunc) {
	treeReader := m.clientsPool.GetTreeClient()
	treeWriter := m.clientsPool.GetTreeClientWrite()

	treePath := strings.TrimLeft(nodePath, "/")
	existingResp, err := treeReader.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: treePath,
		},
	})
	if err == nil && existingResp.Node != nil {
		return existingResp.Node, nil, nil
	}
	// As we are not going through the real FS, make sure to normalize now the file path
	tmpNode := &tree.Node{
		Path:  string(norm.NFC.Bytes([]byte(treePath))),
		MTime: time.Now().Unix(),
		Size:  requestData.Size,
		Type:  tree.NodeType_LEAF,
		Etag:  common.NodeFlagEtagTemporary,
	}

	if requestData.MetaContentType() != "" {
		tmpNode.SetMeta(common.MetaNamespaceMime, requestData.MetaContentType())
	}

	log.Logger(ctx).Debug("[PUT HANDLER] > Create Node", zap.String("UUID", tmpNode.Uuid), zap.String("Path", tmpNode.Path))
	//createResp, er := treeWriter.CreateNode(ctx, &tree.CreateNodeRequest{Node: tmpNode})
	createResp, er := retryOnDuplicate(func() (*tree.CreateNodeResponse, error) {
		return treeWriter.CreateNode(ctx, &tree.CreateNodeRequest{Node: tmpNode})
	})
	if er != nil {
		return nil, er, nil
	}
	delNode := createResp.Node.Clone()
	errorFunc := func() {
		if ctx.Err() != nil {
			ctx = context.Background()
		}
		_, e := treeWriter.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: delNode})
		if e != nil {
			log.Logger(ctx).Error("Error while trying to delete temporary node after upload failure", zap.Error(e), delNode.Zap())
		}
	}
	return createResp.Node, nil, errorFunc

}

// createParentIfNotExist Recursively create parents
func (m *PutHandler) createParentIfNotExist(ctx context.Context, node *tree.Node) error {
	parentNode := node.Clone()
	parentNode.Path = path.Dir(node.Path)
	if parentNode.Path == "/" || parentNode.Path == "" || parentNode.Path == "." {
		return nil
	}
	parentNode.SetMeta(common.MetaNamespaceDatasourcePath, path.Dir(parentNode.GetStringMeta(common.MetaNamespaceDatasourcePath)))
	parentNode.Type = tree.NodeType_COLLECTION
	if _, e := m.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: parentNode}); e != nil {
		if er := m.createParentIfNotExist(ctx, parentNode); er != nil {
			return er
		}
		if r, er2 := m.next.CreateNode(ctx, &tree.CreateNodeRequest{Node: parentNode}); er2 != nil {
			parsedErr := errors.Parse(er2.Error())
			if parsedErr.Code == http.StatusConflict {
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
			treeWriter := m.clientsPool.GetTreeClientWrite()
			log.Logger(ctx).Debug("[PUT HANDLER] > Create Parent Node In Index", zap.String("UUID", tmpNode.Uuid), zap.String("Path", tmpNode.Path))
			_, er := treeWriter.CreateNode(ctx, &tree.CreateNodeRequest{Node: tmpNode})
			if er != nil {
				parsedErr := errors.Parse(er.Error())
				if parsedErr.Code == http.StatusConflict {
					return nil
				}
				return er
			}
		}
	}
	return nil
}

// CreateNode recursively creates parents if they do not already exist
// Only applicable to COLLECTION inside a structured storage (need to create .pydio hidden files)
func (m *PutHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	if info, ok := GetBranchInfo(ctx, "in"); ok && (info.FlatStorage || info.Binary || info.IsInternal()) || in.Node.IsLeaf() {
		return m.next.CreateNode(ctx, in, opts...)
	}
	if e := m.createParentIfNotExist(ctx, in.GetNode().Clone()); e != nil {
		return nil, e
	}
	return m.next.CreateNode(ctx, in, opts...)
}

func (m *PutHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	log.Logger(ctx).Debug("[HANDLER PUT] > Putting object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))

	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return m.next.PutObject(ctx, node, reader, requestData)
	}

	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		if test, e := m.GetObject(ctx, node, &models.GetRequestData{Length: -1}); e == nil {
			data, _ := ioutil.ReadAll(test)
			log.Logger(ctx).Error("Cannot override the content of .pydio as it already has the ID " + string(data))
			test.Close()
			return 0, fmt.Errorf("do not override folder uuid")
		}
		return m.next.PutObject(ctx, node, reader, requestData)
	}

	if e := m.createParentIfNotExist(ctx, node); e != nil {
		return 0, e
	}

	if requestData.Metadata == nil {
		requestData.Metadata = make(map[string]string)
	}

	if node.Uuid != "" {

		log.Logger(ctx).Debug("PUT: Appending node Uuid to request metadata: " + node.Uuid)
		requestData.Metadata[common.XAmzMetaNodeUuid] = node.Uuid
		if requestData.ContentTypeUnknown() {
			reader = WrapReaderForMime(ctx, node.Clone(), reader)
		}
		return m.next.PutObject(ctx, node, reader, requestData)

	} else {
		// PreCreate a node in the tree.
		newNode, nodeErr, onErrorFunc := m.getOrCreatePutNode(ctx, node.Path, requestData)
		log.Logger(ctx).Debug("PreLoad or PreCreate Node in tree", zap.String("path", node.Path), zap.Any("node", newNode), zap.Error(nodeErr))
		if nodeErr != nil {
			return 0, nodeErr
		}
		if !newNode.IsLeaf() {
			// This was a PydioSyncHiddenFile and the folder already exists, replace the content
			// with the actual folder Uuid to avoid replacing it We should never pass there???
			reader = bytes.NewBufferString(newNode.Uuid)
		} else if requestData.ContentTypeUnknown() {
			reader = WrapReaderForMime(ctx, newNode.Clone(), reader)
		}

		requestData.Metadata[common.XAmzMetaNodeUuid] = newNode.Uuid
		node.Uuid = newNode.Uuid
		size, err := m.next.PutObject(ctx, node, reader, requestData)
		if err != nil && onErrorFunc != nil {
			log.Logger(ctx).Debug("Return of PutObject", zap.String("path", node.Path), zap.Int64("size", size), zap.Error(err))
			onErrorFunc()
		}
		return size, err

	}

}

// MultipartCreate registers a node in the virtual fs with size 0 and ETag: temporary
// (we do not have the real size at this point because we are using streams.)
func (m *PutHandler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	log.Logger(ctx).Debug("PUT - MULTIPART CREATE: before middle ware method")

	// What is it? to be checked
	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		return m.next.MultipartCreate(ctx, node, requestData)
	}

	if requestData.Metadata == nil {
		requestData.Metadata = make(map[string]string)
	}
	var createErroFunc onCreateErrorFunc
	if node.Uuid == "" { // PreCreate a node in the tree.
		var size int64
		if metaSize, ok := requestData.Metadata[common.XAmzMetaClearSize]; ok {
			size, _ = strconv.ParseInt(metaSize, 10, 64)
		}
		newNode, nodeErr, onErrorFunc := m.getOrCreatePutNode(ctx, node.Path, &models.PutRequestData{Size: size})
		log.Logger(ctx).Debug("PreLoad or PreCreate Node in tree", zap.String("path", node.Path), zap.Any("node", newNode), zap.Error(nodeErr))
		if nodeErr != nil {
			if onErrorFunc != nil {
				log.Logger(ctx).Debug("cannot get or create node ", zap.String("path", node.Path), zap.Error(nodeErr))
				onErrorFunc()
			} else {
				return "", nodeErr
			}
		}
		createErroFunc = onErrorFunc
		node.Uuid = newNode.Uuid
	} else { // Overwrite existing node
		log.Logger(ctx).Debug("PUT - MULTIPART CREATE: Appending node Uuid to request metadata: " + node.Uuid)
	}

	requestData.Metadata[common.XAmzMetaNodeUuid] = node.Uuid

	// Call next handler
	multipartId, err := m.next.MultipartCreate(ctx, node, requestData)
	if err != nil {
		log.Logger(ctx).Debug("minio.MultipartCreate has failed, for node at path: " + node.Path)
		if createErroFunc != nil {
			createErroFunc()
		}
		return "", err
	}
	return multipartId, err
}

func (m *PutHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {

	deleteTemporary := func() {
		treeReader := m.clientsPool.GetTreeClient()
		treeWriter := m.clientsPool.GetTreeClientWrite()
		treePath := strings.TrimLeft(target.Path, "/")
		existingResp, err := treeReader.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: treePath,
			},
		})
		if err == nil && existingResp.Node != nil && existingResp.Node.Etag == common.NodeFlagEtagTemporary {
			log.Logger(ctx).Info("Received MultipartAbort - Clean temporary node:", existingResp.Node.Zap())
			// Delete Temporary Node Now!
			treeWriter.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{
				Path: string(norm.NFC.Bytes([]byte(treePath))),
				Type: tree.NodeType_LEAF,
			}})
		}
	}

	if !isFlatStorage(ctx, "in") {
		deleteTemporary()
	}
	e := m.next.MultipartAbort(ctx, target, uploadID, requestData)
	if isFlatStorage(ctx, "in") {
		deleteTemporary()
	}
	return e
}
