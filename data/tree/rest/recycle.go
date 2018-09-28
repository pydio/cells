package rest

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
)

type deleteJobs struct {
	RecyclesNodes map[string]*tree.Node
	RecycleMoves  map[string][]string
	RealDeletes   []string
}

func newDeleteJobs() *deleteJobs {
	return &deleteJobs{
		RecycleMoves:  make(map[string][]string),
		RecyclesNodes: make(map[string]*tree.Node),
	}
}

func sourceInRecycle(ctx context.Context, source *tree.Node, ancestors []*tree.Node) bool {

	for _, n := range ancestors {
		if n.GetStringMeta("name") == common.RECYCLE_BIN_NAME {
			return true
		}
	}

	return false
}

func findRecycleForSource(ctx context.Context, source *tree.Node, ancestors []*tree.Node) (recycle *tree.Node, err error) {

	var ids []string
	for _, n := range ancestors {
		ids = append(ids, n.Uuid)
	}
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		NodeIDs: ids,
		Actions: []*idm.ACLAction{utils.ACL_RECYCLE_ROOT},
	})
	recycleAcls := map[string]bool{}
	cl := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	s, e := cl.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{SubQueries: []*any.Any{q}},
	})
	if e != nil {
		err = e
		return
	}
	defer s.Close()
	for {
		r, e := s.Recv()
		if e != nil {
			break
		}
		recycleAcls[r.ACL.NodeID] = true
	}
	for _, n := range ancestors {
		if _, ok := recycleAcls[n.Uuid]; ok {
			recycle = n
			break
		}
	}

	if recycle == nil {
		err = errors.NotFound("RecycleNotFound", "cannot find recycle root on this branch")
	}
	return
}
