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

// Package grpc exposes the document store api in GRPC
package grpc

import (
	"context"
	"path"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	proto "github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/docstore"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE),
		service.Tag(common.SERVICE_TAG_DATA),
		service.Description("Generic document store"),
		service.WithMicro(func(m micro.Service) error {

			serviceDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DOCSTORE)
			if e != nil {
				return e
			}

			store, err := docstore.NewBoltStore(path.Join(serviceDir, "docstore.db"))
			if err != nil {
				return err
			}

			indexer, err := docstore.NewBleveEngine(path.Join(serviceDir, "docstore.bleve"))
			if err != nil {
				return err
			}

			handler := &Handler{
				Db:      store,
				Indexer: indexer,
			}

			for id, json := range defaults() {
				if doc, e := store.GetDocument(common.DOCSTORE_ID_VIRTUALNODES, id); e == nil && doc != nil {
					continue // Already defined
				}
				handler.PutDocument(context.Background(),
					&proto.PutDocumentRequest{StoreID: common.DOCSTORE_ID_VIRTUALNODES, DocumentID: id, Document: &proto.Document{
						ID:            id,
						Owner:         common.PYDIO_SYSTEM_USERNAME,
						Data:          json,
						IndexableMeta: json,
					}}, &proto.PutDocumentResponse{})
			}

			m.Init(micro.BeforeStop(handler.Close))

			proto.RegisterDocStoreHandler(m.Options().Server, handler)

			return nil
		}),
	)
}

func defaults() map[string]string {

	return map[string]string{
		"my-files": "{\"Uuid\":\"my-files\",\"Path\":\"my-files\",\"Type\":\"COLLECTION\",\"MetaStore\":{\"name\":\"my-files\",\"resolution\":\"\\/\\/ Default node used for storing personal users data in separate folders. \\n\\/\\/ Use Ctrl+Space to see the objects available for completion.\\nPath = DataSources.personal + \\\"\\/\\\" + User.Name;\",\"contentType\":\"text\\/javascript\"}}",
		"cells":    "{\"Uuid\":\"cells\",\"Path\":\"cells\",\"Type\":\"COLLECTION\",\"MetaStore\":{\"name\":\"cells\",\"resolution\":\"\\/\\/ Default node used as parent for creating empty cells. \\n\\/\\/ Use Ctrl+Space to see the objects available for completion.\\nPath = DataSources.cellsdata + \\\"\\/\\\" + User.Name;\",\"contentType\":\"text\\/javascript\"}}",
	}

}
