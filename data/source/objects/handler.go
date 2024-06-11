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

package objects

import (
	"context"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/spf13/afero"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filesystem"
)

func NewTreeHandler(conf configx.Values) *TreeHandler {
	t := &TreeHandler{}
	t.FS = afero.NewOsFs()
	restrict := conf.Val("allowedLocalDsFolder").String()
	if t.hasRootRef = restrict != ""; t.hasRootRef {
		f := restrict
		t.FS = afero.NewBasePathFs(t.FS, f)
	}
	return t
}

type TreeHandler struct {
	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeReceiverServer
	FS         afero.Fs
	hasRootRef bool
}

func (t *TreeHandler) Name() string {
	return BrowserName
}

func (t *TreeHandler) SymlinkInfo(path string, info os.FileInfo) (bool, tree.NodeType, string) {
	if info.Mode()&os.ModeSymlink != 0 {
		if t, e := os.Readlink(path); e == nil {
			target, er := os.Stat(t)
			if er != nil {
				// If error on stat, try to resolve absolute path
				if t, er = filepath.Abs(filepath.Join(filepath.Dir(path), t)); er == nil {
					target, er = os.Stat(t)
				}
			}
			if er == nil {
				if target.IsDir() {
					return true, tree.NodeType_COLLECTION, t
				} else {
					return true, tree.NodeType_LEAF, t
				}
			}
		}
	}
	return false, tree.NodeType_UNKNOWN, ""
}

func (t *TreeHandler) FileInfoToNode(nodePath string, fileInfo os.FileInfo) *tree.Node {
	node := &tree.Node{
		Path:  filesystem.ToNodePath(nodePath),
		Size:  fileInfo.Size(),
		MTime: fileInfo.ModTime().Unix(),
		MetaStore: map[string]string{
			"permissions": fileInfo.Mode().String(),
			"name":        fileInfo.Name(),
		},
	}
	if fileInfo.IsDir() {
		node.Type = tree.NodeType_COLLECTION
	} else {
		if yes, typ, target := t.SymlinkInfo(nodePath, fileInfo); yes {
			node.Type = typ
			node.MetaStore["symlink"] = target
		} else {
			node.Type = tree.NodeType_LEAF
		}
	}
	return node
}

func (t *TreeHandler) ReadNode(ctx context.Context, request *tree.ReadNodeRequest) (*tree.ReadNodeResponse, error) {
	response := &tree.ReadNodeResponse{}
	p := filesystem.ToFilePath(request.Node.Path)
	if fileInfo, e := t.FS.Stat(p); e != nil {
		return nil, e
	} else {
		response.Node = t.FileInfoToNode(request.Node.Path, fileInfo)
	}
	return response, nil
}

func (t *TreeHandler) ListNodes(request *tree.ListNodesRequest, stream tree.NodeProvider_ListNodesServer) error {

	ctx := stream.Context()
	if !t.hasRootRef && runtime.GOOS == "windows" && (request.Node.Path == "" || request.Node.Path == "/") {
		request.Node.Path = "/"
		volumes := filesystem.BrowseVolumes(ctx)
		var err error
		for _, volume := range volumes {
			err = stream.Send(&tree.ListNodesResponse{
				Node: &tree.Node{
					Uuid: volume.Uuid,
					Path: volume.Path,
					Type: tree.NodeType_COLLECTION,
					Size: volume.Size,
				},
			})
			if err != nil {
				log.Logger(ctx).Error("could not send node", zap.Error(err))
				break
			}
		}
		return err

	} else {
		p := filesystem.ToFilePath(request.Node.Path)
		if p == "" {
			p = "/"
		}
		log.Logger(ctx).Debug("ListNodes on file path", zap.String("p", p))
		if fileInfos, e := afero.ReadDir(t.FS, p); e == nil {
			for _, info := range fileInfos {
				fullPath := path.Join(p, info.Name())
				if isSymLink, _, _ := t.SymlinkInfo(fullPath, info); !isSymLink && (strings.HasPrefix(info.Name(), ".") || !info.IsDir()) {
					continue
				}
				stream.Send(&tree.ListNodesResponse{
					Node: t.FileInfoToNode(fullPath, info),
				})
			}
		} else {
			return e
		}
	}
	return nil
}

func (t *TreeHandler) CreateNode(ctx context.Context, request *tree.CreateNodeRequest) (*tree.CreateNodeResponse, error) {
	response := &tree.CreateNodeResponse{}
	p := filesystem.ToFilePath(request.Node.Path)
	if request.Node.IsLeaf() {
		if file, e := t.FS.Create(p); e != nil {
			return nil, e
		} else {
			fileInfo, _ := file.Stat()
			response.Node = t.FileInfoToNode(request.Node.Path, fileInfo)
		}
	} else {
		if e := t.FS.MkdirAll(p, 0755); e != nil {
			return nil, e
		} else {
			fileInfo, _ := t.FS.Stat(p)
			response.Node = t.FileInfoToNode(request.Node.Path, fileInfo)
		}
	}
	return response, nil
}

func (t *TreeHandler) UpdateNode(ctx context.Context, request *tree.UpdateNodeRequest) (*tree.UpdateNodeResponse, error) {
	return nil, errors.WithStack(errors.StatusNotImplemented)
}

func (t *TreeHandler) DeleteNode(ctx context.Context, request *tree.DeleteNodeRequest) (*tree.DeleteNodeResponse, error) {
	p := filesystem.ToFilePath(request.Node.Path)
	if e := t.FS.Remove(p); e != nil {
		return nil, e
	}
	return &tree.DeleteNodeResponse{Success: true}, nil
}
