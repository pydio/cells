package share

import (
	"context"
	"fmt"
	"strings"

	"github.com/gosimple/slug"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

// LoadDetectedRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func LoadDetectedRootNodes(ctx context.Context, detectedRoots []string) (rootNodes map[string]*tree.Node) {

	rootNodes = make(map[string]*tree.Node)
	router := views.NewUuidRouter(views.RouterOptions{})
	metaClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
	eventFilter := views.NewRouterEventFilter(views.RouterOptions{AdminView: false})
	accessList, _ := permissions.AccessListFromContextClaims(ctx)
	for _, rootId := range detectedRoots {
		request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}}
		if resp, err := router.ReadNode(ctx, request); err == nil {
			node := resp.Node
			var multipleMeta []*tree.WorkspaceRelativePath
			for _, ws := range accessList.Workspaces {
				if filtered, ok := eventFilter.WorkspaceCanSeeNode(ctx, accessList, ws, resp.Node); ok {
					multipleMeta = append(multipleMeta, &tree.WorkspaceRelativePath{
						WsLabel: ws.Label,
						WsUuid:  ws.UUID,
						WsSlug:  ws.Slug,
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
				if mE := metaResp.GetNode().GetMeta("CellNode", &isRoomNode); mE == nil && isRoomNode {
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

// ParseRootNodes reads the request property to either create a new node using the "rooms" Virtual node,
// or just verify that the root nodes are not empty.
func ParseRootNodes(ctx context.Context, shareRequest *rest.PutCellRequest) (error, *tree.Node, bool) {

	var createdNode *tree.Node
	router := views.NewStandardRouter(views.RouterOptions{})
	for i, n := range shareRequest.Room.RootNodes {
		r, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: n})
		if e != nil {
			return e, nil, false
		}
		// If the virtual root is responded, it may miss the UUID ! Set up manually here
		if r.Node.Uuid == "" {
			r.Node.Uuid = n.Uuid
		}
		shareRequest.Room.RootNodes[i] = r.Node
	}
	if shareRequest.CreateEmptyRoot {

		manager := views.GetVirtualNodesManager()
		internalRouter := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false, AdminView: true})
		if root, exists := manager.ByUuid("cells"); exists {
			parentNode, err := manager.ResolveInContext(ctx, root, internalRouter.GetClientsPool(), true)
			if err != nil {
				return err, nil, false
			}
			index := 0
			labelSlug := slug.Make(shareRequest.Room.Label)
			baseSlug := labelSlug
			for {
				if existingResp, err := internalRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug}}); err == nil && existingResp.Node != nil {
					index++
					labelSlug = fmt.Sprintf("%s-%v", baseSlug, index)
				} else {
					break
				}
			}
			createResp, err := internalRouter.CreateNode(ctx, &tree.CreateNodeRequest{
				Node: &tree.Node{Path: parentNode.Path + "/" + labelSlug},
			})
			if err != nil {
				log.Logger(ctx).Error("share/cells : create empty root", zap.Error(err))
				return err, nil, false
			}
			// Update node meta
			createResp.Node.SetMeta("CellNode", true)
			metaClient := tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
			metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: createResp.Node})
			shareRequest.Room.RootNodes = append(shareRequest.Room.RootNodes, createResp.Node)
			createdNode = createResp.Node
		} else {
			return errors.InternalServerError(common.SERVICE_SHARE, "Wrong configuration, missing rooms virtual node"), nil, false
		}
	}
	if len(shareRequest.Room.RootNodes) == 0 {
		return errors.BadRequest(common.SERVICE_SHARE, "Wrong configuration, missing RootNodes in CellRequest"), nil, false
	}

	// First check of incoming ACLs
	var hasReadonly bool
	for _, root := range shareRequest.Room.RootNodes {
		if root.GetStringMeta(common.MetaFlagReadonly) != "" {
			hasReadonly = true
		}
	}
	if hasReadonly {
		for _, a := range shareRequest.Room.GetACLs() {
			for _, action := range a.GetActions() {
				if action.Name == permissions.AclWrite.Name {
					return errors.Forbidden(common.SERVICE_SHARE, "One of the resource you are sharing is readonly. You cannot assign write permission on this Cell."), nil, true
				}
			}
		}
	}
	log.Logger(ctx).Debug("ParseRootNodes", zap.Any("r", shareRequest.Room.RootNodes), zap.Bool("readonly", hasReadonly))
	return nil, createdNode, hasReadonly

}

// DeleteRootNodeRecursively loads all children of a root node and delete them, including the
// .pydio hidden files when they are folders.
func DeleteRootNodeRecursively(ctx context.Context, roomNode *tree.Node) error {

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
				resp.Node.Path += "/" + common.PydioSyncHiddenFile
			}
			log.Logger(ctx).Debug("Deleting room node associated to workspace", realNode.Zap())
			if _, err := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node}); err != nil {
				log.Logger(ctx).Error("Error while deleting Room Node children", zap.Error(err))
				//return err // Continue anyway?
			}
		}

		if _, err := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{Path: realNode.Path + "/" + common.PydioSyncHiddenFile}}); err != nil {
			return err
		}
	}
	return nil
}

// CheckLinkRootNodes loads the root nodes and check if one of the is readonly. If so, check that
// link permissions do not try to set the Upload mode.
func CheckLinkRootNodes(ctx context.Context, link *rest.ShareLink) error {

	router := views.NewUuidRouter(views.RouterOptions{})
	var hasReadonly bool
	for i, r := range link.RootNodes {
		resp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: r})
		if e != nil {
			return e
		}
		if resp.Node == nil {
			return errors.NotFound(common.SERVICE_SHARE, "cannot find root node")
		}
		link.RootNodes[i] = resp.Node
		if resp.Node.GetStringMeta(common.MetaFlagReadonly) != "" {
			hasReadonly = true
		}
	}
	if hasReadonly {
		for _, p := range link.Permissions {
			if p == rest.ShareLinkAccessType_Upload {
				return errors.Forbidden(common.SERVICE_SHARE, "This resource is not writeable, you are not allowed to set this permission.")
			}
		}
	}

	return nil

}
