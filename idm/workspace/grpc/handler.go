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
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/slug"
	"github.com/pydio/cells/v4/idm/workspace"
)

// Handler definition
type Handler struct {
	idm.UnimplementedWorkspaceServiceServer
	dao workspace.DAO
}

func NewHandler(ctx context.Context, dao workspace.DAO) idm.WorkspaceServiceServer {
	return &Handler{dao: dao}
}

func (h *Handler) Name() string {
	return ServiceName
}

// CreateWorkspace in database
func (h *Handler) CreateWorkspace(ctx context.Context, req *idm.CreateWorkspaceRequest) (*idm.CreateWorkspaceResponse, error) {

	if req.Workspace.Slug == "" {
		req.Workspace.Slug = slug.Make(req.Workspace.Label)
	}
	update, err := h.dao.Add(req.Workspace)
	// ADD POLICIES
	if len(req.Workspace.Policies) > 0 {
		if e := h.dao.AddPolicies(update, req.Workspace.UUID, req.Workspace.Policies); e != nil {
			return nil, e
		}
	}
	resp := &idm.CreateWorkspaceResponse{
		Workspace: req.Workspace,
	}
	if err != nil {
		return nil, err
	}

	if update {
		// Propagate creation or update event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type:      idm.ChangeEventType_UPDATE,
			Workspace: req.Workspace,
		})
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated workspace [%s]", req.Workspace.Slug),
			log.GetAuditId(common.AuditWsUpdate),
			req.Workspace.ZapUuid(),
		)
	} else {
		// Propagate creation or update event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type:      idm.ChangeEventType_CREATE,
			Workspace: req.Workspace,
		})
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created workspace [%s]", req.Workspace.Slug),
			log.GetAuditId(common.AuditWsCreate),
			req.Workspace.ZapUuid(),
		)
	}

	return resp, nil
}

// DeleteWorkspace from database
func (h *Handler) DeleteWorkspace(ctx context.Context, req *idm.DeleteWorkspaceRequest) (*idm.DeleteWorkspaceResponse, error) {

	workspaces := new([]interface{})
	if err := h.dao.Search(req.Query, workspaces); err != nil {
		return nil, err
	}

	numRows, err := h.dao.Del(req.Query)
	response := &idm.DeleteWorkspaceResponse{
		RowsDeleted: numRows,
	}
	if err != nil {
		return nil, err
	}

	// Update relevant policies and propagate event
	for _, w := range *workspaces {
		currW := w.(*idm.Workspace)
		err2 := h.dao.DeletePoliciesForResource(currW.UUID)
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies for removed ws "+currW.Slug, zap.Error(err2))
			continue
		}

		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type:      idm.ChangeEventType_DELETE,
			Workspace: w.(*idm.Workspace),
		})
		log.Auditer(ctx).Info(
			fmt.Sprintf("Deleted workspace [%s]", currW.Slug),
			log.GetAuditId(common.AuditWsDelete),
			currW.ZapUuid(),
		)
	}

	return response, nil
}

// SearchWorkspace in database
func (h *Handler) SearchWorkspace(request *idm.SearchWorkspaceRequest, response idm.WorkspaceService_SearchWorkspaceServer) error {

	ctx := response.Context()

	workspaces := new([]interface{})
	if err := h.dao.Search(request.Query, workspaces); err != nil {
		return err
	}
	var e error
	for _, in := range *workspaces {
		ws, ok := in.(*idm.Workspace)
		if ws.Policies, e = h.dao.GetPoliciesForResource(ws.UUID); e != nil {
			log.Logger(ctx).Error("cannot load policies for workspace "+ws.UUID, zap.Error(e))
			continue
		}
		if !ok {
			if e := response.SendMsg(errors.InternalServerError(common.ServiceWorkspace, "Wrong type")); e != nil {
				return e
			}
		} else {
			if e := response.Send(&idm.SearchWorkspaceResponse{Workspace: ws}); e != nil {
				return e
			}
		}
	}

	return nil
}

// StreamWorkspace from database
func (h *Handler) StreamWorkspace(streamer idm.WorkspaceService_StreamWorkspaceServer) error {

	ctx := streamer.Context()

	for {
		incoming, err := streamer.Recv()
		if incoming == nil {
			continue
		}
		if err != nil {
			break
		}

		workspaces := new([]interface{})
		if err := h.dao.Search(incoming.Query, workspaces); err != nil {
			continue
		}

		var e error
		for _, in := range *workspaces {
			if ws, ok := in.(*idm.Workspace); ok {
				if ws.Policies, e = h.dao.GetPoliciesForResource(ws.UUID); e != nil {
					log.Logger(ctx).Error("cannot load policies for workspace "+ws.UUID, zap.Error(e))
					continue
				}
				streamer.Send(&idm.SearchWorkspaceResponse{Workspace: ws})
			} else {
				streamer.Send(&idm.SearchWorkspaceResponse{})
			}
		}

		streamer.Send(&idm.SearchWorkspaceResponse{})
	}

	return nil
}
