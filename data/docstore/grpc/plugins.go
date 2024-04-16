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

// Package grpc exposes the document store api in GRPC
package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/docstore"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceDocStore
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Generic document store"),
			service.WithStorageDrivers(docstore.NewBleveDAO, docstore.NewMongoDAO),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				handler := &Handler{}

				proto.RegisterDocStoreEnhancedServer(srv, handler)
				sync.RegisterSyncEndpointEnhancedServer(srv, handler)

				return nil
			}),
		)

		// TODO
		//for id, json := range defaults() {
		//	if doc, e := dao.GetDocument(common.DocStoreIdVirtualNodes, id); e == nil && doc != nil {
		//		var reStore bool
		//		if id == "my-files" {
		//			// Check if my-files is up-to-date
		//			var vNode tree.Node
		//			if e := protojson.Unmarshal([]byte(doc.Data), &vNode); e == nil {
		//				if _, ok := vNode.MetaStore["onDelete"]; !ok {
		//					log.Logger(ctx).Info("Upgrading my-files template path for onDelete policy")
		//					vNode.MetaStore["onDelete"] = "rename-uuid"
		//					bb, _ := protojson.Marshal(&vNode)
		//					json = string(bb)
		//					reStore = true
		//				}
		//			} else {
		//				log.Logger(ctx).Warn("Cannot unmarshall", zap.Error(e))
		//			}
		//		}
		//		if !reStore {
		//			continue
		//		}
		//	}
		//	_, e := handler.PutDocument(context.Background(),
		//		&proto.PutDocumentRequest{StoreID: common.DocStoreIdVirtualNodes, DocumentID: id, Document: &proto.Document{
		//			ID:    id,
		//			Owner: common.PydioSystemUsername,
		//			Data:  json,
		//		}})
		//	if e != nil {
		//		log.Logger(ctx).Warn("Cannot insert initial docs", zap.Error(e))
		//	}
		//}

	})
}

func defaults() map[string]string {

	return map[string]string{
		"my-files": `{"Uuid":"my-files","Path":"my-files","Type":"COLLECTION","MetaStore":{"name":"my-files", "onDelete":"rename-uuid","resolution":"\/\/ Default node used for storing personal users data in separate folders. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nPath = DataSources.personal + \"\/\" + User.Name;","contentType":"text\/javascript"}}`,
		"cells":    `{"Uuid":"cells","Path":"cells","Type":"COLLECTION","MetaStore":{"name":"cells","resolution":"\/\/ Default node used as parent for creating empty cells. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nPath = DataSources.cellsdata + \"\/\" + User.Name;","contentType":"text\/javascript"}}`,
	}

}
