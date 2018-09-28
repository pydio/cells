package grpc

import (
	"context"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service2 "github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/idm/acl"
)

// UpgradeTo120 looks for workspace roots and CellNode roots and set a "recycle_root" flag on them.
func UpgradeTo120(ctx context.Context) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	// REMOVE pydiogateway ACLs
	log.Logger(ctx).Info("ACLS: remove pydiogateway ACLs")
	q1, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		WorkspaceIDs: []string{"pydiogateway"},
	})
	if num, e := dao.Del(&service.Query{SubQueries: []*any.Any{q1}}); e != nil {
		log.Logger(ctx).Error("Could not delete pydiogateway acls, please manually remove them from ACLs!", zap.Error(e))
	} else {
		log.Logger(ctx).Info("Removed pydiogateway acls", zap.Int64("numRows", num))
	}

	// ADD recycle_root on workspaces
	log.Logger(ctx).Info("Upgrading ACLs for recycle_root flags")
	metaClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{
			{Name: utils.ACL_WSROOT_ACTION_NAME},
		},
	})
	acls := new([]interface{})
	dao.Search(&service.Query{
		SubQueries: []*any.Any{q},
	}, acls)
	for _, in := range *acls {
		val, ok := in.(*idm.ACL)
		if !ok {
			continue
		}
		var addRecycleAcl bool
		wsPath := val.Action.Value
		if strings.HasPrefix(wsPath, "uuid:") {
			// Load meta from node Uuid and check if it has a CellNode flag
			nodeUuid := strings.TrimPrefix(wsPath, "uuid:")
			service2.Retry(func() error {
				log.Logger(ctx).Info("Loading metadata for node to check if it's a CellNode root")
				if r, e := metaClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}}); e == nil {
					var cellNode bool
					if er := r.Node.GetMeta("CellNode", &cellNode); er == nil && cellNode {
						addRecycleAcl = true
					}
				}
				return nil
			}, 4*time.Second)
		} else {
			addRecycleAcl = true
		}
		if addRecycleAcl {
			newAcl := &idm.ACL{
				WorkspaceID: val.WorkspaceID,
				NodeID:      val.NodeID,
				RoleID:      val.RoleID,
				Action:      utils.ACL_RECYCLE_ROOT,
			}
			log.Logger(ctx).Info("Inserting new ACL")
			if e := dao.Add(newAcl); e != nil {
				log.Logger(ctx).Error("-- Could not create recycle_root ACL", zap.Error(e))
			}
		}
	}

	treeClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
	// Special case for personal files: browse existing folders, assume they are users personal workspaces and add recycle root
	service2.Retry(func() error {
		stream, e := treeClient.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "personal"}})
		if e != nil {
			return e
		}
		defer stream.Close()
		for {
			resp, er := stream.Recv()
			if er != nil {
				break
			}
			if resp == nil || resp.Node == nil || resp.Node.IsLeaf() {
				continue
			}
			newAcl := &idm.ACL{
				NodeID: resp.Node.Uuid,
				Action: utils.ACL_RECYCLE_ROOT,
			}
			log.Logger(ctx).Info("Should insert new ACL for personal folder", resp.Node.ZapPath())
			if e := dao.Add(newAcl); e != nil {
				log.Logger(ctx).Error("-- Could not create recycle_root ACL", zap.Error(e))
			}
		}
		return nil
	}, 8*time.Second)

	return nil
}
