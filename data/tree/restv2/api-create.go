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

package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

// Create creates folders or files - Files are empty or hydrated from a template
// Api Endpoint: POST /node/create
func (h *Handler) Create(req *restful.Request, resp *restful.Response) error {
	input := &rest.CreateRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	byTpl := map[string][]*tree.Node{}
	for _, n := range input.GetInputs() {
		node := &tree.Node{
			Path: n.GetLocator().GetPath(),
			Type: n.GetType(),
		}
		if cType := n.GetContentType(); cType != "" {
			node.MustSetMeta(common.MetaNamespaceMime, cType)
		}
		tpl := n.GetTemplateUuid()
		byTpl[tpl] = append(byTpl[tpl], node)
	}
	output := &rest.NodeCollection{}
	// tpl may be an empty string
	for tpl, nodes := range byTpl {
		nn, er := userspace.MkDirsOrFiles(ctx, h.TreeHandler.GetRouter(), nodes, input.Recursive, tpl)
		if er != nil {
			return er
		}
		output.Nodes = append(output.Nodes, h.TreeNodesToNodes(nn)...)
	}
	return resp.WriteEntity(output)
}
