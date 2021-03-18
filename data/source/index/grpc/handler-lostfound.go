package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/registry"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql/index"
)

var (
	aclClient idm.ACLServiceClient
)

// TriggerResync on index performs a Lost+Found request to auto-heal indexation errors, whenever possible
func (s *TreeServer) TriggerResync(ctx context.Context, _ *sync.ResyncRequest, resp *sync.ResyncResponse) error {
	dao := getDAO(ctx, "")
	duplicates, err := dao.LostAndFounds()
	if err != nil {
		return err
	}
	if len(duplicates) > 0 {
		log.Logger(ctx).Info("Duplicates found at session indexation start", zap.Any("dups", len(duplicates)))
		log.TasksLogger(ctx).Info("Duplicates found at session indexation start", zap.Any("dups", len(duplicates)))

		marked, conflicts, err := s.checkACLs(ctx, duplicates)
		if err != nil {
			return err
		}
		for _, d := range marked {
			e := dao.FixLostAndFound(d)
			if e != nil {
				log.Logger(ctx).Error("[FAILED] "+d.String()+"- "+e.Error(), zap.Error(e))
				log.TasksLogger(ctx).Error("[FAILED] "+d.String()+"- "+e.Error(), zap.Error(e))
			} else {
				log.Logger(ctx).Info("[FIXED] " + d.String())
				log.TasksLogger(ctx).Info("[FIXED] " + d.String())
			}
		}
		for _, d := range conflicts {
			log.Logger(ctx).Error("[CONFLICT] " + d.String())
			log.TasksLogger(ctx).Error("[CONFLICT] " + d.String())
		}
	}
	return nil
}

// checkACLs checks all nodes UUIDs against ACLs to make sure that we do not delete a node that has an ACL on it
func (s *TreeServer) checkACLs(ctx context.Context, ll []index.LostAndFound) (marked []index.LostAndFound, conflicts []index.LostAndFound, e error) {

	if aclClient == nil {
		aclClient = idm.NewACLServiceClient(registry.GetClient(common.ServiceAcl))
	}
	var uuids []string
	for _, l := range ll {
		uuids = append(uuids, l.GetUUIDs()...)
	}
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{NodeIDs: uuids})
	st, er := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
	if er != nil {
		e = er
		return
	}
	defer st.Close()
	founds := make(map[string]struct{})
	for {
		resp, e := st.Recv()
		if e != nil {
			break
		}
		founds[resp.ACL.NodeID] = struct{}{}
	}
	for _, l := range ll {
		originals := l.GetUUIDs()
		var removable []string
		for _, id := range originals {
			if _, o := founds[id]; !o {
				removable = append(removable, id)
			}
		}
		if l.IsDuplicate() && removable != nil && len(removable) > 0 {
			// Always keep at least one!
			removable = removable[1:]
		}
		if len(removable) > 0 {
			l.MarkForDeletion(removable)
			marked = append(marked, l)
		} else {
			conflicts = append(conflicts, l)
		}
	}

	return
}
