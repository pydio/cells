package permissions

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// CheckDefinedRootsForWorkspace reads roots from tree service
func CheckDefinedRootsForWorkspace(ctx context.Context, ws *idm.Workspace, resolver VirtualPathResolver) error {
	uuids := ws.RootUUIDs
	if len(uuids) == 0 && len(ws.RootNodes) > 0 {
		for _, n := range ws.RootNodes {
			uuids = append(uuids, n.GetUuid())
		}
	}
	if len(uuids) == 0 {
		return fmt.Errorf("cannot define workspace without any root nodes")
	}

	streamer := tree.NewNodeProviderStreamerClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree))
	c, e := streamer.ReadNodeStream(ctx)
	if e != nil {
		return e
	}
	for _, nodeId := range uuids {
		if _, o := resolver(ctx, &tree.Node{Uuid: nodeId}); o {
			// Ignore roots based on virtual nodes
			continue
		}
		if e := c.Send(&tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeId}}); e != nil {
			return e
		}
		if r, e := c.Recv(); e != nil || r == nil || r.GetNode() == nil || r.GetNode().GetUuid() == "" {
			return fmt.Errorf("cannot find workspace root by uuid (%s), maybe datasource is not ready yet? Error was: %s", nodeId, e.Error())
		} else {
			log.Logger(ctx).Debug("PutWorkspace : found root node", r.GetNode().Zap("root"))
		}
	}
	return nil
}

// LoadRootNodesForWorkspaces finds all root nodes based on the ACLs
func LoadRootNodesForWorkspaces(ctx context.Context, wsUUIDs []string, wss map[string]*idm.Workspace, resolver VirtualPathResolver) error {

	acls, err := GetACLsForWorkspace(ctx, wsUUIDs, &idm.ACLAction{Name: AclWsrootActionName})
	if err != nil {
		return err
	}
	wsAcls := make(map[string][]*idm.ACL, len(wsUUIDs))
	for _, a := range acls {
		wsAcls[a.WorkspaceID] = append(wsAcls[a.WorkspaceID], a)
	}
	streamer := tree.NewNodeProviderStreamerClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree))
	c, e := streamer.ReadNodeStream(ctx)
	if e != nil {
		return e
	}

	localCache := make(map[string]*tree.Node)
	for uuid, ws := range wss {
		aa, o := wsAcls[uuid]
		if !o {
			continue
		}
		for _, a := range aa {
			if n, o := localCache[a.NodeID]; o {
				if ws.RootNodes == nil {
					ws.RootNodes = make(map[string]*tree.Node)
				}
				ws.RootNodes[a.NodeID] = n
			}
			c.Send(&tree.ReadNodeRequest{Node: &tree.Node{Uuid: a.NodeID}})
			r, e := c.Recv()
			if e != nil {
				break
			}
			if r != nil && r.Success {
				if ws.RootNodes == nil {
					ws.RootNodes = make(map[string]*tree.Node)
				}
				ws.RootNodes[a.NodeID] = r.Node.WithoutReservedMetas()
				localCache[a.NodeID] = r.Node.WithoutReservedMetas()
			} else {
				// May be a virtual node
				if node, ok := resolver(ctx, &tree.Node{Uuid: a.NodeID}); ok {
					if ws.RootNodes == nil {
						ws.RootNodes = make(map[string]*tree.Node)
					}
					ws.RootNodes[a.NodeID] = node.WithoutReservedMetas()
					localCache[a.NodeID] = node.WithoutReservedMetas()
				}
			}
		}
	}
	return nil
}

// StoreRootNodesAsACLs transforms a list of RootNodes into a list of ACL and store them.
func StoreRootNodesAsACLs(ctx context.Context, ws *idm.Workspace, update bool) error {

	reassign := make(map[string][]*idm.ACLAction)
	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))

	if update {
		// Delete current Root Nodes ACLs
		q, _ := anypb.New(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{ws.UUID},
			Actions:      []*idm.ACLAction{{Name: AclWsrootActionName}, {Name: AclRecycleRoot.Name}},
		})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
		if e != nil {
			return e
		}
		// Search ACLs to reassign, then delete them
		q2, _ := anypb.New(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{ws.UUID},
		})
		q3, _ := anypb.New(&idm.ACLSingleQuery{
			NodeIDs: []string{"-1"},
			Not:     true,
		})
		q4, _ := anypb.New(&idm.ACLSingleQuery{
			RoleIDs: []string{"-1"},
			Not:     true,
		})
		query := &service.Query{SubQueries: []*anypb.Any{q2, q3, q4}, Operation: service.OperationType_AND}
		sClient, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: query})
		if e != nil {
			return e
		}
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
			Action:      &idm.ACLAction{Name: AclWsrootActionName, Value: node.GetPath()},
		}}); e != nil {
			return e
		}
		// Recycle Roots
		if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			WorkspaceID: ws.UUID,
			NodeID:      nodeId,
			Action:      AclRecycleRoot,
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

// ExtractDefaultRights loads known workspace attributes, extract defaultRights and quotaValue as strings and remove them
// from the attributes map
func ExtractDefaultRights(ctx context.Context, workspace *idm.Workspace) (string, string) {
	var rightsValue, quotaValue string
	wsAttr := workspace.LoadAttributes()
	var modified bool
	if wsAttr.DefaultRights != "" {
		rightsValue = wsAttr.DefaultRights
		wsAttr.DefaultRights = ""
		modified = true
	}
	if wsAttr.QuotaValue != "" {
		quotaValue = wsAttr.QuotaValue
		wsAttr.QuotaValue = ""
		modified = true
	}
	if modified {
		workspace.SetAttributes(wsAttr)
	}

	/*
		if workspace.Attributes != "" {
			var atts map[string]interface{}
			if e := json.Unmarshal([]byte(workspace.Attributes), &atts); e == nil {
				var modif bool
				if passed, ok := atts["DEFAULT_RIGHTS"]; ok {
					rightsValue = passed.(string)
					delete(atts, "DEFAULT_RIGHTS")
					modif = true
				}
				if q, ok := atts["QUOTA"]; ok {
					quotaValue = q.(string)
					delete(atts, "QUOTA")
					modif = true
				}
				if modif {
					jsonAttributes, _ := json.Marshal(atts)
					workspace.Attributes = string(jsonAttributes)
				}
			}
		}
	*/
	return rightsValue, quotaValue
}

// BulkReadDefaultRights matches ROOT_GROUP ACLs and set them as Workspace Attributes "DEFAULT_RIGHTS". It is a batch version
// of ManageDefaultRights in read mode.
func BulkReadDefaultRights(ctx context.Context, uuids []string, wss map[string]*idm.Workspace) error {

	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	// Load RootRole ACLs and append to Attributes
	q1, _ := anypb.New(&idm.ACLSingleQuery{
		WorkspaceIDs: uuids,
		RoleIDs:      []string{"ROOT_GROUP"},
	})
	q2, _ := anypb.New(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{AclRead, AclWrite, AclQuota},
	})
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{q1, q2},
			Operation:  service.OperationType_AND,
		},
	})
	if err != nil {
		return err
	}
	rightStrings := make(map[string]string, len(uuids))
	quotaStrings := make(map[string]string, len(uuids))
	for {
		r, e := stream.Recv()
		if e != nil {
			break
		}
		st := ""
		wsID := r.ACL.WorkspaceID
		if s, o := rightStrings[wsID]; o {
			st = s
		}
		switch r.ACL.Action.Name {
		case AclRead.Name:
			st += "r"
		case AclWrite.Name:
			st += "w"
		case AclQuota.Name:
			quotaStrings[wsID] = r.ACL.Action.Value
		}
		if st != "" {
			rightStrings[wsID] = st
		}
	}
	for uuid, workspace := range wss {
		attributes := workspace.LoadAttributes()
		// Apply permission if found
		if r, o := rightStrings[uuid]; o {
			attributes.DefaultRights = r
		}
		// Apply quota if found
		if q, o := quotaStrings[uuid]; o {
			attributes.QuotaValue = q
		}
		workspace.SetAttributes(attributes)
	}
	return nil
}

// ManageDefaultRights either read or write default rights by transforming ACLs into workspace attributes back and forth.
// For reading on many workspace, use BulkReadDefaultRights instead.
func ManageDefaultRights(ctx context.Context, workspace *idm.Workspace, read bool, rightsValue string, newQuota string) error {

	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	if read {
		// Load RootRole ACLs and append to Attributes
		q1, _ := anypb.New(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{workspace.UUID},
			RoleIDs:      []string{"ROOT_GROUP"},
		})
		q2, _ := anypb.New(&idm.ACLSingleQuery{
			Actions: []*idm.ACLAction{AclRead, AclWrite, AclQuota},
		})
		stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{q1, q2},
				Operation:  service.OperationType_AND,
			},
		})
		if err != nil {
			return err
		}
		var read, write bool
		var strQuota string
		for {
			r, e := stream.Recv()
			if e != nil {
				break
			}
			if r.ACL.Action.Name == AclRead.Name {
				read = true
			}
			if r.ACL.Action.Name == AclWrite.Name {
				write = true
			}
			if r.ACL.Action.Name == AclQuota.Name {
				strQuota = r.ACL.Action.Value
			}
		}
		s := ""
		if read {
			s += "r"
		}
		if write {
			s += "w"
		}
		attributes := workspace.LoadAttributes()
		attributes.DefaultRights = s
		if strQuota != "" {
			attributes.QuotaValue = strQuota
		}
		workspace.SetAttributes(attributes)

	} else {
		log.Logger(ctx).Debug("Manage default Rights: " + rightsValue)

		// Delete RootRole values first
		q1, _ := anypb.New(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{workspace.UUID},
			RoleIDs:      []string{"ROOT_GROUP"},
		})
		q2, _ := anypb.New(&idm.ACLSingleQuery{
			Actions: []*idm.ACLAction{AclRead, AclWrite, AclQuota},
		})
		_, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{
			Query: &service.Query{
				SubQueries: []*anypb.Any{q1, q2},
				Operation:  service.OperationType_AND,
			},
		})
		if err != nil {
			return err
		}

		// Now Update RootRole
		if rightsValue == "" && newQuota == "" {
			return nil
		}
		read := strings.Contains(rightsValue, "r")
		write := strings.Contains(rightsValue, "w")
		for _, node := range workspace.RootNodes {
			// Create ACLs for root group
			if read {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
					WorkspaceID: workspace.UUID,
					RoleID:      "ROOT_GROUP",
					NodeID:      node.Uuid,
					Action:      AclRead,
				}})
			}
			if write {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
					WorkspaceID: workspace.UUID,
					RoleID:      "ROOT_GROUP",
					NodeID:      node.Uuid,
					Action:      AclWrite,
				}})
			}
			if newQuota != "" && newQuota != "0" {
				aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
					Action:      &idm.ACLAction{Name: AclQuota.Name, Value: newQuota},
					RoleID:      "ROOT_GROUP",
					WorkspaceID: workspace.UUID,
					NodeID:      node.Uuid,
				}})
			}
		}

	}

	return nil

}
