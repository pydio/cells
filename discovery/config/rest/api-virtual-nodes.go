/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package rest

import (
	restful "github.com/emicklei/go-restful/v3"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/docstorec"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
)

/****************************
VERSIONING POLICIES MANAGEMENT
*****************************/

// ListVirtualNodes list all defined template paths.
func (s *Handler) ListVirtualNodes(req *restful.Request, resp *restful.Response) {
	//T := lang.Bundle().GetTranslationFunc(utils.UserLanguagesFromRestRequest(req)...)
	ctx := req.Request.Context()
	docs, er := docstorec.DocStoreClient(ctx).ListDocuments(ctx, &docstore.ListDocumentsRequest{
		StoreID: common.DocStoreIdVirtualNodes,
	})
	if er != nil {
		middleware.RestError500(req, resp, er)
		return
	}
	response := &rest.NodesCollection{}
	for {
		r, e := docs.Recv()
		if e != nil {
			break
		}
		var vNode tree.Node
		if er := protojson.Unmarshal([]byte(r.Document.Data), &vNode); er == nil {
			response.Children = append(response.Children, &vNode)
		}
	}
	resp.WriteEntity(response)
}
