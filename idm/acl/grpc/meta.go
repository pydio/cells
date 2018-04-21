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

package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/idm/acl"
)

// Implements ReadNodeStream to be a meta provider
func (h *Handler) ReadNodeStream(ctx context.Context, stream tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)
	defer stream.Close()

	for {
		req, er := stream.Recv()
		if req == nil {
			break
		}
		if er != nil {
			return er
		}
		node := req.Node

		acls := new([]interface{})
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs: []string{node.Uuid},
			Actions: []*idm.ACLAction{
				{Name: "content_lock"},
			},
		})
		dao.Search(&service.Query{SubQueries: []*any.Any{q}}, acls)
		for _, in := range *acls {
			val, _ := in.(*idm.ACL)
			node.SetMeta("content_lock", val.Action.Value)
			break
		}
		stream.Send(&tree.ReadNodeResponse{Node: node})
	}

	return nil
}
