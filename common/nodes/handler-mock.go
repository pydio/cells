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

package nodes

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	errors2 "github.com/pydio/cells/v4/common/service/serviceerrors"
)

func NewHandlerMock() *HandlerMock {
	return &HandlerMock{
		Nodes: make(map[string]*tree.Node),
	}
}

type HandlerMock struct {
	RootDir string
	Nodes   map[string]*tree.Node
	Context context.Context
}

type MockReadCloser struct {
	io.Reader
}

func (r MockReadCloser) Close() error {
	return nil
}

func (h *HandlerMock) SetClientsPool(p SourcesPool) {}

func (h *HandlerMock) ExecuteWrapped(inputFilter FilterFunc, outputFilter FilterFunc, provider CallbackFunc) error {
	return provider(inputFilter, outputFilter)
}

func (h *HandlerMock) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	h.Nodes["in"] = in.Node
	h.Context = ctx
	if n, ok := h.Nodes[in.Node.Path]; ok {
		return &tree.ReadNodeResponse{Node: n}, nil
	}
	return nil, errors.New("Not Found")
}

func (h *HandlerMock) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	h.Nodes["in"] = in.Node
	h.Context = ctx
	streamer := NewWrappingStreamer(ctx)
	if in.Ancestors {
		if n, o := h.Nodes[in.Node.Path]; o {
			go func() {
				defer streamer.CloseSend()
				streamer.Send(&tree.ListNodesResponse{Node: n})
				pa := in.Node.Path
				for {
					pa = path.Dir(pa)
					if pa == "" || pa == "." {
						break
					}
					if p, o := h.Nodes[pa]; o {
						streamer.Send(&tree.ListNodesResponse{Node: p})
					} else {
						break
					}
				}
			}()
		} else {
			streamer.CloseSend()
			return nil, errors2.NotFound("not.found", "Node not found")
		}
	} else {
		go func() {
			defer streamer.CloseSend()
			for _, n := range h.Nodes {
				if strings.HasPrefix(n.Path, in.Node.Path+"/") {
					streamer.Send(&tree.ListNodesResponse{Node: n})
				}
			}

		}()
	}
	return streamer, nil
}

func (h *HandlerMock) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Create Node " + in.Node.Path)
	h.Nodes["in"] = in.Node
	h.Context = ctx
	return nil, nil
}

func (h *HandlerMock) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Update Node " + in.From.Path + " to " + in.To.Path)
	h.Nodes["from"] = in.From
	h.Nodes["to"] = in.To
	h.Context = ctx
	return nil, nil
}

func (h *HandlerMock) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Delete Node" + in.Node.Path)
	h.Nodes["in"] = in.Node
	delete(h.Nodes, in.Node.Path)
	h.Context = ctx
	return nil, nil
}

func (h *HandlerMock) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if len(h.RootDir) > 0 {
		file, err := os.Open(filepath.Join(h.RootDir, node.Path))
		if err != nil {
			return nil, err
		}

		if requestData.StartOffset > 0 {
			_, err := file.Seek(requestData.StartOffset, 0)
			if err != nil {
				return nil, err
			}
		}
		return file, nil
	}

	h.Context = ctx
	h.Nodes["in"] = node
	if n, ok := h.Nodes[node.Path]; ok {
		// Fake node content : node path + hello world
		closer := MockReadCloser{}
		closer.Reader = strings.NewReader(n.Path + "hello world")
		return closer, nil
	}
	return nil, errors.New("Not Found")

}

func (h *HandlerMock) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	log.Logger(ctx).Info("[MOCK] PutObject" + node.Path)

	if len(h.RootDir) > 0 {
		output, err := os.OpenFile(filepath.Join(h.RootDir, node.Path), os.O_WRONLY|os.O_CREATE, os.ModePerm)
		if err != nil {
			return models.ObjectInfo{}, err
		}

		buffer := make([]byte, 1024)
		n := 0

		var totalWritten int64 = 0

		eof := false
		for !eof {
			n, err = reader.Read(buffer)
			if err != nil {
				eof = err == io.EOF
				if !eof {
					return models.ObjectInfo{}, err
				}
			}

			written, err := output.Write(buffer[:n])
			if err != nil {
				return models.ObjectInfo{}, err
			}
			totalWritten += int64(written)
		}
		return models.ObjectInfo{Size: totalWritten}, nil
	}

	h.Nodes["in"] = node
	h.Context = ctx
	return models.ObjectInfo{}, nil
}

func (h *HandlerMock) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	log.Logger(ctx).Info("[MOCK] CopyObject " + from.Path + " to " + to.Path)
	h.Nodes["from"] = from
	h.Nodes["to"] = to
	h.Context = ctx
	return models.ObjectInfo{Size: to.Size}, nil
}

func (h *HandlerMock) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return "", nil
}

func (h *HandlerMock) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (op models.MultipartObjectPart, e error) {
	return
}

func (h *HandlerMock) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	h.Context = ctx
	return models.ListMultipartUploadsResult{}, nil
}

func (h *HandlerMock) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	h.Context = ctx
	h.Nodes["in"] = target
	return nil
}

func (h *HandlerMock) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return models.ObjectInfo{}, nil
}

func (h *HandlerMock) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return models.ListObjectPartsResult{}, nil
}

func (h *HandlerMock) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	return nil, fmt.Errorf("not.implemented")
}

func (h *HandlerMock) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilterFunc) error {
	return HandlerListNodesWithCallback(h, ctx, request, callback, ignoreCbError, filters...)
}

func (h *HandlerMock) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return nil
}
