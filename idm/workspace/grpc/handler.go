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
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/sql/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/slug"
	"github.com/pydio/cells/v4/idm/workspace"
)

// Handler definition
type Handler struct {
	idm.UnimplementedWorkspaceServiceServer
	service.UnimplementedLoginModifierServer
}

func NewHandler() *Handler {
	return &Handler{}
}

// CreateWorkspace in database
func (h *Handler) CreateWorkspace(ctx context.Context, req *idm.CreateWorkspaceRequest) (*idm.CreateWorkspaceResponse, error) {
	dao, err := manager.Resolve[workspace.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if req.Workspace.Slug == "" {
		req.Workspace.Slug = slug.Make(req.Workspace.Label)
	}
	update, err := dao.Add(ctx, req.Workspace)
	// ADD POLICIES
	if len(req.Workspace.Policies) > 0 {
		if e := dao.AddPolicies(ctx, update, req.Workspace.UUID, req.Workspace.Policies); e != nil {
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
	dao, err := manager.Resolve[workspace.DAO](ctx)
	if err != nil {
		return nil, err
	}

	workspaces := new([]interface{})
	req.Query = service.PrepareResourcePolicyQuery(req.Query, service.ResourcePolicyAction_READ)
	if err := dao.Search(ctx, req.Query, workspaces); err != nil {
		return nil, err
	}

	numRows, err := dao.Del(ctx, req.Query)
	response := &idm.DeleteWorkspaceResponse{
		RowsDeleted: numRows,
	}
	if err != nil {
		return nil, err
	}

	// Update relevant policies and propagate event
	for _, w := range *workspaces {
		currW := w.(*idm.Workspace)
		err2 := dao.DeletePoliciesForResource(ctx, currW.UUID)
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

	dao, err := manager.Resolve[workspace.DAO](ctx)
	if err != nil {
		return err
	}

	workspaces := new([]interface{})
	request.Query = service.PrepareResourcePolicyQuery(request.Query, service.ResourcePolicyAction_READ)
	if err := dao.Search(ctx, request.Query, workspaces); err != nil {
		return err
	}
	var e error
	for _, in := range *workspaces {
		ws, ok := in.(*idm.Workspace)
		if ws.Policies, e = dao.GetPoliciesForResource(ctx, ws.UUID); e != nil {
			log.Logger(ctx).Error("cannot load policies for workspace "+ws.UUID, zap.Error(e))
			continue
		}
		if !ok {
			if e := response.SendMsg(errors.WithMessage(errors.StatusInternalServerError, "Wrong type")); e != nil {
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

	dao, err := manager.Resolve[workspace.DAO](ctx)
	if err != nil {
		return err
	}

	for {
		incoming, err := streamer.Recv()
		if incoming == nil {
			continue
		}
		if err != nil {
			break
		}

		workspaces := new([]interface{})

		incoming.Query = service.PrepareResourcePolicyQuery(incoming.Query, service.ResourcePolicyAction_READ)
		if err := dao.Search(ctx, incoming.Query, workspaces); err != nil {
			continue
		}

		var e error
		for _, in := range *workspaces {
			if ws, ok := in.(*idm.Workspace); ok {
				if ws.Policies, e = dao.GetPoliciesForResource(ctx, ws.UUID); e != nil {
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

func (h *Handler) ModifyLogin(ctx context.Context, req *service.ModifyLoginRequest) (*service.ModifyLoginResponse, error) {
	dao, err := manager.Resolve[workspace.DAO](ctx)
	if err != nil {
		return nil, err
	}
	return resources.ModifyLogin(ctx, dao, req)
}
