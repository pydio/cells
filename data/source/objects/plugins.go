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

// Package objects is in charge of exposing the content of the datasource with the S3 protocol.
package objects

import (
	"context"
	"os"
	"path/filepath"
	"strings"

	"github.com/micro/go-micro"
	"github.com/spf13/afero"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
)

var (
	Name        = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS
	ChildPrefix = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS_
)

func init() {
	service.NewService(
		service.Name(Name),
		service.Tag(common.SERVICE_TAG_DATASOURCE),
		service.Description("Starter for different sources objects"),
		service.WithMicro(func(m micro.Service) error {
			runner := service.NewChildrenRunner(m, Name, ChildPrefix)
			m.Init(
				micro.AfterStart(func() error {
					ctx := m.Options().Context
					conf := servicecontext.GetConfig(ctx)
					runner.StartFromInitialConf(ctx, conf)
					tree.RegisterNodeProviderHandler(m.Server(), NewTreeHandler())
					runner.OnDeleteConfig(onDeleteObjectsConfig)
					return nil
				}))

			tree.RegisterNodeProviderHandler(m.Server(), NewTreeHandler())

			return runner.Watch(m.Options().Context)
		}),
	)
}

// Manage datasources deletion operations : clean minio server configuration folder
func onDeleteObjectsConfig(ctx context.Context, objectConfigName string) {
	if err := DeleteMinioConfigDir(objectConfigName); err != nil {
		log.Logger(ctx).Error("Could not remove configuration folder for object service " + objectConfigName)
	} else {
		log.Logger(ctx).Info("Removed configuration folder for object service " + objectConfigName)
	}
}

func NewTreeHandler() *TreeHandler {
	return &TreeHandler{
		FS: afero.NewBasePathFs(afero.NewOsFs(), "/"),
	}
}

type TreeHandler struct {
	FS afero.Fs
}

func (t *TreeHandler) FileInfoToNode(nodePath string, fileInfo os.FileInfo) *tree.Node {
	node := &tree.Node{
		Path:  nodePath,
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
		node.Type = tree.NodeType_LEAF
	}
	return node
}

func (t *TreeHandler) ReadNode(ctx context.Context, request *tree.ReadNodeRequest, response *tree.ReadNodeResponse) error {

	if fileInfo, e := t.FS.Stat(request.Node.Path); e != nil {
		return e
	} else {
		response.Node = t.FileInfoToNode(request.Node.Path, fileInfo)
	}
	return nil

}

func (t *TreeHandler) ListNodes(ctx context.Context, request *tree.ListNodesRequest, stream tree.NodeProvider_ListNodesStream) error {

	defer stream.Close()

	if fileInfos, e := afero.ReadDir(t.FS, request.Node.Path); e == nil {
		for _, info := range fileInfos {
			if strings.HasPrefix(info.Name(), ".") || !info.IsDir() {
				continue
			}
			path := filepath.Join(request.Node.Path, info.Name())
			stream.Send(&tree.ListNodesResponse{
				Node: t.FileInfoToNode(path, info),
			})
		}
		return nil
	} else {
		return e
	}

}
