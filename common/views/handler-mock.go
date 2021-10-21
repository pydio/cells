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
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/micro/go-micro/client"
	errors2 "github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
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

func (h *HandlerMock) SetNextHandler(handler Handler) {}

func (h *HandlerMock) SetClientsPool(p SourcesPool) {}

func (h *HandlerMock) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {
	return provider(inputFilter, outputFilter)
}

func (h *HandlerMock) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	h.Nodes["in"] = in.Node
	h.Context = ctx
	if n, ok := h.Nodes[in.Node.Path]; ok {
		return &tree.ReadNodeResponse{Node: n}, nil
	}
	return nil, errors.New("Not Found")
}

func (h *HandlerMock) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	h.Nodes["in"] = in.Node
	h.Context = ctx
	streamer := NewWrappingStreamer()
	if in.Ancestors {
		if n, o := h.Nodes[in.Node.Path]; o {
			go func() {
				defer streamer.Close()
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
			streamer.Close()
			return nil, errors2.NotFound("not.found", "Node not found")
		}
	} else {
		go func() {
			defer streamer.Close()
			for _, n := range h.Nodes {
				if strings.HasPrefix(n.Path, in.Node.Path+"/") {
					streamer.Send(&tree.ListNodesResponse{Node: n})
				}
			}

		}()
	}
	return streamer, nil
}

func (h *HandlerMock) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Create Node " + in.Node.Path)
	h.Nodes["in"] = in.Node
	h.Context = ctx
	return nil, nil
}

func (h *HandlerMock) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Update Node " + in.From.Path + " to " + in.To.Path)
	h.Nodes["from"] = in.From
	h.Nodes["to"] = in.To
	h.Context = ctx
	return nil, nil
}

func (h *HandlerMock) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	log.Logger(ctx).Info("[MOCK] Delete Node" + in.Node.Path)
	h.Nodes["in"] = in.Node
	if _, ok := h.Nodes[in.Node.Path]; ok {
		delete(h.Nodes, in.Node.Path)
	}
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

		if requestData.Length > 0 {
			// maybe the file object should be wrapped to control read limit
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

func (h *HandlerMock) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	log.Logger(ctx).Info("[MOCK] PutObject" + node.Path)

	if len(h.RootDir) > 0 {
		output, err := os.OpenFile(filepath.Join(h.RootDir, node.Path), os.O_WRONLY|os.O_CREATE, os.ModePerm)
		if err != nil {
			return -1, err
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
					return -1, err
				}
			}

			written, err := output.Write(buffer[:n])
			if err != nil {
				return totalWritten, err
			}
			totalWritten += int64(written)
		}
		return totalWritten, nil
	}

	h.Nodes["in"] = node
	h.Context = ctx
	return 0, nil
}

func (h *HandlerMock) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	log.Logger(ctx).Info("[MOCK] CopyObject " + from.Path + " to " + to.Path)
	h.Nodes["from"] = from
	h.Nodes["to"] = to
	h.Context = ctx
	return 0, nil
}

func (h *HandlerMock) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return "", nil
}

func (h *HandlerMock) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (op minio.ObjectPart, e error) {
	return
}

func (h *HandlerMock) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (minio.ListMultipartUploadsResult, error) {
	h.Context = ctx
	return minio.ListMultipartUploadsResult{}, nil
}

func (h *HandlerMock) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	h.Context = ctx
	h.Nodes["in"] = target
	return nil
}

func (h *HandlerMock) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return minio.ObjectInfo{}, nil
}

func (h *HandlerMock) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (minio.ListObjectPartsResult, error) {
	h.Nodes["in"] = target
	h.Context = ctx
	return minio.ListObjectPartsResult{}, nil
}

func (h *HandlerMock) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...client.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	return nil, fmt.Errorf("not.implemented")
}

func (h *HandlerMock) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilter) error {
	return handlerListNodesWithCallback(h, ctx, request, callback, ignoreCbError, filters...)
}

func (h *HandlerMock) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return nil
}
