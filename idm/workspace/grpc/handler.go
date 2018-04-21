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

	"github.com/gosimple/slug"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/workspace"
)

// Handler definition
type Handler struct{}

// CreateWorkspace in database
func (h *Handler) CreateWorkspace(ctx context.Context, req *idm.CreateWorkspaceRequest, resp *idm.CreateWorkspaceResponse) error {
	dao := servicecontext.GetDAO(ctx).(workspace.DAO)

	if req.Workspace.Slug == "" {
		req.Workspace.Slug = slug.Make(req.Workspace.Label)
	}
	update, err := dao.Add(req.Workspace)
	// ADD POLICIES
	if len(req.Workspace.Policies) > 0 {
		if e := dao.AddPolicies(update, req.Workspace.UUID, req.Workspace.Policies); e != nil {
			return e
		}
	}
	resp.Workspace = req.Workspace
	if err != nil {
		return err
	}

	// Propagate creation or update event
	client.Publish(ctx, client.NewPublication(common.TOPIC_IDM_EVENT, &idm.ChangeEvent{
		Type:      idm.ChangeEventType_UPDATE,
		Workspace: req.Workspace,
	}))
	if update {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Workspace %s has been updated", req.Workspace.Slug),
			log.GetAuditId(common.AUDIT_WS_UPDATE),
			req.Workspace.ZapUuid(),
		)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Workspace %s has been created", req.Workspace.Slug),
			log.GetAuditId(common.AUDIT_WS_CREATE),
			req.Workspace.ZapUuid(),
		)
	}

	return nil
}

// DeleteWorkspace from database
func (h *Handler) DeleteWorkspace(ctx context.Context, req *idm.DeleteWorkspaceRequest, response *idm.DeleteWorkspaceResponse) error {
	dao := servicecontext.GetDAO(ctx).(workspace.DAO)

	workspaces := new([]interface{})
	if err := dao.Search(req.Query, workspaces); err != nil {
		return err
	}

	numRows, err := dao.Del(req.Query)
	response.RowsDeleted = numRows
	if err != nil {
		return err
	}

	// Update relevant policies and propagate event
	for _, w := range *workspaces {
		currW := w.(*idm.Workspace)
		err2 := dao.DeletePoliciesForResource(currW.UUID)
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies for removed ws "+currW.Slug, zap.Error(err2))
			continue
		}

		client.Publish(ctx, client.NewPublication(common.TOPIC_IDM_EVENT, &idm.ChangeEvent{
			Type:      idm.ChangeEventType_DELETE,
			Workspace: w.(*idm.Workspace),
		}))
		log.Auditer(ctx).Info(
			fmt.Sprintf("Workspace %s has been deleted", currW.Slug),
			log.GetAuditId(common.AUDIT_WS_DELETE),
			currW.ZapUuid(),
		)
	}

	return nil
}

// SearchWorkspace in database
func (h *Handler) SearchWorkspace(ctx context.Context, request *idm.SearchWorkspaceRequest, response idm.WorkspaceService_SearchWorkspaceStream) error {
	dao := servicecontext.GetDAO(ctx).(workspace.DAO)
	defer response.Close()

	workspaces := new([]interface{})
	if err := dao.Search(request.Query, workspaces); err != nil {
		return err
	}
	var e error
	for _, in := range *workspaces {
		ws, ok := in.(*idm.Workspace)
		if ws.Policies, e = dao.GetPoliciesForResource(ws.UUID); e != nil {
			log.Logger(ctx).Error("cannot load policies for workspace "+ws.UUID, zap.Error(e))
			continue
		}
		if !ok {
			response.SendMsg(errors.InternalServerError(common.SERVICE_WORKSPACE, "Wrong type"))
		} else {
			response.Send(&idm.SearchWorkspaceResponse{Workspace: ws})
		}
	}

	return nil
}

// StreamWorkspace from database
func (h *Handler) StreamWorkspace(ctx context.Context, streamer idm.WorkspaceService_StreamWorkspaceStream) error {
	dao := servicecontext.GetDAO(ctx).(workspace.DAO)

	defer streamer.Close()

	for {
		incoming, err := streamer.Recv()
		if incoming == nil {
			continue
		}
		if err != nil {
			break
		}

		workspaces := new([]interface{})
		if err := dao.Search(incoming.Query, workspaces); err != nil {
			continue
		}

		var e error
		for _, in := range *workspaces {
			if ws, ok := in.(*idm.Workspace); ok {
				if ws.Policies, e = dao.GetPoliciesForResource(ws.UUID); e != nil {
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
