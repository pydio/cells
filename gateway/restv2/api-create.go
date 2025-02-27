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
	"path"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
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
		for _, meta := range n.GetMetadata() {
			var i interface{}
			if er := json.Unmarshal([]byte(meta.JsonValue), &i); er != nil {
				return errors.Tag(er, errors.InvalidParameters)
			}
			node.MustSetMeta(meta.GetNamespace(), i)
		}
		if n.DraftMode {
			node.MustSetMeta(common.InputDraftMode, true)
		}
		if n.ResourceUuid != "" {
			node.MustSetMeta(common.InputResourceUUID, n.ResourceUuid)
		}
		if n.VersionId != "" {
			node.MustSetMeta(common.InputVersionId, n.VersionId)
		}
		tpl := n.GetTemplateUuid()
		byTpl[tpl] = append(byTpl[tpl], node)
	}
	output := &rest.NodeCollection{}
	// tpl may be an empty string
	for tpl, newNodes := range byTpl {
		nn, er := userspace.MkDirsOrFiles(ctx, h.TreeHandler.GetRouter(), newNodes, input.Recursive, tpl)
		if er != nil {
			return er
		}
		output.Nodes = append(output.Nodes, h.TreeNodesToNodes(ctx, nn)...)
	}
	return resp.WriteEntity(output)
}

// CreateCheck performs some validation checks before creating resources
// Api Endpoint: POST /node/create/precheck
func (h *Handler) CreateCheck(req *restful.Request, resp *restful.Response) error {
	input := &rest.CreateCheckRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	findNext := input.GetFindAvailablePath()
	output := &rest.CreateCheckResponse{}
	pathRouter := h.TreeHandler.GetRouter()
	uuidRouter := h.UuidClient(true)
	for _, n := range input.GetInputs() {
		var handler nodes.Handler
		targetNode := &tree.Node{}
		pa := n.GetLocator().GetPath()
		if pa != "" {
			handler = pathRouter
			targetNode.SetPath(pa)
		} else {
			handler = uuidRouter
			targetNode.SetUuid(n.GetLocator().GetUuid())
		}
		cr := &rest.CheckResult{InputLocator: n.GetLocator(), Exists: false}
		if rr, er := handler.ReadNode(ctx, &tree.ReadNodeRequest{Node: targetNode, StatFlags: []uint32{tree.StatFlagMetaMinimal}}); er == nil {
			cr.Exists = true
			cr.Node = h.TreeNodeToNode(ctx, rr.GetNode())
			if pa != "" && findNext {
				// Find next available name
				var childrenLocks []string
				if parentResp, er := pathRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Dir(targetNode.Path)}}); er == nil {
					if cl, err := permissions.GetChildrenLocks(ctx, parentResp.GetNode()); err != nil {
						return errors.WithMessage(err, "cannot find next available path (children locks)")
					} else {
						childrenLocks = append(childrenLocks, cl...)
					}
				}
				if err := nodes.SuffixPathIfNecessary(ctx, pathRouter, targetNode, n.Type == tree.NodeType_COLLECTION, childrenLocks...); err == nil {
					cr.NextPath = targetNode.GetPath()
				} else {
					return errors.WithMessage(err, "cannot find next available path")
				}
			}
			output.Results = append(output.Results, cr)
		} else if errors.Is(er, errors.NodeNotFound) {
			output.Results = append(output.Results, cr)
		} else {
			return er
		}
	}
	return resp.WriteEntity(output)
}
