/*
 * Copyright (c) 2022. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"fmt"
	"path"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/slug"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// WorkspaceToCellObject rewrites a workspace to a Cell object by reloading its ACLs.
func (sc *Client) WorkspaceToCellObject(ctx context.Context, workspace *idm.Workspace, accessList *permissions.AccessList) (*rest.Cell, error) {

	acls, detectedRoots, err := sc.CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		log.Logger(ctx).Error("Error while loading common acls for workspace", zap.Error(err))
		return nil, err
	}
	log.Logger(ctx).Debug("Detected Roots for object", log.DangerouslyZapSmallSlice("roots", detectedRoots))
	roomAcls := sc.AclsToCellAcls(ctx, acls)

	log.Logger(ctx).Debug("Computed roomAcls before load", zap.Any("roomAcls", roomAcls))
	if err := sc.LoadCellAclsObjects(ctx, roomAcls); err != nil {
		log.Logger(ctx).Error("Error on loadRomAclsObjects", zap.Error(err))
		return nil, err
	}
	rootNodes := sc.LoadDetectedRootNodes(ctx, detectedRoots, accessList)
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
		PoliciesContextEditable: sc.checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}, nil
}

// WorkspaceToShareLinkObject converts a workspace to a rest.ShareLink model.
func (sc *Client) WorkspaceToShareLinkObject(ctx context.Context, workspace *idm.Workspace) (*rest.ShareLink, error) {

	acls, detectedRoots, err := sc.CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		return nil, err
	}
	if workspace.Label == "{{RefLabel}}" && len(detectedRoots) == 1 {
		if resp, er := sc.getUuidRouter().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: detectedRoots[0]}}); er == nil && resp != nil {
			workspace.Label = path.Base(resp.GetNode().GetPath())
		}
	}

	shareLink := &rest.ShareLink{
		Uuid:                    workspace.UUID,
		Label:                   workspace.Label,
		Description:             workspace.Description,
		Policies:                workspace.Policies,
		PoliciesContextEditable: sc.checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}
	for _, rootId := range detectedRoots {
		shareLink.RootNodes = append(shareLink.RootNodes, &tree.Node{Uuid: rootId})
	}

	if err := sc.LoadHashDocumentData(ctx, shareLink, acls); err != nil {
		return nil, err
	}

	shareLink.PoliciesContextEditable = sc.checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies)

	return shareLink, nil

}

// AclsToCellAcls Rewrites a flat list of ACLs to a structured map of CellAcls (more easily usable by clients).
func (sc *Client) AclsToCellAcls(ctx context.Context, acls []*idm.ACL) map[string]*rest.CellAcl {

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
			if acl.Action.Name == permissions.AclPolicy.Name {
				r, w, e := sc.InterpretInheritedPolicy(ctx, acl.Action.Value)
				if e != nil {
					log.Logger(ctx).Error("Error while interpreting inherited policy", zap.Error(e))
				}
				if r {
					roomAcl.Actions = append(roomAcl.Actions, permissions.AclRead)
				}
				if w {
					roomAcl.Actions = append(roomAcl.Actions, permissions.AclWrite)
				}
			} else {
				roomAcl.Actions = append(roomAcl.Actions, acl.Action)
			}
			registeredRolesAcls[id] = true
		}
	}
	return roomAcls
}

// LoadCellAclsObjects loads associated users / groups / roles based on the role Ids of the acls.
func (sc *Client) LoadCellAclsObjects(ctx context.Context, roomAcls map[string]*rest.CellAcl) error {

	log.Logger(ctx).Debug("LoadCellAclsObjects", zap.Any("acls", roomAcls))
	if len(roomAcls) == 0 {
		return nil
	}
	roleClient := idm.NewRoleServiceClient(grpc.GetClientConnFromCtx(sc.RuntimeContext, common.ServiceRole))
	var roleIds []string
	for _, acl := range roomAcls {
		roleIds = append(roleIds, acl.RoleId)
	}
	roleQ, _ := anypb.New(&idm.RoleSingleQuery{Uuid: roleIds})
	streamer, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*anypb.Any{roleQ}}})
	if err != nil {
		return err
	}
	loadUsers := make(map[string]*idm.Role)
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
		var subQueries []*anypb.Any
		for roleId := range loadUsers {
			userQ, _ := anypb.New(&idm.UserSingleQuery{Uuid: roleId})
			subQueries = append(subQueries, userQ)
		}
		userClient := idm.NewUserServiceClient(grpc.GetClientConnFromCtx(sc.RuntimeContext, common.ServiceUser))
		stream, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: subQueries}})
		if err != nil {
			return err
		}
		defer stream.CloseSend()
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
				delete(object.Attributes, "preferences")
				roomAcls[object.Uuid].User = object.WithPublicData(ctx, sc.checker.IsContextEditable(ctx, object.Uuid, object.Policies))
			}
		}
	}
	log.Logger(ctx).Debug("LoadCellAclsObjects, updated acls: ", zap.Any("acls", roomAcls))
	return nil
}

// CommonAclsForWorkspace makes successive calls to ACL service to get all ACLs for a given workspace.
func (sc *Client) CommonAclsForWorkspace(ctx context.Context, workspaceId string) (result []*idm.ACL, detectedRoots []string, err error) {

	result, err = permissions.GetACLsForWorkspace(ctx, []string{workspaceId}, permissions.AclRead, permissions.AclWrite, permissions.AclPolicy)
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
func (sc *Client) DiffAcls(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []*idm.ACL, remove []*idm.ACL) {

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
func (sc *Client) DiffReadRoles(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []string, remove []string) {

	filter := func(acls []*idm.ACL) (roles map[string]bool) {
		roles = make(map[string]bool)
		for _, acl := range acls {
			if acl.Action.Name == permissions.AclRead.Name {
				roles[acl.RoleID] = true
			} else if acl.Action.Name == permissions.AclPolicy.Name {
				if r, _, _ := sc.InterpretInheritedPolicy(ctx, acl.Action.Value); r {
					roles[acl.RoleID] = true
				}
			}
		}
		return
	}
	diff := func(lefts map[string]bool, rights map[string]bool) (result []string) {
		for left := range lefts {
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

// ComputeTargetAcls create ACL objects that should be applied for this cell.
func (sc *Client) ComputeTargetAcls(ctx context.Context, ownerUser *idm.User, cell *rest.Cell, workspaceId string, readonly bool, parentPolicy string) ([]*idm.ACL, error) {

	if parentPolicy != "" {
		log.Logger(ctx).Debug("Share: Computing ACL based on parent policy " + parentPolicy)
	}
	userId := ownerUser.Uuid
	var targetAcls []*idm.ACL
	for _, node := range cell.RootNodes {
		userInAcls := false
		for _, acl := range cell.ACLs {
			var read, write bool
			for _, action := range acl.Actions {
				// Recheck just in case
				if readonly && action.Name == permissions.AclWrite.Name {
					continue
				}
				if parentPolicy != "" {
					if action.Name == permissions.AclRead.Name {
						read = true
					}
					if action.Name == permissions.AclWrite.Name {
						write = true
					}
				} else {
					targetAcls = append(targetAcls, &idm.ACL{
						NodeID:      node.Uuid,
						RoleID:      acl.RoleId,
						WorkspaceID: workspaceId,
						Action:      action,
					})
				}
			}
			if parentPolicy != "" {
				newPol, er := sc.InheritPolicies(ctx, parentPolicy, read, write)
				if er != nil {
					return nil, er
				}
				targetAcls = append(targetAcls, &idm.ACL{
					NodeID:      node.Uuid,
					RoleID:      acl.RoleId,
					WorkspaceID: workspaceId,
					Action: &idm.ACLAction{
						Name:  permissions.AclPolicy.Name,
						Value: newPol,
					},
				})
			}
			if acl.RoleId == userId {
				userInAcls = true
			}
		}
		// Make sure that the current user has at least READ permissions
		if !userInAcls {
			if parentPolicy != "" {
				minPol, er := sc.InheritPolicies(ctx, parentPolicy, true, !readonly)
				if er != nil {
					return nil, er
				}
				targetAcls = append(targetAcls, &idm.ACL{
					NodeID:      node.Uuid,
					RoleID:      userId,
					WorkspaceID: workspaceId,
					Action: &idm.ACLAction{
						Name:  permissions.AclPolicy.Name,
						Value: minPol,
					},
				})
			} else {
				targetAcls = append(targetAcls, &idm.ACL{
					NodeID:      node.Uuid,
					RoleID:      userId,
					WorkspaceID: workspaceId,
					Action:      permissions.AclRead,
				})
				if !readonly {
					targetAcls = append(targetAcls, &idm.ACL{
						NodeID:      node.Uuid,
						RoleID:      userId,
						WorkspaceID: workspaceId,
						Action:      permissions.AclWrite,
					})
				}
			}
		}
	}
	return targetAcls, nil
}

// UpdatePoliciesFromAcls recomputes the required policies from acl changes.
func (sc *Client) UpdatePoliciesFromAcls(ctx context.Context, workspace *idm.Workspace, initial []*idm.ACL, target []*idm.ACL) bool {

	var output []*service.ResourcePolicy
	initialPolicies := workspace.Policies
	resourceId := workspace.UUID

	addReads, removeReads := sc.DiffReadRoles(ctx, initial, target)
	ignoreAdds := make(map[string]bool)

	for _, p := range initialPolicies {
		toRemove := false
		for _, roleId := range removeReads {
			if p.Subject == "role:"+roleId && p.Action == service.ResourcePolicyAction_READ {
				toRemove = true
				break
			}
		}
		if p.Action == service.ResourcePolicyAction_READ && strings.HasPrefix(p.Subject, "role:") {
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
		output = append(output, &service.ResourcePolicy{
			Subject:  "role:" + roleAdd,
			Resource: resourceId,
			Action:   service.ResourcePolicyAction_READ,
			Effect:   service.ResourcePolicy_allow,
		})
	}

	workspace.Policies = output
	return true
}

// GetLinkWorkspace is a shortcut for GetOrCreateWorkspace but for retrieval only
func (sc *Client) GetLinkWorkspace(ctx context.Context, wsUuid string) (*idm.Workspace, error) {
	ws, _, er := sc.GetOrCreateWorkspace(ctx, nil, wsUuid, idm.WorkspaceScope_LINK, "", "", "", false)
	return ws, er
}

// GetCellWorkspace is a shortcut for GetOrCreateWorkspace but for retrieval only
func (sc *Client) GetCellWorkspace(ctx context.Context, wsUuid string) (*idm.Workspace, error) {
	ws, _, er := sc.GetOrCreateWorkspace(ctx, nil, wsUuid, idm.WorkspaceScope_ROOM, "", "", "", false)
	return ws, er
}

// GetOrCreateWorkspace finds a workspace by its Uuid or creates it with the current user ResourcePolicies
// if it does not already exist.
func (sc *Client) GetOrCreateWorkspace(ctx context.Context, ownerUser *idm.User, wsUuid string, scope idm.WorkspaceScope, label string, refLabel string, description string, updateIfNeeded bool) (*idm.Workspace, bool, error) {

	var workspace *idm.Workspace

	log.Logger(ctx).Debug("GetOrCreateWorkspace", zap.String("wsUuid", wsUuid), zap.Any("scope", scope.String()), zap.Bool("updateIfNeeded", updateIfNeeded))

	wsClient := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(sc.RuntimeContext, common.ServiceWorkspace))
	var create bool
	if wsUuid == "" {
		if label == "" {
			return nil, false, errors.BadRequest(common.ServiceShare, "please provide a non-empty label for this workspace")
		}
		// Create Workspace
		wsUuid = uuid.New()
		wsSlug := slug.Make(label)
		if refLabel != "" && label == refLabel {
			label = "{{RefLabel}}"
		}
		wsResp, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: &idm.Workspace{
			UUID:        wsUuid,
			Label:       label,
			Description: description,
			Scope:       scope,
			Slug:        wsSlug,
			Policies:    sc.OwnerResourcePolicies(ctx, ownerUser, wsUuid),
		}})
		if err != nil {
			return workspace, false, err
		}
		workspace = wsResp.Workspace
		create = true
	} else {
		q, _ := anypb.New(&idm.WorkspaceSingleQuery{
			Uuid:  wsUuid,
			Scope: scope,
		})
		wsStream, err := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{q},
			},
		})
		if err != nil {
			return workspace, false, err
		}
		defer wsStream.CloseSend()
		for {
			wsResp, er := wsStream.Recv()
			if er != nil {
				break
			}
			workspace = wsResp.Workspace
		}
		if workspace == nil {
			return workspace, false, errors.NotFound(common.ServiceShare, "Cannot find workspace with Uuid "+wsUuid)
		}
		if refLabel != "" && label == refLabel {
			label = "{{RefLabel}}"
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

// DeleteLinkWorkspace wraps DeleteWorkspace to remove unnecessary parameters
func (sc *Client) DeleteLinkWorkspace(ctx context.Context, workspaceId string) error {
	return sc.DeleteWorkspace(ctx, "", idm.WorkspaceScope_LINK, workspaceId)
}

// DeleteWorkspace deletes a workspace and associated policies and ACLs. It also
// deletes the room node if necessary.
func (sc *Client) DeleteWorkspace(ctx context.Context, ownerLogin string, scope idm.WorkspaceScope, workspaceId string) error {

	workspace, _, err := sc.GetOrCreateWorkspace(ctx, nil, workspaceId, scope, "", "", "", false)
	if err != nil {
		return err
	}
	if scope == idm.WorkspaceScope_ROOM {
		// check if we must delete the room node
		acl, _, er := permissions.AccessListFromUser(ctx, ownerLogin, false)
		if er != nil {
			return er
		}
		if output, err := sc.WorkspaceToCellObject(ctx, workspace, acl); err == nil {
			log.Logger(ctx).Debug("Will Delete Workspace for Room", zap.Any("room", output))
			var roomNode *tree.Node
			for _, node := range output.RootNodes {
				if node.GetMetaBool(common.MetaFlagCellNode) {
					roomNode = node
					break
				}
			}
			if roomNode != nil {
				if err := sc.DeleteRootNodeRecursively(ctx, ownerLogin, roomNode); err != nil {
					return err
				}
			}
		}
	}
	// Deleting workspace will delete associated policies and associated ACLs
	wsClient := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(sc.RuntimeContext, common.ServiceWorkspace))
	q, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Uuid: workspaceId,
	})
	_, err = wsClient.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{Query: &service.Query{
		SubQueries: []*anypb.Any{q},
	}})

	return err
}

// OwnerResourcePolicies produces a set of policies given ownership to current context user,
// read/write to current context user, and write access to profile:admin (can be useful for admin).
func (sc *Client) OwnerResourcePolicies(ctx context.Context, ownerUser *idm.User, resourceId string) []*service.ResourcePolicy {

	userId := ownerUser.Uuid
	userLogin := ownerUser.Login

	return []*service.ResourcePolicy{
		{
			Resource: resourceId,
			Subject:  userId,
			Action:   service.ResourcePolicyAction_OWNER,
			Effect:   service.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("user:%s", userLogin),
			Action:   service.ResourcePolicyAction_READ,
			Effect:   service.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("user:%s", userLogin),
			Action:   service.ResourcePolicyAction_WRITE,
			Effect:   service.ResourcePolicy_allow,
		},
		{
			Resource: resourceId,
			Subject:  fmt.Sprintf("profile:%s", common.PydioProfileAdmin),
			Action:   service.ResourcePolicyAction_WRITE,
			Effect:   service.ResourcePolicy_allow,
		},
	}

}

// GetTemplateACLsForMinisite loads actions and parameter acls from specific template roles.
func (sc *Client) GetTemplateACLsForMinisite(ctx context.Context, roleId string, perms []rest.ShareLinkAccessType, aclClient idm.ACLServiceClient) (acls []*idm.ACL, err error) {

	DownloadEnabled := false
	for _, perm := range perms {
		if perm == rest.ShareLinkAccessType_Download {
			DownloadEnabled = true
			break
		}
	}

	q, _ := anypb.New(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE"}})
	streamer, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{
		SubQueries: []*anypb.Any{q},
		Operation:  service.OperationType_OR,
	}})
	if err != nil {
		return nil, err
	}
	defer streamer.CloseSend()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		log.Logger(ctx).Debug("Received ACL ", zap.Any("acls", resp.ACL))
		if resp.ACL == nil || (!strings.HasPrefix(resp.ACL.Action.Name, "action:") && !strings.HasPrefix(resp.ACL.Action.Name, "parameter:")) {
			continue
		}
		acls = append(acls, &idm.ACL{
			RoleID:      roleId,
			Action:      resp.ACL.Action,
			WorkspaceID: permissions.FrontWsScopeShared,
		})
	}

	if !DownloadEnabled {

		q, _ := anypb.New(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE_NODOWNLOAD"}})
		streamer2, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{
			SubQueries: []*anypb.Any{q},
			Operation:  service.OperationType_OR,
		}})
		if err != nil {
			return nil, err
		}
		defer streamer2.CloseSend()
		for {
			resp, e := streamer2.Recv()
			if e != nil {
				break
			}
			log.Logger(ctx).Debug("Received ACL ", zap.Any("acls", resp.ACL))
			if resp.ACL == nil || (!strings.HasPrefix(resp.ACL.Action.Name, "action:") && !strings.HasPrefix(resp.ACL.Action.Name, "parameter:")) {
				continue
			}
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				Action:      resp.ACL.Action,
				WorkspaceID: permissions.FrontWsScopeAll,
			})
		}

	}

	return
}
