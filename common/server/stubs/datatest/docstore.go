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

package datatest

import (
	"context"
	"os"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/data/docstore/dao/bleve"
	srv "github.com/pydio/cells/v4/data/docstore/grpc"
)

func defaults() map[string]string {

	return map[string]string{
		"my-files": `{"Uuid":"my-files","Path":"my-files","Type":"COLLECTION","MetaStore":{"name":"my-files", "onDelete":"rename-uuid","resolution":"\/\/ Default node used for storing personal users data in separate folders. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nPath = DataSources.personal + \"\/\" + User.Name;","contentType":"text\/javascript"}}`,
		"cells":    `{"Uuid":"cells","Path":"cells","Type":"COLLECTION","MetaStore":{"name":"cells","resolution":"\/\/ Default node used as parent for creating empty cells. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nPath = DataSources.cellsdata + \"\/\" + User.Name;","contentType":"text\/javascript"}}`,
	}

}

func NewDocStoreService() (grpc.ClientConnInterface, error) {

	/*
		pBolt := newPath("docstore" + uuid.New() + ".db")
		d, _, e := test.OnFileTestDAO("boltdb", pBolt, "", "docstore-test1", false, docstore2.NewDAO)
		if e != nil {
			return nil, e
		}

		h := &srv.Handler{
			DAO: d.(*docstore2.BleveServer),
		}*/
	tmpPath := os.TempDir()
	short := uuid.New()[:6]
	conns := []string{
		"bolt://" + tmpPath + "/docstore-" + short + ".db",
		"bleve://" + tmpPath + "/docstore-" + short + ".bleve",
	}
	ctx, err := manager.DSNtoContextDAO(context.Background(), conns, bleve.NewBleveDAO)
	if err != nil {
		return nil, err
	}
	serv := &proto.DocStoreStub{}
	serv.DocStoreServer = &srv.Handler{}

	for id, json := range defaults() {
		_, er := serv.DocStoreServer.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID:    common.DocStoreIdVirtualNodes,
			DocumentID: id,
			Document: &proto.Document{
				ID:    id,
				Type:  proto.DocumentType_JSON,
				Owner: common.PydioSystemUsername,
				Data:  json,
			},
		})
		if er != nil {
			return nil, er
		}
	}
	return serv, nil
}
