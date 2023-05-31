/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/sql/index"
)

var (
	aclClient idm.ACLServiceClient
)

// TriggerResync on index performs a Lost+Found request to auto-heal indexation errors, whenever possible
func (s *TreeServer) TriggerResync(ctx context.Context, request *sync.ResyncRequest) (*sync.ResyncResponse, error) {
	dao := s.getDAO("")

	resp := &sync.ResyncResponse{}
	if request.GetPath() == "flatten" {
		msg, err := dao.Flatten()
		if err != nil {
			resp.JsonDiff = err.Error()
		} else {
			resp.Success = true
			resp.JsonDiff = msg
		}
		return resp, err
	}

	duplicates, err := dao.LostAndFounds(ctx)
	if err != nil {
		return resp, err
	}
	var excludeFromRehash []index.LostAndFound
	if len(duplicates) > 0 {
		log.Logger(ctx).Info("[Index] Duplicates found at session indexation start", zap.Int("dups", len(duplicates)))
		log.TasksLogger(ctx).Info("[Index] Duplicates found at session indexation start", zap.Int("dups", len(duplicates)))

		marked, conflicts, err := s.checkACLs(ctx, duplicates)
		if err != nil {
			return resp, err
		}
		for _, d := range marked {
			e := dao.FixLostAndFound(d)
			if e != nil {
				log.Logger(ctx).Error("[Index] "+d.String()+"- "+e.Error(), zap.Error(e))
				log.TasksLogger(ctx).Error("[Index] "+d.String()+"- "+e.Error(), zap.Error(e))
			} else {
				log.Logger(ctx).Info("[Index] Fixed " + d.String())
				log.TasksLogger(ctx).Info("[Index] Fixed " + d.String())
			}
		}
		for _, d := range conflicts {
			excludeFromRehash = append(excludeFromRehash, d)
			log.Logger(ctx).Error("[Index] Conflict: " + d.String())
			log.TasksLogger(ctx).Error("[Index] Conflict: " + d.String())
		}
	}

	// Now recomputing hash2 marked as random
	a, e := dao.FixRandHash2(excludeFromRehash...)
	if e == nil && a > 0 {
		msg := fmt.Sprintf("[Index] Recomputed parent hash for %d row(s)", a)
		log.Logger(ctx).Info(msg)
		log.TasksLogger(ctx).Info(msg)
	}

	return resp, e
}

// checkACLs checks all nodes UUIDs against ACLs to make sure that we do not delete a node that has an ACL on it
func (s *TreeServer) checkACLs(ctx context.Context, ll []index.LostAndFound) (marked []index.LostAndFound, conflicts []index.LostAndFound, e error) {

	if aclClient == nil {
		aclClient = idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	}
	var uuids []string
	for _, l := range ll {
		uuids = append(uuids, l.GetUUIDs()...)
	}
	q, _ := anypb.New(&idm.ACLSingleQuery{NodeIDs: uuids})
	st, er := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if er != nil {
		e = er
		return
	}
	defer st.CloseSend()
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
		if l.IsDuplicate() && removable != nil && len(removable) > 1 {
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
