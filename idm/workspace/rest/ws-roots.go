package rest

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

// LoadRootNodesForWorkspace loads all root nodes for this workspace
func (h *WorkspaceHandler) loadRootNodesForWorkspace(ctx context.Context, ws *idm.Workspace) error {

	acls, err := permissions.GetACLsForWorkspace(ctx, []string{ws.UUID}, &idm.ACLAction{Name: permissions.AclWsrootActionName})
	if err != nil {
		return err
	}
	ws.RootNodes = make(map[string]*tree.Node)
	if len(acls) == 0 {
		return nil
	}
	treeClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
	for _, a := range acls {
		r, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: a.NodeID}})
		if e == nil && r != nil {
			ws.RootNodes[a.NodeID] = r.Node.WithoutReservedMetas()
		} else {
			// May be a virtual node
			if node, ok := views.GetVirtualNodesManager().ByUuid(a.NodeID); ok {
				ws.RootNodes[a.NodeID] = node
			}
		}
	}

	return nil

}

func (h *WorkspaceHandler) storeRootNodesAsACLs(ctx context.Context, ws *idm.Workspace, update bool) error {

	reassign := make(map[string][]*idm.ACLAction)
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())

	if update {
		// Delete current Root Nodes ACLs
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{ws.UUID},
			Actions:      []*idm.ACLAction{{Name: permissions.AclWsrootActionName}, {Name: permissions.AclRecycleRoot.Name}},
		})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
		if e != nil {
			return e
		}
		// Search ACLs to reassign, then delete them
		q2, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{ws.UUID},
		})
		q3, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs: []string{"-1"},
			Not:     true,
		})
		q4, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			RoleIDs: []string{"-1"},
			Not:     true,
		})
		query := &service.Query{SubQueries: []*any.Any{q2, q3, q4}, Operation: service.OperationType_AND}
		sClient, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: query})
		if e != nil {
			return e
		}
		defer sClient.Close()
		for {
			r, e := sClient.Recv()
			if e != nil {
				break
			}
			reassign[r.ACL.RoleID] = append(reassign[r.ACL.RoleID], r.ACL.Action)
		}
		_, e = aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
		if e != nil {
			return e
		}
	}

	if ws.RootNodes == nil {
		ws.RootNodes = map[string]*tree.Node{}
	}
	// Now store new roots as ACLs
	for nodeId, node := range ws.RootNodes {
		// Roots
		if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			WorkspaceID: ws.UUID,
			NodeID:      nodeId,
			Action:      &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: node.GetPath()},
		}}); e != nil {
			return e
		}
		// Recycle Roots
		if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			WorkspaceID: ws.UUID,
			NodeID:      nodeId,
			Action:      permissions.AclRecycleRoot,
		}}); e != nil {
			return e
		}
		// Reassign if necessary
		if update && len(reassign) > 0 {
			for roleId, actions := range reassign {
				for _, action := range actions {
					acl := &idm.ACL{
						WorkspaceID: ws.UUID,
						RoleID:      roleId,
						NodeID:      nodeId,
						Action:      action,
					}
					if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); e != nil {
						return e
					}
				}
			}
		}
	}

	return nil
}

func (h *WorkspaceHandler) extractDefaultRights(ctx context.Context, workspace *idm.Workspace) string {
	var value string
	if workspace.Attributes != "" {
		var atts map[string]interface{}
		if e := json.Unmarshal([]byte(workspace.Attributes), &atts); e == nil {
			if passed, ok := atts["DEFAULT_RIGHTS"]; ok {
				value = passed.(string)
				delete(atts, "DEFAULT_RIGHTS")
				jsonAttributes, _ := json.Marshal(atts)
				workspace.Attributes = string(jsonAttributes)
			}
		}
	}
	return value
}

func (h *WorkspaceHandler) manageDefaultRights(ctx context.Context, workspace *idm.Workspace, read bool, value string) error {

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	if read {
		// Load RootRole ACLs and append to Attributes
		q1, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{workspace.UUID},
			RoleIDs:      []string{"ROOT_GROUP"},
		})
		q2, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			Actions: []*idm.ACLAction{permissions.AclRead, permissions.AclWrite},
		})
		stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
			Query: &service.Query{
				SubQueries: []*any.Any{q1, q2},
				Operation:  service.OperationType_AND,
			},
		})
		if err != nil {
			return err
		}
		defer stream.Close()
		var read, write bool
		for {
			r, e := stream.Recv()
			if e != nil {
				break
			}
			if r.ACL.Action.Name == permissions.AclRead.Name {
				read = true
			}
			if r.ACL.Action.Name == permissions.AclWrite.Name {
				write = true
			}
		}
		s := ""
		if read {
			s += "r"
		}
		if write {
			s += "w"
		}
		attributes := make(map[string]interface{}, 1)
		if workspace.Attributes != "" {
			var atts map[string]interface{}
			if e := json.Unmarshal([]byte(workspace.Attributes), &atts); e == nil {
				attributes = atts
			}
		}
		attributes["DEFAULT_RIGHTS"] = s
		jsonAttributes, _ := json.Marshal(attributes)
		workspace.Attributes = string(jsonAttributes)

	} else {
		log.Logger(ctx).Debug("Manage default Rights: " + value)

		// Delete RootRole values first
		q1, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{workspace.UUID},
			RoleIDs:      []string{"ROOT_GROUP"},
		})
		q2, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			Actions: []*idm.ACLAction{permissions.AclRead, permissions.AclWrite},
		})
		_, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{
			Query: &service.Query{
				SubQueries: []*any.Any{q1, q2},
				Operation:  service.OperationType_AND,
			},
		})
		if err != nil {
			return err
		}

		// Now Update RootRole
		if value == "" {
			return nil
		}
		read := strings.Contains(value, "r")
		write := strings.Contains(value, "w")
		for _, node := range workspace.RootNodes {
			// Create ACLs for root group
			if read {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
					WorkspaceID: workspace.UUID,
					RoleID:      "ROOT_GROUP",
					NodeID:      node.Uuid,
					Action:      permissions.AclRead,
				}})
			}
			if write {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
					WorkspaceID: workspace.UUID,
					RoleID:      "ROOT_GROUP",
					NodeID:      node.Uuid,
					Action:      permissions.AclWrite,
				}})
			}
		}

	}

	return nil

}

func (h *WorkspaceHandler) allowCurrentUser(ctx context.Context, workspace *idm.Workspace) error {

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())

	if ctx.Value(claim.ContextKey) != nil {
		claims := ctx.Value(claim.ContextKey).(claim.Claims)
		userId, e := claims.DecodeUserUuid()
		if e != nil {
			return e
		}
		for _, node := range workspace.RootNodes {
			// Create ACLs for user id
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				WorkspaceID: workspace.UUID,
				RoleID:      userId,
				NodeID:      node.Uuid,
				Action:      permissions.AclRead,
			}})
			aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				WorkspaceID: workspace.UUID,
				RoleID:      userId,
				NodeID:      node.Uuid,
				Action:      permissions.AclWrite,
			}})
		}
	}
	return nil
}
