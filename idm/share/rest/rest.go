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

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/gosimple/slug"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
)

// SharesHandler implements handler methods for the share REST service.
type SharesHandler struct {
	resources.ResourceProviderHandler
}

// NewSharesHandler simply creates a new SharesHandler.
func NewSharesHandler() *SharesHandler {
	h := new(SharesHandler)
	h.ServiceName = common.SERVICE_WORKSPACE
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

	if err := h.ParseRootNodes(ctx, &shareRequest); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	workspace, wsCreated, err := h.GetOrCreateWorkspace(ctx, shareRequest.Room.Uuid, idm.WorkspaceScope_ROOM, shareRequest.Room.Label, shareRequest.Room.Description, false)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if !wsCreated && !h.IsContextEditable(ctx, workspace.UUID, workspace.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this cell"))
		return
	}

	// Now set ACLs on Workspace
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userId, _ := claims.DecodeUserUuid()
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	var currentAcls []*idm.ACL
	var currentRoots []string
	if !wsCreated {
		var err error
		currentAcls, currentRoots, err = h.CommonAclsForWorkspace(ctx, workspace.UUID)
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
					Action:      &idm.ACLAction{Name: "workspace-path", Value: "uuid:" + node.Uuid},
				},
			})
		}
	}
	log.Logger(ctx).Debug("Current Roots", zap.Any("crt", currentRoots))
	var targetAcls []*idm.ACL
	for _, node := range shareRequest.Room.RootNodes {
		userInAcls := false
		for _, acl := range shareRequest.Room.ACLs {
			for _, action := range acl.Actions {
				targetAcls = append(targetAcls, &idm.ACL{
					NodeID:      node.Uuid,
					RoleID:      acl.RoleId,
					WorkspaceID: workspace.UUID,
					Action:      action,
				})
			}
			if acl.RoleId == userId {
				userInAcls = true
			}
		}
		// Make sure that the current user has at least READ permissions
		if !userInAcls {
			targetAcls = append(targetAcls, &idm.ACL{
				NodeID:      node.Uuid,
				RoleID:      userId,
				WorkspaceID: workspace.UUID,
				Action:      utils.ACL_READ,
			})
			targetAcls = append(targetAcls, &idm.ACL{
				NodeID:      node.Uuid,
				RoleID:      userId,
				WorkspaceID: workspace.UUID,
				Action:      utils.ACL_WRITE,
			})
		}
	}

	log.Logger(ctx).Debug("Share ACLS", zap.Any("current", currentAcls), zap.Any("target", targetAcls))
	add, remove := h.DiffAcls(ctx, currentAcls, targetAcls)
	log.Logger(ctx).Info("Diff ACLS", zap.Any("add", add), zap.Any("remove", remove))

	for _, acl := range add {
		_, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while creating ACLs", zap.Error(err))
		}
	}
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

	log.Logger(ctx).Debug("Share Policies", zap.Any("before", workspace.Policies))
	h.UpdatePoliciesFromAcls(ctx, workspace, currentAcls, targetAcls)

	// Now update workspace
	log.Logger(ctx).Info("Updating workspace", zap.Any("workspace", workspace))
	wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace}); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	// Put an Audit log if this cell has been newly created
	if wsCreated {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Cell %s has been created", shareRequest.Room.Label),
			log.GetAuditId(common.AUDIT_CELL_CREATE),
			zap.String(common.KEY_CELL_UUID, shareRequest.Room.Uuid),
		)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Cell %s has been updated", shareRequest.Room.Label),
			log.GetAuditId(common.AUDIT_CELL_UPDATE),
			zap.String(common.KEY_CELL_UUID, shareRequest.Room.Uuid),
		)
	}

	if output, err := h.WorkspaceToCellObject(ctx, workspace); err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(output)
	}
}

// GetCell simply retrieves a shared room from its UUID.
func (h *SharesHandler) GetCell(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	workspace, _, err := h.GetOrCreateWorkspace(ctx, id, idm.WorkspaceScope_ROOM, "", "", false)
	if err != nil {
		if errors.Parse(err.Error()).Code == 404 {
			service.RestError404(req, rsp, err)
		} else {
			service.RestError500(req, rsp, err)
		}
		return
	}

	if output, err := h.WorkspaceToCellObject(ctx, workspace); err != nil {
		service.RestError500(req, rsp, err)
	} else {
		rsp.WriteEntity(output)
	}

}

// DeleteCell loads the workspace and its root nodes and eventually removes room root totally.
func (h *SharesHandler) DeleteCell(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	ws, _, e := h.GetOrCreateWorkspace(ctx, id, idm.WorkspaceScope_ROOM, "", "", false)
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
	if err := h.DeleteWorkspace(ctx, idm.WorkspaceScope_ROOM, id); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	// Put an Audit log if this cell has been removed without error
	log.Auditer(ctx).Info(
		fmt.Sprintf("Cell %s has been removed", currWsLabel),
		log.GetAuditId(common.AUDIT_CELL_DELETE),
		zap.String(common.KEY_CELL_UUID, id),
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
		log.Logger(ctx).Info(msg, zap.Duration("t", time.Since(start)))
	}
	var putRequest rest.PutShareLinkRequest
	if err := req.ReadEntity(&putRequest); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	link := putRequest.ShareLink
	var workspace *idm.Workspace
	var user *idm.User
	var err error
	var create bool
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	if link.Uuid == "" {
		create = true
		workspace, _, err = h.GetOrCreateWorkspace(ctx, "", idm.WorkspaceScope_LINK, link.Label, link.Description, false)
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
		link.LinkHash = strings.Replace(uuid.NewUUID().String(), "-", "", -1)[0:12]
	} else {
		workspace, create, err = h.GetOrCreateWorkspace(ctx, link.Uuid, idm.WorkspaceScope_LINK, link.Label, link.Description, true)
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
	user, err = h.GetOrCreateHiddenUser(ctx, link, putRequest.PasswordEnabled, putRequest.CreatePassword)
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
		wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
		wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace})
		track("CreateWorkspace")
	} else {
		// Manage password if status was updated
		storedLink := &rest.ShareLink{Uuid: link.Uuid}
		LoadHashDocumentData(ctx, storedLink, []*idm.ACL{})

		link.PasswordRequired = storedLink.PasswordRequired
		var saveUser bool
		if putRequest.PasswordEnabled && !storedLink.PasswordRequired {
			user.Password = putRequest.CreatePassword
			link.PasswordRequired = true
			saveUser = true
		} else if !putRequest.PasswordEnabled && storedLink.PasswordRequired {
			user.Password = user.Login + PasswordComplexitySuffix
			link.PasswordRequired = false
			saveUser = true
		} else if putRequest.PasswordEnabled && storedLink.PasswordRequired && putRequest.UpdatePassword != "" {
			user.Password = putRequest.UpdatePassword
			saveUser = true
		}
		if saveUser {
			uCli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
			_, err := uCli.CreateUser(ctx, &idm.CreateUserRequest{
				User: user,
			})
			if err != nil {
				service.RestError500(req, rsp, err)
			}
		}
	}

	err = h.UpdateACLsForHiddenUser(ctx, user.Uuid, workspace.UUID, link.RootNodes, link.Permissions, !create)
	track("UpdateACLsForHiddenUser")
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if create {
		log.Auditer(ctx).Info(
			fmt.Sprintf("ShareLink %s has been created", link.Label),
			log.GetAuditId(common.AUDIT_LINK_CREATE),
			zap.String(common.KEY_LINK_UUID, link.Uuid),
		)
		track("Auditer")
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("ShareLink %s has been updated", link.Label),
			log.GetAuditId(common.AUDIT_LINK_UPDATE),
			zap.String(common.KEY_LINK_UUID, link.Uuid),
		)
	}

	// Update HashDocument
	if err := StoreHashDocument(ctx, link, putRequest.UpdateCustomHash); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	track("StoreHashDocument")

	// Reload
	if output, e := h.WorkspaceToShareLinkObject(ctx, workspace); e != nil {
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
	workspace, _, err := h.GetOrCreateWorkspace(ctx, id, idm.WorkspaceScope_LINK, "", "", false)
	if err != nil {
		if errors.Parse(err.Error()).Code == 404 {
			service.RestError404(req, rsp, err)
		} else {
			service.RestError500(req, rsp, err)
		}
		return
	}

	if output, err := h.WorkspaceToShareLinkObject(ctx, workspace); err == nil {
		rsp.WriteEntity(output)
	} else {
		service.RestError500(req, rsp, err)
	}

}

// DeleteShareLink deletes a link information.
func (h *SharesHandler) DeleteShareLink(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	id := req.PathParameter("Uuid")

	if ws, _, e := h.GetOrCreateWorkspace(ctx, id, idm.WorkspaceScope_LINK, "", "", false); e != nil || ws == nil {
		service.RestError404(req, rsp, e)
		return
	} else if !h.IsContextEditable(ctx, id, ws.Policies) {
		service.RestError403(req, rsp, fmt.Errorf("you are not allowed to edit this link"))
		return
	}

	// Will try to load the workspace first, and throw an error if something goes wrong
	if err := h.DeleteWorkspace(ctx, idm.WorkspaceScope_LINK, id); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	// Now delete associated Document in Docstore
	if err := DeleteHashDocument(ctx, id); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("ShareLink %s has been removed", id),
		log.GetAuditId(common.AUDIT_LINK_UPDATE),
		zap.String(common.KEY_LINK_UUID, id),
	)

	rsp.WriteEntity(&rest.DeleteShareLinkResponse{
		Success: true,
	})

}

// *********************************************************************************

// WorkspaceToCellObject rewrites a workspace to a Cell object by reloading its ACLs.
func (h *SharesHandler) WorkspaceToCellObject(ctx context.Context, workspace *idm.Workspace) (*rest.Cell, error) {

	acls, detectedRoots, err := h.CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		log.Logger(ctx).Error("Error while loading common acls for workspace", zap.Error(err))
		return nil, err
	}
	log.Logger(ctx).Debug("Detected Roots for object", zap.Any("roots", detectedRoots))
	roomAcls := h.AclsToCellAcls(ctx, acls)

	log.Logger(ctx).Debug("Computed roomAcls before load", zap.Any("roomAcls", roomAcls))
	if err := h.LoadCellAclsObjects(ctx, roomAcls); err != nil {
		log.Logger(ctx).Error("Error on loadRomAclsObjects", zap.Error(err))
		return nil, err
	}
	rootNodes := h.LoadDetectedRootNodes(ctx, detectedRoots)
	var nodesSlices []*tree.Node
	for _, node := range rootNodes {
		nodesSlices = append(nodesSlices, node)
	}

	return &rest.Cell{
		Uuid:                    workspace.UUID,
		Label:                   workspace.Label,
		Description:             workspace.Description,
		RootNodes:               nodesSlices,
		ACLs:                    roomAcls,
		Policies:                workspace.Policies,
		PoliciesContextEditable: h.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}, nil
}

func (h *SharesHandler) WorkspaceToShareLinkObject(ctx context.Context, workspace *idm.Workspace) (*rest.ShareLink, error) {

	acls, detectedRoots, err := h.CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		return nil, err
	}

	shareLink := &rest.ShareLink{
		Uuid:                    workspace.UUID,
		Label:                   workspace.Label,
		Description:             workspace.Description,
		Policies:                workspace.Policies,
		PoliciesContextEditable: h.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}
	for _, rootId := range detectedRoots {
		shareLink.RootNodes = append(shareLink.RootNodes, &tree.Node{Uuid: rootId})
	}

	if err := LoadHashDocumentData(ctx, shareLink, acls); err != nil {
		return nil, err
	}

	shareLink.PoliciesContextEditable = h.IsContextEditable(ctx, workspace.UUID, workspace.Policies)

	return shareLink, nil

}

// LoadDetectedRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func (h *SharesHandler) LoadDetectedRootNodes(ctx context.Context, detectedRoots []string) (rootNodes map[string]*tree.Node) {

	rootNodes = make(map[string]*tree.Node)
	router := views.NewUuidRouter(views.RouterOptions{})
	metaClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
	eventFilter := views.NewRouterEventFilter(views.RouterOptions{AdminView: false})
	accessList, _ := utils.AccessListFromContextClaims(ctx)
	for _, rootId := range detectedRoots {
		request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}}
		if resp, err := router.ReadNode(ctx, request); err == nil {
			node := resp.Node
			var multipleMeta []*tree.WorkspaceRelativePath
			for _, ws := range accessList.Workspaces {
				if filtered, ok := eventFilter.WorkspaceCanSeeNode(ctx, ws, resp.Node, false); ok {
					multipleMeta = append(multipleMeta, &tree.WorkspaceRelativePath{
						WsLabel: ws.Label,
						WsUuid:  ws.UUID,
						Path:    filtered.Path,
					})
					node = filtered
				}
			}
			if len(multipleMeta) > 0 {
				node.AppearsIn = multipleMeta
			}
			if metaResp, e := metaClient.ReadNode(ctx, request); e == nil {
				var isRoomNode bool
				if metaResp.GetNode().GetMeta("CellNode", &isRoomNode); err == nil && isRoomNode {
					node.SetMeta("CellNode", true)
				}
			}
			rootNodes[node.GetUuid()] = node.WithoutReservedMetas()
		} else {
			log.Logger(ctx).Debug("Share Load - Ignoring Root Node, probably not synced yet", zap.String("nodeId", rootId), zap.Error(err))
		}
	}
	return

}

// AclsToCellAcls Rewrites a flat list of ACLs to a structured map of CellAcls (more easily usable by clients).
func (h *SharesHandler) AclsToCellAcls(ctx context.Context, acls []*idm.ACL) map[string]*rest.CellAcl {

	roomAcls := make(map[string]*rest.CellAcl)
	registeredRolesAcls := make(map[string]bool)
	for _, acl := range acls {
		id := acl.RoleID + "-" + acl.Action.Name
		if _, has := registeredRolesAcls[id]; !has {
			var roomAcl *rest.CellAcl
			if roomAcl, has = roomAcls[acl.RoleID]; !has {
				roomAcl = &rest.CellAcl{RoleId: acl.RoleID, Actions: []*idm.ACLAction{}}
				roomAcls[acl.RoleID] = roomAcl
			}
			roomAcl.Actions = append(roomAcl.Actions, acl.Action)
			registeredRolesAcls[id] = true
		}
	}
	return roomAcls
}

// LoadCellAclsObjects loads associated users / groups / roles based on the role Ids of the acls.
func (h *SharesHandler) LoadCellAclsObjects(ctx context.Context, roomAcls map[string]*rest.CellAcl) error {

	log.Logger(ctx).Debug("LoadCellAclsObjects", zap.Any("acls", roomAcls))
	roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	var roleIds []string
	for _, acl := range roomAcls {
		roleIds = append(roleIds, acl.RoleId)
	}
	roleQ, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: roleIds})
	streamer, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service2.Query{SubQueries: []*any.Any{roleQ}}})
	if err != nil {
		return err
	}
	loadUsers := make(map[string]*idm.Role)
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		role := resp.Role
		if role.UserRole || role.GroupRole {
			loadUsers[role.Uuid] = role
		} else {
			roomAcls[role.Uuid].Role = role
		}
	}
	log.Logger(ctx).Debug("LoadCellAclsObjects, will search for users ?", zap.Any("acls", roomAcls), zap.Any("users", loadUsers))
	if len(loadUsers) > 0 {
		var subQueries []*any.Any
		for roleId, _ := range loadUsers {
			userQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: roleId})
			subQueries = append(subQueries, userQ)
		}
		userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		stream, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service2.Query{SubQueries: subQueries}})
		if err != nil {
			return err
		}
		defer stream.Close()
		for {
			resp, e := stream.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			object := resp.User
			if object.IsGroup {
				roomAcls[object.Uuid].Group = object
			} else {
				// Remove some unnecessary fields
				object.Roles = []*idm.Role{}
				if _, has := object.Attributes["preferences"]; has {
					delete(object.Attributes, "preferences")
				}
				roomAcls[object.Uuid].User = object
			}
		}
	}
	log.Logger(ctx).Debug("LoadCellAclsObjects, updated acls: ", zap.Any("acls", roomAcls))
	return nil
}

// CommonAclsForWorkspace makes successive calls to ACL service to get all ACLs for a given workspace.
func (h *SharesHandler) CommonAclsForWorkspace(ctx context.Context, workspaceId string) (result []*idm.ACL, detectedRoots []string, err error) {

	result, err = utils.GetACLsForWorkspace(ctx, []string{workspaceId}, utils.ACL_READ, utils.ACL_WRITE, utils.ACL_POLICY)
	if err != nil {
		return
	}

	roots := make(map[string]string)
	for _, acl := range result {
		if acl.NodeID == "" {
			continue
		}
		if _, has := roots[acl.NodeID]; !has {
			roots[acl.NodeID] = acl.NodeID
			detectedRoots = append(detectedRoots, acl.NodeID)
		}
	}
	return
}

// DiffAcls compares to slices of ACLs on their RoleID and Action and
// returns slices of Acls to add and to remove.
func (h *SharesHandler) DiffAcls(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []*idm.ACL, remove []*idm.ACL) {

	equals := func(a *idm.ACL, b *idm.ACL) bool {
		return a.NodeID == b.NodeID && a.RoleID == b.RoleID && a.Action.Name == b.Action.Name && a.Action.Value == b.Action.Value
	}
	diff := func(lefts []*idm.ACL, rights []*idm.ACL) (result []*idm.ACL) {
		for _, left := range lefts {
			has := false
			for _, right := range rights {
				if equals(left, right) {
					has = true
					break
				}
			}
			if !has {
				result = append(result, left)
			}
		}
		return
	}

	remove = diff(initial, newOnes)
	add = diff(newOnes, initial)

	return
}

// DiffReadRoles detects the roles that have been globally added or removed, whatever the node.
func (h *SharesHandler) DiffReadRoles(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []string, remove []string) {

	filter := func(acls []*idm.ACL) (roles map[string]bool) {
		roles = make(map[string]bool)
		for _, acl := range acls {
			if acl.Action.Name == utils.ACL_READ.Name {
				roles[acl.RoleID] = true
			}
		}
		return
	}
	diff := func(lefts map[string]bool, rights map[string]bool) (result []string) {
		for left, _ := range lefts {
			if _, has := rights[left]; !has {
				result = append(result, left)
			}
		}
		return
	}
	initialRoles := filter(initial)
	newRoles := filter(newOnes)

	remove = diff(initialRoles, newRoles)
	add = diff(newRoles, initialRoles)

	return
}

// UpdatePoliciesFromAcls recomputes the required policies from acl changes.
func (h *SharesHandler) UpdatePoliciesFromAcls(ctx context.Context, workspace *idm.Workspace, initial []*idm.ACL, target []*idm.ACL) bool {

	var output []*service2.ResourcePolicy
	initialPolicies := workspace.Policies
	resourceId := workspace.UUID

	addReads, removeReads := h.DiffReadRoles(ctx, initial, target)
	ignoreAdds := make(map[string]bool)

	for _, p := range initialPolicies {
		toRemove := false
		for _, roleId := range removeReads {
			if p.Subject == "role:"+roleId && p.Action == service2.ResourcePolicyAction_READ {
				toRemove = true
				break
			}
		}
		if p.Action == service2.ResourcePolicyAction_READ && strings.HasPrefix(p.Subject, "role:") {
			ignoreAdds[strings.TrimPrefix(p.Subject, "role:")] = true
		}
		if !toRemove {
			output = append(output, p)
		}
	}

	for _, roleAdd := range addReads {
		if _, has := ignoreAdds[roleAdd]; has { // Already in the list
			continue
		}
		output = append(output, &service2.ResourcePolicy{
			Subject:  "role:" + roleAdd,
			Resource: resourceId,
			Action:   service2.ResourcePolicyAction_READ,
			Effect:   service2.ResourcePolicy_allow,
		})
	}

	workspace.Policies = output
	return true
}

// ParseRootNodes reads the request property to either create a new node using the "rooms" Virtual node,
// or just verify that the root nodes are not empty.
func (h *SharesHandler) ParseRootNodes(ctx context.Context, shareRequest *rest.PutCellRequest) error {

	if shareRequest.CreateEmptyRoot {

		manager := views.GetVirtualNodesManager()
		router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false, AdminView: true})
		if root, exists := manager.ByUuid("cells"); exists {
			parentNode, err := manager.ResolveInContext(ctx, root, router.GetClientsPool(), true)
			if err != nil {
				return err
			}
			index := 0
			labelSlug := slug.Make(shareRequest.Room.Label)
			baseSlug := labelSlug
			for {
				if existingResp, err := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug}}); err == nil && existingResp.Node != nil {
					index++
					labelSlug = fmt.Sprintf("%s-%v", baseSlug, index)
				} else {
					break
				}
			}
			createResp, err := router.CreateNode(ctx, &tree.CreateNodeRequest{
				Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug},
			})
			if err != nil {
				log.Logger(ctx).Error("share/cells : create empty root", zap.Error(err))
				return err
			}
			// Update node meta
			createResp.Node.SetMeta("CellNode", true)
			metaClient := tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
			metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: createResp.Node})
			shareRequest.Room.RootNodes = append(shareRequest.Room.RootNodes, createResp.Node)
		} else {
			return errors.BadRequest(common.SERVICE_SHARE, "Wrong configuration, missing rooms virtual node")
		}
	}
	if len(shareRequest.Room.RootNodes) == 0 {
		return errors.BadRequest(common.SERVICE_SHARE, "Wrong configuration, missing RootNodes in CellRequest")
	}
	return nil

}

// DeleteRootNodeRecursively loads all children of a root node and delete them, including the
// .pydio hidden files when they are folders.
func (h *SharesHandler) DeleteRootNodeRecursively(ctx context.Context, roomNode *tree.Node) error {

	manager := views.GetVirtualNodesManager()
	router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false, AdminView: true})
	if root, exists := manager.ByUuid("cells"); exists {
		parentNode, err := manager.ResolveInContext(ctx, root, router.GetClientsPool(), true)
		if err != nil {
			return err
		}
		realNode := &tree.Node{Path: parentNode.Path + "/" + strings.TrimRight(roomNode.Path, "/")}
		// Now list all children and delete them all
		stream, err := router.ListNodes(ctx, &tree.ListNodesRequest{Node: realNode, Recursive: true})
		if err != nil {
			return err
		}
		defer stream.Close()
		for {
			resp, e := stream.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			if !resp.Node.IsLeaf() {
				resp.Node.Path += "/" + common.PYDIO_SYNC_HIDDEN_FILE_META
			}
			log.Logger(ctx).Debug("Deleting room node associated to workspace", realNode.Zap())
			if _, err := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node}); err != nil {
				log.Logger(ctx).Error("Error while deleting Room Node children", zap.Error(err))
				//return err // Continue anyway?
			}
		}

		if _, err := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{Path: realNode.Path + "/" + common.PYDIO_SYNC_HIDDEN_FILE_META}}); err != nil {
			return err
		}
	}
	return nil
}

// GetOrCreateWorkspace finds a workspace by its Uuid or creates it with the current user ResourcePolicies
// if it does not already exist.
func (h *SharesHandler) GetOrCreateWorkspace(ctx context.Context, wsUuid string, scope idm.WorkspaceScope, label string, description string, updateIfNeeded bool) (*idm.Workspace, bool, error) {

	var workspace *idm.Workspace

	log.Logger(ctx).Debug("GetOrCreateWorkspace", zap.String("wsUuid", wsUuid), zap.Any("scope", scope.String()), zap.Bool("updateIfNeeded", updateIfNeeded))

	wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	var create bool
	if wsUuid == "" {
		if label == "" {
			return nil, false, errors.BadRequest(common.SERVICE_SHARE, "please provide a non-empty label for this workspace")
		}
		// Create Workspace
		wsUuid = uuid.NewUUID().String()
		wsResp, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: &idm.Workspace{
			UUID:        wsUuid,
			Label:       label,
			Description: description,
			Scope:       scope,
			Slug:        slug.Make(label),
			Policies:    h.OwnerResourcePolicies(ctx, wsUuid),
		}})
		if err != nil {
			return workspace, false, err
		}
		workspace = wsResp.Workspace
		create = true
	} else {
		q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid:  wsUuid,
			Scope: scope,
		})
		wsStream, err := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
			Query: &service2.Query{
				SubQueries: []*any.Any{q},
			},
		})
		if err != nil {
			return workspace, false, err
		}
		defer wsStream.Close()
		for {
			wsResp, er := wsStream.Recv()
			if er != nil {
				break
			}
			workspace = wsResp.Workspace
		}
		if workspace == nil {
			return workspace, false, errors.NotFound(common.SERVICE_SHARE, "Cannot find workspace with Uuid "+wsUuid)
		}
		if (label != "" && workspace.Label != label) || (description != "" && workspace.Description != description) {
			workspace.Label = label
			workspace.Description = description
			// If not updateIfNeeded, workspace will already be updated outside the scope of this function
			if updateIfNeeded {
				_, e := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace})
				if e != nil {
					return workspace, false, e
				}
			}
		}
	}

	log.Logger(ctx).Debug("GetOrCreateWorkspace::Return", zap.Any("ws", workspace), zap.Bool("create", create))

	return workspace, create, nil
}

// DeleteWorkspace deletes a workspace and associated policies and ACLs. It also
// deletes the room node if necessary.
func (h *SharesHandler) DeleteWorkspace(ctx context.Context, scope idm.WorkspaceScope, workspaceId string) error {

	workspace, _, err := h.GetOrCreateWorkspace(ctx, workspaceId, scope, "", "", false)
	if err != nil {
		return err
	}
	if scope == idm.WorkspaceScope_ROOM {
		// check if we must delete the room node
		if output, err := h.WorkspaceToCellObject(ctx, workspace); err == nil {
			log.Logger(ctx).Info("Will Delete Workspace for Room", zap.Any("room", output))
			var roomNode *tree.Node
			for _, node := range output.RootNodes {
				var testVal bool
				node.GetMeta("CellNode", &testVal)
				if testVal {
					roomNode = node
					break
				}
			}
			if roomNode != nil {
				if err := h.DeleteRootNodeRecursively(ctx, roomNode); err != nil {
					return err
				}
			}
		}
	}
	// Deleting workspace will delete associated policies and associated ACLs
	wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Uuid: workspaceId,
	})
	_, err = wsClient.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{Query: &service2.Query{
		SubQueries: []*any.Any{q},
	}})

	return err
}

// OwnerResourcePolicies produces a set of policies given ownership to current context user,
// read/write to current context user, and write access to profile:admin (can be useful for admin).
func (h *SharesHandler) OwnerResourcePolicies(ctx context.Context, resourceId string) []*service2.ResourcePolicy {

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userId, _ := claims.DecodeUserUuid()
	userLogin := claims.Name

	return []*service2.ResourcePolicy{
		{
			Resource: resourceId,
			Subject:  userId,
			Action:   service2.ResourcePolicyAction_OWNER,
			Effect:   service2.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("user:%s", userLogin),
			Action:   service2.ResourcePolicyAction_READ,
			Effect:   service2.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("user:%s", userLogin),
			Action:   service2.ResourcePolicyAction_WRITE,
			Effect:   service2.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("profile:%s", common.PYDIO_PROFILE_ADMIN),
			Action:   service2.ResourcePolicyAction_WRITE,
			Effect:   service2.ResourcePolicy_allow,
		},
	}

}

// GetOrCreateHiddenUser will load or create a user to create a ShareLink with.
func (h *SharesHandler) GetOrCreateHiddenUser(ctx context.Context, link *rest.ShareLink, passwordEnabled bool, updatePassword string) (user *idm.User, err error) {

	// Create or Load corresponding Hidden User
	uClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	if link.UserLogin == "" {
		claims := ctx.Value(claim.ContextKey).(claim.Claims)
		newUuid := strings.Replace(uuid.NewUUID().String(), "-", "", -1)
		login := newUuid[0:16]
		password := login + PasswordComplexitySuffix
		if passwordEnabled {
			if len(updatePassword) == 0 {
				return nil, errors.BadRequest(common.SERVICE_SHARE, "Please provide a non empty password!")
			}
			password = updatePassword
		}
		if len(link.Policies) == 0 {
			// Apply default policies and make sure user can read himself
			link.Policies = h.OwnerResourcePolicies(ctx, newUuid)
			link.Policies = append(link.Policies, &service2.ResourcePolicy{
				Resource: newUuid,
				Subject:  fmt.Sprintf("user:%s", login),
				Action:   service2.ResourcePolicyAction_READ,
				Effect:   service2.ResourcePolicy_allow,
			})
		}
		resp, e := uClient.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{
			Uuid:      newUuid,
			Login:     login,
			Password:  password,
			GroupPath: claims.GroupPath,
			Policies:  link.Policies,
			Attributes: map[string]string{
				"profile": "shared",
				"hidden":  "true",
			},
		}})
		if e != nil {
			return nil, e
		}
		user = resp.User
		// Create associated role
		_, e = roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
			Uuid:     user.Uuid,
			Label:    user.Login,
			UserRole: true,
			Policies: link.Policies,
		}})
		if e != nil {
			return nil, e
		}

	} else {

		uQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: link.UserLogin})
		stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service2.Query{SubQueries: []*any.Any{uQ}}})
		if e != nil {
			return nil, e
		}
		defer stream.Close()
		for {
			rsp, e := stream.Recv()
			if e != nil {
				break
			}
			user = rsp.User
			break
		}

	}

	return
}

// UpdateACLsForHiddenUser deletes and replaces access ACLs for a hidden user.
func (h *SharesHandler) UpdateACLsForHiddenUser(ctx context.Context, roleId string, workspaceId string, rootNodes []*tree.Node, permissions []rest.ShareLinkAccessType, update bool) error {

	HasRead := false
	HasWrite := false
	for _, perm := range permissions {
		if perm == rest.ShareLinkAccessType_Download || perm == rest.ShareLinkAccessType_Preview {
			HasRead = true
		}
		if perm == rest.ShareLinkAccessType_Upload {
			HasWrite = true
		}
	}

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	if update {
		// Delete all existing acls for existing user
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{roleId}})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service2.Query{SubQueries: []*any.Any{q}}})
		if e != nil {
			return e
		}
	}

	if !HasRead && !HasWrite {
		return nil
	}

	acls, err := h.GetTemplateACLsForMinisite(ctx, roleId, permissions, aclClient)
	if err != nil {
		return err
	}
	for _, rootNode := range rootNodes {
		if HasRead {
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				WorkspaceID: workspaceId,
				NodeID:      rootNode.Uuid,
				Action:      utils.ACL_READ,
			})
		}

		if HasWrite {
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				WorkspaceID: workspaceId,
				NodeID:      rootNode.Uuid,
				Action:      utils.ACL_WRITE,
			})
		}
	}
	// Add default Repository Id for the role
	acls = append(acls, &idm.ACL{
		RoleID:      roleId,
		WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
		Action: &idm.ACLAction{
			Name:  "parameter:core.conf:DEFAULT_START_REPOSITORY",
			Value: workspaceId,
		},
	})

	for _, acl := range acls {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if e != nil {
			return e
		}
	}

	return nil
}

// GetTemplateACLsForMinisite loads actions and parameter acls from specific template roles.
func (h *SharesHandler) GetTemplateACLsForMinisite(ctx context.Context, roleId string, permissions []rest.ShareLinkAccessType, aclClient idm.ACLServiceClient) (acls []*idm.ACL, err error) {

	DownloadEnabled := false
	for _, perm := range permissions {
		if perm == rest.ShareLinkAccessType_Download {
			DownloadEnabled = true
			break
		}
	}

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE"}})
	streamer, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service2.Query{
		SubQueries: []*any.Any{q},
		Operation:  service2.OperationType_OR,
	}})
	if err != nil {
		return nil, err
	}
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		log.Logger(ctx).Info("Received ACL ", zap.Any("acls", resp.ACL))
		if resp.ACL == nil || (!strings.HasPrefix(resp.ACL.Action.Name, "action:") && !strings.HasPrefix(resp.ACL.Action.Name, "parameter:")) {
			continue
		}
		acls = append(acls, &idm.ACL{
			RoleID:      roleId,
			Action:      resp.ACL.Action,
			WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
		})
	}

	if !DownloadEnabled {

		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE_NODOWNLOAD"}})
		streamer2, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service2.Query{
			SubQueries: []*any.Any{q},
			Operation:  service2.OperationType_OR,
		}})
		if err != nil {
			return nil, err
		}
		defer streamer2.Close()
		for {
			resp, e := streamer2.Recv()
			if e != nil {
				break
			}
			log.Logger(ctx).Info("Received ACL ", zap.Any("acls", resp.ACL))
			if resp.ACL == nil || (!strings.HasPrefix(resp.ACL.Action.Name, "action:") && !strings.HasPrefix(resp.ACL.Action.Name, "parameter:")) {
				continue
			}
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				Action:      resp.ACL.Action,
				WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
			})
		}

	}

	return
}
