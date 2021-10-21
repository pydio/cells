package share

import (
	"context"
	"fmt"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/gosimple/slug"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

type ContextEditableChecker interface {
	IsContextEditable(ctx context.Context, resourceId string, policies []*service.ResourcePolicy) bool
}

// WorkspaceToCellObject rewrites a workspace to a Cell object by reloading its ACLs.
func WorkspaceToCellObject(ctx context.Context, workspace *idm.Workspace, checker ContextEditableChecker) (*rest.Cell, error) {

	acls, detectedRoots, err := CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		log.Logger(ctx).Error("Error while loading common acls for workspace", zap.Error(err))
		return nil, err
	}
	log.Logger(ctx).Debug("Detected Roots for object", log.DangerouslyZapSmallSlice("roots", detectedRoots))
	roomAcls := AclsToCellAcls(ctx, acls)

	log.Logger(ctx).Debug("Computed roomAcls before load", zap.Any("roomAcls", roomAcls))
	if err := LoadCellAclsObjects(ctx, roomAcls, checker); err != nil {
		log.Logger(ctx).Error("Error on loadRomAclsObjects", zap.Error(err))
		return nil, err
	}
	rootNodes := LoadDetectedRootNodes(ctx, detectedRoots)
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
		PoliciesContextEditable: checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}, nil
}

func WorkspaceToShareLinkObject(ctx context.Context, workspace *idm.Workspace, checker ContextEditableChecker) (*rest.ShareLink, error) {

	acls, detectedRoots, err := CommonAclsForWorkspace(ctx, workspace.UUID)
	if err != nil {
		return nil, err
	}

	shareLink := &rest.ShareLink{
		Uuid:                    workspace.UUID,
		Label:                   workspace.Label,
		Description:             workspace.Description,
		Policies:                workspace.Policies,
		PoliciesContextEditable: checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies),
	}
	for _, rootId := range detectedRoots {
		shareLink.RootNodes = append(shareLink.RootNodes, &tree.Node{Uuid: rootId})
	}

	if err := LoadHashDocumentData(ctx, shareLink, acls); err != nil {
		return nil, err
	}

	shareLink.PoliciesContextEditable = checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies)

	return shareLink, nil

}

// AclsToCellAcls Rewrites a flat list of ACLs to a structured map of CellAcls (more easily usable by clients).
func AclsToCellAcls(ctx context.Context, acls []*idm.ACL) map[string]*rest.CellAcl {

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
				r, w, e := InterpretInheritedPolicy(ctx, acl.Action.Value)
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
func LoadCellAclsObjects(ctx context.Context, roomAcls map[string]*rest.CellAcl, checker ContextEditableChecker) error {

	log.Logger(ctx).Debug("LoadCellAclsObjects", zap.Any("acls", roomAcls))
	roleClient := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	var roleIds []string
	for _, acl := range roomAcls {
		roleIds = append(roleIds, acl.RoleId)
	}
	roleQ, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: roleIds})
	streamer, err := roleClient.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*any.Any{roleQ}}})
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
		for roleId := range loadUsers {
			userQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: roleId})
			subQueries = append(subQueries, userQ)
		}
		userClient := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
		stream, err := userClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: subQueries}})
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
				delete(object.Attributes, "preferences")
				roomAcls[object.Uuid].User = object.WithPublicData(ctx, checker.IsContextEditable(ctx, object.Uuid, object.Policies))
			}
		}
	}
	log.Logger(ctx).Debug("LoadCellAclsObjects, updated acls: ", zap.Any("acls", roomAcls))
	return nil
}

// CommonAclsForWorkspace makes successive calls to ACL service to get all ACLs for a given workspace.
func CommonAclsForWorkspace(ctx context.Context, workspaceId string) (result []*idm.ACL, detectedRoots []string, err error) {

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
func DiffAcls(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []*idm.ACL, remove []*idm.ACL) {

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
func DiffReadRoles(ctx context.Context, initial []*idm.ACL, newOnes []*idm.ACL) (add []string, remove []string) {

	filter := func(acls []*idm.ACL) (roles map[string]bool) {
		roles = make(map[string]bool)
		for _, acl := range acls {
			if acl.Action.Name == permissions.AclRead.Name {
				roles[acl.RoleID] = true
			} else if acl.Action.Name == permissions.AclPolicy.Name {
				if r, _, _ := InterpretInheritedPolicy(ctx, acl.Action.Value); r {
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
func ComputeTargetAcls(ctx context.Context, ownerUser *idm.User, cell *rest.Cell, workspaceId string, readonly bool, parentPolicy string) ([]*idm.ACL, error) {

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
				newPol, er := InheritPolicies(ctx, parentPolicy, read, write)
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
				minPol, er := InheritPolicies(ctx, parentPolicy, true, !readonly)
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
func UpdatePoliciesFromAcls(ctx context.Context, workspace *idm.Workspace, initial []*idm.ACL, target []*idm.ACL) bool {

	var output []*service.ResourcePolicy
	initialPolicies := workspace.Policies
	resourceId := workspace.UUID

	addReads, removeReads := DiffReadRoles(ctx, initial, target)
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

// GetOrCreateWorkspace finds a workspace by its Uuid or creates it with the current user ResourcePolicies
// if it does not already exist.
func GetOrCreateWorkspace(ctx context.Context, ownerUser *idm.User, wsUuid string, scope idm.WorkspaceScope, label string, description string, updateIfNeeded bool) (*idm.Workspace, bool, error) {

	var workspace *idm.Workspace

	log.Logger(ctx).Debug("GetOrCreateWorkspace", zap.String("wsUuid", wsUuid), zap.Any("scope", scope.String()), zap.Bool("updateIfNeeded", updateIfNeeded))

	wsClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())
	var create bool
	if wsUuid == "" {
		if label == "" {
			return nil, false, errors.BadRequest(common.ServiceShare, "please provide a non-empty label for this workspace")
		}
		// Create Workspace
		wsUuid = uuid.NewUUID().String()
		wsResp, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: &idm.Workspace{
			UUID:        wsUuid,
			Label:       label,
			Description: description,
			Scope:       scope,
			Slug:        slug.Make(label),
			Policies:    OwnerResourcePolicies(ctx, ownerUser, wsUuid),
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
			Query: &service.Query{
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
			return workspace, false, errors.NotFound(common.ServiceShare, "Cannot find workspace with Uuid "+wsUuid)
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
func DeleteWorkspace(ctx context.Context, ownerUser *idm.User, scope idm.WorkspaceScope, workspaceId string, checker ContextEditableChecker) error {

	workspace, _, err := GetOrCreateWorkspace(ctx, ownerUser, workspaceId, scope, "", "", false)
	if err != nil {
		return err
	}
	if scope == idm.WorkspaceScope_ROOM {
		// check if we must delete the room node
		if output, err := WorkspaceToCellObject(ctx, workspace, checker); err == nil {
			log.Logger(ctx).Debug("Will Delete Workspace for Room", zap.Any("room", output))
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
				if err := DeleteRootNodeRecursively(ctx, ownerUser.GetLogin(), roomNode); err != nil {
					return err
				}
			}
		}
	}
	// Deleting workspace will delete associated policies and associated ACLs
	wsClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Uuid: workspaceId,
	})
	_, err = wsClient.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{Query: &service.Query{
		SubQueries: []*any.Any{q},
	}})

	return err
}

// OwnerResourcePolicies produces a set of policies given ownership to current context user,
// read/write to current context user, and write access to profile:admin (can be useful for admin).
func OwnerResourcePolicies(ctx context.Context, ownerUser *idm.User, resourceId string) []*service.ResourcePolicy {

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
func GetTemplateACLsForMinisite(ctx context.Context, roleId string, perms []rest.ShareLinkAccessType, aclClient idm.ACLServiceClient) (acls []*idm.ACL, err error) {

	DownloadEnabled := false
	for _, perm := range perms {
		if perm == rest.ShareLinkAccessType_Download {
			DownloadEnabled = true
			break
		}
	}

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE"}})
	streamer, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{
		SubQueries: []*any.Any{q},
		Operation:  service.OperationType_OR,
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

		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{"MINISITE_NODOWNLOAD"}})
		streamer2, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{
			SubQueries: []*any.Any{q},
			Operation:  service.OperationType_OR,
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
