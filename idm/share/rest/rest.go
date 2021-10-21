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
	"strings"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/idm/share"
)

// SharesHandler implements handler methods for the share REST service.
type SharesHandler struct {
	resources.ResourceProviderHandler
}

// NewSharesHandler simply creates a new SharesHandler.
func NewSharesHandler() *SharesHandler {
	h := new(SharesHandler)
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

func (h *SharesHandler) IdmUserFromClaims(ctx context.Context) *idm.User {
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userId := claims.Subject
	userName := claims.Name
	return &idm.User{
		Uuid:      userId,
		Login:     userName,
		GroupPath: claims.GroupPath,
	}
}

// PutCell creates or updates a shared room (a.k.a a Cell) via REST API.
func (h *SharesHandler) PutCell(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var shareRequest rest.PutCellRequest
	err := req.ReadEntity(&shareRequest)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch rest.CellRequest", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}
	log.Logger(ctx).Debug("Received Share.Cell API request", zap.Any("input", &shareRequest))
	ownerUser := h.IdmUserFromClaims(ctx)

	if err := h.docStoreStatus(); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	// Init Root Nodes and check permissions
	createdCellNode, readonly, err := share.ParseRootNodes(ctx, &shareRequest)
	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	// Detect if one root has an access set via policy
	parentPol, e := share.DetectInheritedPolicy(ctx, shareRequest.Room.RootNodes, nil)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	if e := share.CheckCellOptionsAgainstConfigs(ctx, &shareRequest); e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	workspace, wsCreated, err := share.GetOrCreateWorkspace(ctx, ownerUser, shareRequest.Room.Uuid, idm.WorkspaceScope_ROOM, shareRequest.Room.Label, shareRequest.Room.Description, false)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if !wsCreated && !h.IsContextEditable(ctx, workspace.UUID, workspace.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this cell"))
		return
	}

	// Now set ACLs on Workspace
	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	var currentAcls []*idm.ACL
	var currentRoots []string
	if !wsCreated {
		var err error
		currentAcls, currentRoots, err = share.CommonAclsForWorkspace(ctx, workspace.UUID)
		if err != nil {
			service.RestError500(req, rsp, err)
			return
		}
	} else {
		// New workspace, create "workspace-path" ACLs
		for _, node := range shareRequest.Room.RootNodes {
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: &idm.ACL{
					NodeID:      node.Uuid,
					WorkspaceID: workspace.UUID,
					Action:      &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: "uuid:" + node.Uuid},
				},
			})
		}
		// For new specific CellNode, set this node as a RecycleRoot
		if createdCellNode != nil {
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: &idm.ACL{
					NodeID:      createdCellNode.Uuid,
					WorkspaceID: workspace.UUID,
					Action:      permissions.AclRecycleRoot,
				},
			})
		}
	}
	log.Logger(ctx).Debug("Current Roots", log.DangerouslyZapSmallSlice("crt", currentRoots))
	targetAcls, e := share.ComputeTargetAcls(ctx, ownerUser, shareRequest.Room, workspace.UUID, readonly, parentPol)
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	log.Logger(ctx).Debug("Share ACLS", log.DangerouslyZapSmallSlice("current", currentAcls), log.DangerouslyZapSmallSlice("target", targetAcls))
	add, remove := share.DiffAcls(ctx, currentAcls, targetAcls)
	log.Logger(ctx).Debug("Diff ACLS", log.DangerouslyZapSmallSlice("add", add), log.DangerouslyZapSmallSlice("remove", remove))

	for _, acl := range remove {
		removeQuery, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs:      []string{acl.NodeID},
			RoleIDs:      []string{acl.RoleID},
			WorkspaceIDs: []string{acl.WorkspaceID},
			Actions:      []*idm.ACLAction{acl.Action},
		})
		_, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service2.Query{SubQueries: []*any.Any{removeQuery}}})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while deleting ACLs", zap.Error(err))
		}
	}
	for _, acl := range add {
		_, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while creating ACLs", zap.Error(err))
		}
	}

	log.Logger(ctx).Debug("Share Policies", log.DangerouslyZapSmallSlice("before", workspace.Policies))
	share.UpdatePoliciesFromAcls(ctx, workspace, currentAcls, targetAcls)

	// Now update workspace
	log.Logger(ctx).Debug("Updating workspace", zap.Any("workspace", workspace))
	wsClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())
	if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace}); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	// Put an Audit log if this cell has been newly created
	if wsCreated {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created cell [%s]", shareRequest.Room.Label),
			log.GetAuditId(common.AuditCellCreate),
			zap.String(common.KeyCellUuid, shareRequest.Room.Uuid),
			zap.String(common.KeyWorkspaceUuid, shareRequest.Room.Uuid),
		)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated cell [%s]", shareRequest.Room.Label),
			log.GetAuditId(common.AuditCellUpdate),
			zap.String(common.KeyCellUuid, shareRequest.Room.Uuid),
			zap.String(common.KeyWorkspaceUuid, shareRequest.Room.Uuid),
		)
	}

	if output, err := share.WorkspaceToCellObject(ctx, workspace, h); err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(output)
	}
}

// GetCell simply retrieves a shared room from its UUID.
func (h *SharesHandler) GetCell(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")
	ownerUser := h.IdmUserFromClaims(ctx)

	workspace, _, err := share.GetOrCreateWorkspace(ctx, ownerUser, id, idm.WorkspaceScope_ROOM, "", "", false)
	if err != nil {
		if errors.Parse(err.Error()).Code == 404 {
			service.RestError404(req, rsp, err)
		} else {
			service.RestError500(req, rsp, err)
		}
		return
	}

	if output, err := share.WorkspaceToCellObject(ctx, workspace, h); err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(output)
	}

}

// DeleteCell loads the workspace and its root nodes and eventually removes room root totally.
func (h *SharesHandler) DeleteCell(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")
	ownerUser := h.IdmUserFromClaims(ctx)

	ws, _, e := share.GetOrCreateWorkspace(ctx, ownerUser, id, idm.WorkspaceScope_ROOM, "", "", false)
	if e != nil || ws == nil {
		service.RestError404(req, rsp, e)
		return
	} else if !h.IsContextEditable(ctx, id, ws.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this room"))
		return
	}

	currWsLabel := ws.Label

	log.Logger(ctx).Debug("Delete share room", zap.Any("workspaceId", id))
	// This will load the workspace and its root, and eventually remove the Room root totally
	if err := share.DeleteWorkspace(ctx, ownerUser, idm.WorkspaceScope_ROOM, id, h); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	// Put an Audit log if this cell has been removed without error
	log.Auditer(ctx).Info(
		fmt.Sprintf("Removed cell [%s]", currWsLabel),
		log.GetAuditId(common.AuditCellDelete),
		zap.String(common.KeyCellUuid, id),
		zap.String(common.KeyWorkspaceUuid, id),
	)

	rsp.WriteEntity(&rest.DeleteCellResponse{
		Success: true,
	})
}

// PutShareLink creates or updates a link to a shared item.
func (h *SharesHandler) PutShareLink(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	start := time.Now()
	track := func(msg string) {
		log.Logger(ctx).Debug(msg, zap.Duration("t", time.Since(start)))
	}
	var putRequest rest.PutShareLinkRequest
	if err := req.ReadEntity(&putRequest); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if err := h.docStoreStatus(); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	link := putRequest.ShareLink
	rootWorkspaces, files, folders, e := share.CheckLinkRootNodes(ctx, link)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}
	parentPolicy, e := share.DetectInheritedPolicy(ctx, link.RootNodes, rootWorkspaces)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	pluginOptions, e := share.CheckLinkOptionsAgainstConfigs(ctx, link, rootWorkspaces, files, folders)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	} else if pluginOptions.ShareForcePassword && !putRequest.PasswordEnabled {
		service.RestError403(req, rsp, fmt.Errorf("password is required"))
		return
	}

	ownerUser := h.IdmUserFromClaims(ctx)
	var workspace *idm.Workspace
	var user *idm.User
	var err error
	var create bool
	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	if link.Uuid == "" {
		create = true
		workspace, _, err = share.GetOrCreateWorkspace(ctx, ownerUser, "", idm.WorkspaceScope_LINK, link.Label, link.Description, false)
		if err != nil {
			service.RestErrorDetect(req, rsp, err)
			return
		}
		track("GetOrCreateWorkspace")
		for _, node := range link.RootNodes {
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: &idm.ACL{
					NodeID:      node.Uuid,
					WorkspaceID: workspace.UUID,
					Action:      &idm.ACLAction{Name: "workspace-path", Value: "uuid:" + node.Uuid},
				},
			})
		}
		track("CreateACL")
		link.Uuid = workspace.UUID
		link.LinkHash = strings.Replace(uuid.New(), "-", "", -1)[0:pluginOptions.HashMinLength]
	} else {
		if putRequest.UpdateCustomHash != "" {
			if !pluginOptions.HashEditable {
				service.RestError403(req, rsp, errors.Forbidden("link.hash.not-editable", "You are not allowed to edit link manually"))
				return
			}
			if len(putRequest.UpdateCustomHash) < pluginOptions.HashMinLength {
				service.RestError403(req, rsp, errors.Forbidden("link.hash.min-length", "Please use a link hash with at least %d characters", pluginOptions.HashMinLength))
				return
			}
		}
		workspace, create, err = share.GetOrCreateWorkspace(ctx, ownerUser, link.Uuid, idm.WorkspaceScope_LINK, link.Label, link.Description, true)
	}
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if !create && !h.IsContextEditable(ctx, workspace.UUID, workspace.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this link"))
		return
	}
	track("IsContextEditable")

	// Load Hidden User
	user, err = share.GetOrCreateHiddenUser(ctx, ownerUser, link, putRequest.PasswordEnabled, putRequest.CreatePassword, false)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	track("GetOrCreateHiddenUser")
	if create {
		link.UserLogin = user.Login
		link.UserUuid = user.Uuid
		link.PasswordRequired = putRequest.PasswordEnabled
		// Update Workspace Policies to make sure it's readable by the new user
		workspace.Policies = append(workspace.Policies, &service2.ResourcePolicy{
			Resource: workspace.UUID,
			Subject:  fmt.Sprintf("user:%s", user.Login),
			Action:   service2.ResourcePolicyAction_READ,
			Effect:   service2.ResourcePolicy_allow,
		})
		wsClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())
		wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace})
		track("CreateWorkspace")
	} else {
		// Manage password if status was updated
		storedLink := &rest.ShareLink{Uuid: link.Uuid}
		share.LoadHashDocumentData(ctx, storedLink, []*idm.ACL{})

		link.PasswordRequired = storedLink.PasswordRequired
		var passNewEnable = putRequest.PasswordEnabled && !storedLink.PasswordRequired
		var passNewDisable = !putRequest.PasswordEnabled && storedLink.PasswordRequired
		var passUpdated = putRequest.PasswordEnabled && storedLink.PasswordRequired && putRequest.UpdatePassword != ""
		if passNewEnable || passNewDisable || passUpdated {
			// Password conditions have changed : re-create a new hidden user
			if e := share.DeleteHiddenUser(ctx, storedLink); e != nil {
				service.RestError500(req, rsp, e)
				return
			}
			storedLink.UserLogin = ""
			storedLink.UserUuid = ""
			if passUpdated {
				putRequest.CreatePassword = putRequest.UpdatePassword
			}
			uUser, e := share.GetOrCreateHiddenUser(ctx, ownerUser, storedLink, putRequest.PasswordEnabled, putRequest.CreatePassword, false)
			if e != nil {
				service.RestError500(req, rsp, e)
				return
			}
			user = uUser
			link.UserLogin = user.Login
			link.UserUuid = user.Uuid
			if passNewEnable {
				link.PasswordRequired = true
			} else if passNewDisable {
				link.PasswordRequired = false
			}
		}
	}

	err = share.UpdateACLsForHiddenUser(ctx, user.Uuid, workspace.UUID, link.RootNodes, link.Permissions, parentPolicy, !create)
	track("UpdateACLsForHiddenUser")
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if create {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created share link [%s]", link.Label),
			log.GetAuditId(common.AuditLinkCreate),
			zap.String(common.KeyLinkUuid, link.Uuid),
			zap.String(common.KeyWorkspaceUuid, link.Uuid),
		)
		track("Auditer")
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated share link [%s]", link.Label),
			log.GetAuditId(common.AuditLinkUpdate),
			zap.String(common.KeyLinkUuid, link.Uuid),
			zap.String(common.KeyWorkspaceUuid, link.Uuid),
		)
	}

	// Update HashDocument
	if err := share.StoreHashDocument(ctx, ownerUser, link, putRequest.UpdateCustomHash); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	track("StoreHashDocument")

	// Reload
	if output, e := share.WorkspaceToShareLinkObject(ctx, workspace, h); e != nil {
		service.RestError500(req, rsp, e)
	} else {
		rsp.WriteEntity(output)
	}
	track("WorkspaceToShareLinkObject")
}

// GetShareLink loads link information.
func (h *SharesHandler) GetShareLink(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")
	ownerUser := h.IdmUserFromClaims(ctx)

	workspace, _, err := share.GetOrCreateWorkspace(ctx, ownerUser, id, idm.WorkspaceScope_LINK, "", "", false)
	if err != nil {
		if errors.Parse(err.Error()).Code == 404 {
			service.RestError404(req, rsp, err)
		} else {
			service.RestErrorDetect(req, rsp, err)
		}
		return
	}

	if output, err := share.WorkspaceToShareLinkObject(ctx, workspace, h); err == nil {
		rsp.WriteEntity(output)
	} else {
		service.RestErrorDetect(req, rsp, err)
	}

}

// DeleteShareLink deletes a link information.
func (h *SharesHandler) DeleteShareLink(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")
	ownerUser := h.IdmUserFromClaims(ctx)

	if err := h.docStoreStatus(); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	if ws, _, e := share.GetOrCreateWorkspace(ctx, ownerUser, id, idm.WorkspaceScope_LINK, "", "", false); e != nil || ws == nil {
		service.RestError404(req, rsp, e)
		return
	} else if !h.IsContextEditable(ctx, id, ws.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this link"))
		return
	}

	// Will try to load the workspace first, and throw an error if something goes wrong
	if err := share.DeleteWorkspace(ctx, ownerUser, idm.WorkspaceScope_LINK, id, h); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	storedLink := &rest.ShareLink{Uuid: id}
	if err := share.LoadHashDocumentData(ctx, storedLink, []*idm.ACL{}); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	// Delete associated Document from Docstore
	if err := share.DeleteHashDocument(ctx, id); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	// Delete associated Hidden user
	if err := share.DeleteHiddenUser(ctx, storedLink); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Removed share link [%s]", id),
		log.GetAuditId(common.AuditLinkUpdate),
		zap.String(common.KeyLinkUuid, id),
		zap.String(common.KeyWorkspaceUuid, id),
	)

	rsp.WriteEntity(&rest.DeleteShareLinkResponse{
		Success: true,
	})

}

// UpdateSharePolicies updates policies associated to the underlying workspace
func (h *SharesHandler) UpdateSharePolicies(req *restful.Request, rsp *restful.Response) {
	var input rest.UpdateSharePoliciesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	if err := h.docStoreStatus(); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	ctx := req.Request.Context()
	cli := idm.NewWorkspaceServiceClient(registry.GetClient(common.ServiceWorkspace))
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Uuid: input.Uuid,
	})
	var ws *idm.Workspace
	if client, err := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service2.Query{SubQueries: []*any.Any{q}}}); err == nil {
		defer client.Close()
		for {
			resp, e := client.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			ws = resp.Workspace
			break
		}
	} else {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	if ws == nil {
		service.RestError500(req, rsp, errors.NotFound("share.not.found", "cannot find associated workspace"))
		return
	}
	if ws.Scope != idm.WorkspaceScope_LINK && ws.Scope != idm.WorkspaceScope_ROOM {
		service.RestError403(req, rsp, errors.NotFound("workspace.not.share", "you are not allowed to use this api to edit workspaces"))
		return
	}
	if !h.MatchPolicies(ctx, ws.UUID, ws.Policies, service2.ResourcePolicyAction_WRITE) {
		service.RestError403(req, rsp, errors.NotFound("share.not.editable", "you are not allowed to edit this share"))
		return
	}

	ws.Policies = input.Policies
	resp, e := cli.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws})
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	log.Logger(ctx).Info("Updated policies for share", zap.Any("uuid", input.Uuid))
	log.Auditer(ctx).Info("Updated policies for share", ws.ZapUuid())
	response := &rest.UpdateSharePoliciesResponse{
		Success:                 true,
		Policies:                resp.Workspace.Policies,
		PoliciesContextEditable: resp.Workspace.PoliciesContextEditable,
	}
	rsp.WriteEntity(response)
}

func (h *SharesHandler) docStoreStatus() error {
	s := service2.NewService(registry.GetClient(common.ServiceDocStore))
	_, err := s.Status(context.Background(), &empty.Empty{})
	return err
}
