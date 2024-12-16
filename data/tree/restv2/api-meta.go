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
	"context"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	rest2 "github.com/pydio/cells/v5/idm/meta/rest"
)

// BatchUpdateMeta PATCH /node/meta/batch
// Input rest.BatchUpdateMetaList, Output rest.BatchUpdateMetaList
func (h *Handler) BatchUpdateMeta(req *restful.Request, resp *restful.Response) error {
	input := &rest.BatchUpdateMetaList{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	putReq := &idm.UpdateUserMetaRequest{Operation: idm.UpdateUserMetaRequest_PUT}
	delReq := &idm.UpdateUserMetaRequest{Operation: idm.UpdateUserMetaRequest_DELETE}
	for _, u := range input.GetUpdates() {
		op := u.GetOperation()
		m := u.GetUserMeta()
		idMeta := &idm.UserMeta{
			NodeUuid:  m.GetNodeUuid(),
			Namespace: m.GetNamespace(),
			JsonValue: m.GetJsonValue(),
		}
		switch op {
		case rest.MetaUpdate_PUT:
			putReq.MetaDatas = append(putReq.MetaDatas, idMeta)
		case rest.MetaUpdate_DELETE:
			delReq.MetaDatas = append(delReq.MetaDatas, idMeta)
		}
	}
	if er := h.performMultipleMetaUpdates(ctx, putReq, delReq); er != nil {
		return er
	}
	return resp.WriteEntity(input)
}

// PatchNode PATCH /node/u/{Uuid}
func (h *Handler) PatchNode(req *restful.Request, resp *restful.Response) error {
	nodeUuid := req.PathParameter("Uuid")
	input := &rest.NodeUpdates{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	putReq := &idm.UpdateUserMetaRequest{Operation: idm.UpdateUserMetaRequest_PUT}
	delReq := &idm.UpdateUserMetaRequest{Operation: idm.UpdateUserMetaRequest_DELETE}

	if toggle := input.GetBookmark(); toggle != nil {
		// Create a bookmark update
		if toggle.Value {
			putReq.MetaDatas = append(putReq.MetaDatas, &idm.UserMeta{
				NodeUuid:  nodeUuid,
				Namespace: rest2.ReservedNSBookmark,
				JsonValue: "true",
			})
		} else {
			delReq.MetaDatas = append(delReq.MetaDatas, &idm.UserMeta{
				NodeUuid:  nodeUuid,
				Namespace: rest2.ReservedNSBookmark,
			})
		}
	}
	if toggle := input.GetContentLock(); toggle != nil {
		// Create a contentLock update - Value will be overriden by username automatically
		cLock := &idm.UserMeta{
			NodeUuid:  nodeUuid,
			Namespace: permissions.AclContentLock.Name,
		}
		if toggle.Value {
			putReq.MetaDatas = append(putReq.MetaDatas, cLock)
		} else {
			delReq.MetaDatas = append(delReq.MetaDatas, cLock)
		}
	}
	for _, u := range input.GetMetaUpdates() {
		m := &idm.UserMeta{
			NodeUuid:  nodeUuid,
			Namespace: u.GetUserMeta().GetNamespace(),
			JsonValue: u.GetUserMeta().GetJsonValue(),
		}
		switch u.GetOperation() {
		case rest.MetaUpdate_PUT:
			putReq.MetaDatas = append(putReq.MetaDatas, m)
		case rest.MetaUpdate_DELETE:
			delReq.MetaDatas = append(delReq.MetaDatas, m)
		}
	}

	if er := h.performMultipleMetaUpdates(ctx, putReq, delReq); er != nil {
		return er
	}

	// Return updated Node
	router := h.UuidClient(true)
	node, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	return resp.WriteEntity(h.TreeNodeToNode(node.GetNode()))
}

// ListNamespaces GET /node/meta/namespace
// Empty Input - Returns rest.UserMetaNamespaceCollection
func (h *Handler) ListNamespaces(req *restful.Request, resp *restful.Response) error {
	ctx := req.Request.Context()
	nn, er := h.UserMetaHandler.ListAllNamespaces(ctx, idmc.UserMetaServiceClient(ctx))
	if er != nil {
		return er
	}
	out := &rest.UserMetaNamespaceCollection{}
	for _, ns := range nn {
		out.Namespaces = append(out.Namespaces, ns)
	}
	return resp.WriteEntity(out)
}

// UserBookmarks GET /node/bookmarks
// Empty input - returns NodeCollection
func (h *Handler) UserBookmarks(req *restful.Request, resp *restful.Response) error {
	output := &rest.NodeCollection{}

	searchRequest := &idm.SearchUserMetaRequest{
		Namespace: rest2.ReservedNSBookmark,
	}
	ctx := req.Request.Context()
	router := h.UuidClient(true)
	res, e := h.UserMetaHandler.PerformSearchMetaRequest(ctx, searchRequest)
	if e != nil {
		return e
	}
	for _, metadata := range res.Metadatas {
		node := &tree.Node{
			Uuid: metadata.NodeUuid,
		}
		if rr, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); e == nil {
			n := rr.GetNode()
			output.Nodes = append(output.Nodes, h.TreeNodeToNode(n))
		} else {
			log.Logger(ctx).Debug("Ignoring Bookmark: ", zap.Error(e))
		}
	}

	return resp.WriteEntity(output)
}

// SearchMeta POST /node/meta
// Input idm.SearchUserMetaRequest / Output rest.UserMetaList
func (h *Handler) SearchMeta(req *restful.Request, resp *restful.Response) error {
	input := &idm.SearchUserMetaRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	res, er := h.UserMetaHandler.PerformSearchMetaRequest(ctx, input)
	if er != nil {
		return er
	}
	output := &rest.UserMetaList{}
	for _, meta := range res.GetMetadatas() {
		output.UserMeta = append(output.UserMeta, &rest.UserMeta{
			NodeUuid:  meta.GetNodeUuid(),
			Namespace: meta.GetNamespace(),
			JsonValue: meta.GetJsonValue(),
			Editable:  meta.PoliciesContextEditable,
		})
	}
	return resp.WriteEntity(output)
}

// ListNamespaceValues GET /node/meta/namespace/{Namespace}
// Input based on path parameter, output rest.NamespaceValuesResponse
func (h *Handler) ListNamespaceValues(req *restful.Request, resp *restful.Response) error {
	ns := req.PathParameter("Namespace")
	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Listing values for namespace " + ns)
	nss, er := h.UserMetaHandler.ListAllNamespaces(ctx, idmc.UserMetaServiceClient(ctx))
	if er != nil {
		return er
	}
	if _, ok := nss[ns]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", ns)
	}
	out := &rest.NamespaceValuesResponse{}
	out.Values, _ = h.UserMetaHandler.ValuesClient.ListTags(ctx, ns)
	return resp.WriteEntity(out)
}

// UpdateNamespaceValues PATCH /node/meta/namespace/{Namespace}
// Input rest.NamespaceValuesRequest, output rest.NamespaceValuesResponse
func (h *Handler) UpdateNamespaceValues(req *restful.Request, resp *restful.Response) error {
	namespace := req.PathParameter("Namespace")
	input := &rest.NamespaceValuesRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	op := input.GetOperation()
	if op == nil {
		return errors.WithMessage(errors.StatusBadRequest, "operation required")
	}

	ctx := req.Request.Context()
	nss, er := h.UserMetaHandler.ListAllNamespaces(ctx, idmc.UserMetaServiceClient(ctx))
	if er != nil {
		return er
	}
	if nsObject, ok := nss[namespace]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", namespace)
	} else if !nsObject.PoliciesContextEditable {
		return errors.WithMessagef(errors.StatusForbidden, "updating namespace %s is not allowed", namespace)
	}
	tc := h.UserMetaHandler.ValuesClient

	var err error
	switch op.Operation {
	case rest.NsOp_PUT:
		err = tc.StoreNewTags(ctx, namespace, op.GetValues())
	case rest.NsOp_DELETE:
		for _, t := range op.GetValues() {
			if t == "*" {
				err = tc.DeleteAllTags(ctx, namespace)
			} else {
				return errors.WithMessage(errors.StatusNotImplemented, "only * to delete all tags is supported")
			}
		}
	default:
		return errors.WithMessage(errors.StatusBadRequest, "invalid operation")
	}
	if err != nil {
		return err
	}
	// Refresh tag list for output
	out := &rest.NamespaceValuesResponse{}
	out.Values, _ = tc.ListTags(ctx, namespace)
	return resp.WriteEntity(out)
}

func (h *Handler) performMultipleMetaUpdates(ctx context.Context, reqs ...*idm.UpdateUserMetaRequest) error {
	for _, req := range reqs {
		if len(req.MetaDatas) > 0 {
			if _, er := h.UserMetaHandler.PerformUserMetaUpdate(ctx, req); er != nil {
				return er
			}
		}
	}
	return nil
}
