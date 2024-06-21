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

// Package rest implements all the share logic for Cells and Links.
//
// It is a high-level service using many other services for crud-ing shares through the REST API.
package rest

import (
	"context"
	"fmt"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/share"
)

// SharesHandler implements handler methods for the share REST service.
type SharesHandler struct {
	sc  *share.Client
	ctx context.Context
	resources.ResourceProviderHandler
}

// NewSharesHandler simply creates a new SharesHandler.
func NewSharesHandler(ctx context.Context) *SharesHandler {
	h := new(SharesHandler)
	h.ctx = ctx
	h.sc = share.NewClient(ctx, h)
	h.ServiceName = common.ServiceWorkspace
	h.ResourceName = "rooms"
	//h.PoliciesLoader = h.loadPoliciesForResource
	return h
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service.
func (h *SharesHandler) SwaggerTags() []string {
	return []string{"ShareService"}
}

// Filter returns a function to filter the swagger path.
func (h *SharesHandler) Filter() func(string) string {
	return nil
}

func (h *SharesHandler) IdmUserFromClaims(ctx context.Context) (*idm.User, error) {
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	if claims.Subject == "" {
		return nil, errors.WithMessage(errors.InvalidIDToken, "missing subject on claims")
	}
	u, e := permissions.SearchUniqueUser(ctx, "", claims.Subject)
	if e != nil {
		return nil, errors.WithMessage(errors.ContextUserNotFound, e.Error())
	}
	return u, nil
}

// PutCell creates or updates a shared room (a.k.a a Cell) via REST API.
func (h *SharesHandler) PutCell(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var shareRequest rest.PutCellRequest
	if err := req.ReadEntity(&shareRequest); err != nil {
		return err
	}
	log.Logger(ctx).Debug("Received Share.Cell API request", zap.Any("input", &shareRequest))
	ownerUser, er := h.IdmUserFromClaims(ctx)
	if er != nil {
		return er
	}

	if err := h.docStoreStatus(ctx); err != nil {
		return er
	}

	// Init Root Nodes and check permissions
	hasReadonly, err := h.sc.ParseRootNodes(ctx, shareRequest.Room, shareRequest.CreateEmptyRoot)
	if err != nil {
		return er
	}

	// Detect if one root has an access set via policy
	parentPol, e := h.sc.DetectInheritedPolicy(ctx, shareRequest.Room.RootNodes, nil)
	if e != nil {
		return e
	}

	if e = h.sc.CheckCellOptionsAgainstConfigs(ctx, shareRequest.Room); e != nil {
		return e
	}

	if output, err := h.sc.UpsertCell(ctx, shareRequest.Room, ownerUser, hasReadonly, parentPol); err != nil {
		return err
	} else {
		return rsp.WriteEntity(output)
	}

}

// GetCell simply retrieves a shared room from its UUID.
func (h *SharesHandler) GetCell(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	workspace, err := h.sc.GetCellWorkspace(ctx, id)
	if err != nil {
		return err
	}
	acl, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return err
	}

	if output, err := h.sc.WorkspaceToCellObject(ctx, workspace, acl); err != nil {
		return err
	} else {
		return rsp.WriteEntity(output)
	}

}

// DeleteCell loads the workspace and its root nodes and eventually removes room root totally.
func (h *SharesHandler) DeleteCell(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")
	ownerLogin, _ := permissions.FindUserNameInContext(ctx)
	if ownerLogin == "" {
		return errors.WithStack(errors.ContextUserNotFound)
	}
	if err := h.sc.DeleteCell(ctx, id, ownerLogin); err != nil {
		return err
	} else {
		return rsp.WriteEntity(&rest.DeleteCellResponse{Success: true})
	}

}

// PutShareLink creates or updates a link to a shared item.
func (h *SharesHandler) PutShareLink(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()

	var putRequest rest.PutShareLinkRequest
	if err := req.ReadEntity(&putRequest); err != nil {
		return err
	}
	if err := h.docStoreStatus(ctx); err != nil {
		return err
	}

	link := putRequest.ShareLink
	rootWorkspaces, files, folders, e := h.sc.CheckLinkRootNodes(ctx, link)
	if e != nil {
		return e
	}
	parentPolicy, e := h.sc.DetectInheritedPolicy(ctx, link.RootNodes, rootWorkspaces)
	if e != nil {
		return e
	}

	pluginOptions, e := h.sc.CheckLinkOptionsAgainstConfigs(ctx, link, rootWorkspaces, files, folders)
	if e != nil {
		return e
	} else if pluginOptions.ShareForcePassword && !putRequest.PasswordEnabled {
		return errors.WithStack(errors.ShareLinkPasswordRequired)
	}

	ownerUser, er := h.IdmUserFromClaims(ctx)
	if er != nil {
		return er
	}

	output, er := h.sc.UpsertLink(ctx, link, &putRequest, ownerUser, parentPolicy, pluginOptions)
	if er != nil {
		return er
	} else {
		return rsp.WriteEntity(output)
	}

}

// GetShareLink loads link information.
func (h *SharesHandler) GetShareLink(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	output, err := h.sc.LinkById(ctx, id)
	if err != nil {
		return err
	}
	return rsp.WriteEntity(output)

}

// DeleteShareLink deletes a link information.
func (h *SharesHandler) DeleteShareLink(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	if err := h.docStoreStatus(ctx); err != nil {
		return err
	}

	if err := h.sc.DeleteLink(ctx, id); err != nil {
		return err
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Removed share link [%s]", id),
		log.GetAuditId(common.AuditLinkUpdate),
		zap.String(common.KeyLinkUuid, id),
		zap.String(common.KeyWorkspaceUuid, id),
	)

	return rsp.WriteEntity(&rest.DeleteShareLinkResponse{
		Success: true,
	})

}

// UpdateSharePolicies updates policies associated to the underlying workspace
func (h *SharesHandler) UpdateSharePolicies(req *restful.Request, rsp *restful.Response) error {
	var input rest.UpdateSharePoliciesRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	}
	ctx := req.Request.Context()
	if err := h.docStoreStatus(ctx); err != nil {
		return err
	}
	cli := idm.NewWorkspaceServiceClient(grpc.ResolveConn(h.ctx, common.ServiceWorkspace))
	ws, err := permissions.SearchUniqueWorkspace(ctx, input.Uuid, "")
	if err != nil {
		return err
	}
	if ws.Scope != idm.WorkspaceScope_LINK && ws.Scope != idm.WorkspaceScope_ROOM {
		return errors.WithStack(errors.ShareWrongType)
	}
	if !h.MatchPolicies(ctx, ws.UUID, ws.Policies, service2.ResourcePolicyAction_WRITE) {
		return errors.WithStack(errors.ShareNotEditable)
	}

	ws.Policies = input.Policies
	resp, e := cli.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws})
	if e != nil {
		return e
	}

	log.Logger(ctx).Info("Updated policies for share", zap.String("uuid", input.Uuid))
	log.Auditer(ctx).Info("Updated policies for share", ws.ZapUuid())
	response := &rest.UpdateSharePoliciesResponse{
		Success:                 true,
		Policies:                resp.Workspace.Policies,
		PoliciesContextEditable: resp.Workspace.PoliciesContextEditable,
	}
	return rsp.WriteEntity(response)

}

func (h *SharesHandler) docStoreStatus(ctx context.Context) error {
	cli := grpc_health_v1.NewHealthClient(grpc.ResolveConn(ctx, common.ServiceDocStore))
	_, er := cli.Check(context.Background(), &grpc_health_v1.HealthCheckRequest{})
	return er
}
