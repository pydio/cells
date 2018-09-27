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

	log.Logger(ctx).Info("Upgrading ACLs for recycle_root flags")
	metaClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())
	dao := servicecontext.GetDAO(ctx).(acl.DAO)
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

	return nil
}
