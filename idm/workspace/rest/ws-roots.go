package rest

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
)

// LoadRootNodesForWorkspace loads all root nodes for this workspace
func LoadRootNodesForWorkspace(ctx context.Context, ws *idm.Workspace) error {

	acls, err := utils.GetACLsForWorkspace(ctx, []string{ws.UUID}, &idm.ACLAction{Name: utils.ACL_WSROOT_ACTION_NAME})
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

func StoreRootNodesAsACLs(ctx context.Context, ws *idm.Workspace, update bool) error {

	reassign := make(map[string][]*idm.ACLAction)
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())

	if update {
		// Delete current Root Nodes ACLs
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{ws.UUID},
			Actions:      []*idm.ACLAction{{Name: utils.ACL_WSROOT_ACTION_NAME}},
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
		acl := &idm.ACL{
			WorkspaceID: ws.UUID,
			NodeID:      nodeId,
			Action:      &idm.ACLAction{Name: utils.ACL_WSROOT_ACTION_NAME, Value: node.GetPath()},
		}
		if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); e != nil {
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
