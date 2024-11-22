/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	pbservice "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/idm/acl"
)

// Handler definition
type Handler struct {
	idm.UnimplementedACLServiceServer
	tree.UnimplementedNodeProviderStreamerServer
}

func NewHandler(_ context.Context) *Handler {
	return &Handler{}
}

// CreateACL in database
func (h *Handler) CreateACL(ctx context.Context, req *idm.CreateACLRequest) (*idm.CreateACLResponse, error) {

	resp := &idm.CreateACLResponse{}

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if err := dao.Add(ctx, req.ACL); err != nil {
		return nil, err
	}

	resp.ACL = req.ACL
	broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
		Type: idm.ChangeEventType_UPDATE,
		Acl:  req.ACL,
	})
	return resp, nil
}

// ExpireACL in database
func (h *Handler) ExpireACL(ctx context.Context, req *idm.ExpireACLRequest) (*idm.ExpireACLResponse, error) {

	resp := &idm.ExpireACLResponse{}

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return nil, err
	}
	expTime := time.Unix(req.Timestamp, 0)
	numRows, err := dao.SetExpiry(ctx, req.Query, &expTime, nil)
	if err != nil {
		return nil, err
	}

	resp.Rows = numRows

	return resp, nil
}

// RestoreACL in database
func (h *Handler) RestoreACL(ctx context.Context, req *idm.RestoreACLRequest) (*idm.RestoreACLResponse, error) {

	resp := &idm.RestoreACLResponse{}

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return nil, err
	}

	// Set zeroTime to restore
	numRows, err := dao.SetExpiry(ctx, req.Query, nil, acl.ReadExpirationPeriod(req))
	if err != nil {
		return nil, err
	}

	resp.Rows = numRows

	return resp, nil
}

// DeleteACL from database
func (h *Handler) DeleteACL(ctx context.Context, req *idm.DeleteACLRequest) (*idm.DeleteACLResponse, error) {

	period := acl.ReadExpirationPeriod(req)
	if req.Query == nil && period == nil {
		return nil, fmt.Errorf("please provide at least one of (query|period)")
	}

	response := &idm.DeleteACLResponse{}
	acls := new([]interface{})

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if err := dao.Search(ctx, req.Query, acls, period); err != nil {
		return nil, err
	}

	numRows, err := dao.Del(ctx, req.Query, period)
	response.RowsDeleted = numRows
	if err == nil {
		for _, in := range *acls {
			if val, ok := in.(*idm.ACL); ok {
				broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
					Type: idm.ChangeEventType_DELETE,
					Acl:  val,
				})
			}
		}
	}
	return response, err
}

// SearchACL in database
func (h *Handler) SearchACL(request *idm.SearchACLRequest, response idm.ACLService_SearchACLServer) error {
	if request.Query == nil {
		request.Query = &pbservice.Query{}
	}

	ctx := response.Context()

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return err
	}

	acls := new([]interface{})
	if err := dao.Search(ctx, request.Query, acls, acl.ReadExpirationPeriod(request)); err != nil {
		return err
	}

	for _, in := range *acls {
		val, ok := in.(*idm.ACL)
		if !ok {
			return errors.WithMessagef(errors.StatusInternalServerError, "Wrong type")
		}
		if e := response.Send(&idm.SearchACLResponse{ACL: val}); e != nil {
			return e
		}
	}

	return nil
}

// StreamACL from database
func (h *Handler) StreamACL(streamer idm.ACLService_StreamACLServer) error {

	ctx := streamer.Context()

	dao, err := manager.Resolve[acl.DAO](ctx)
	if err != nil {
		return err
	}

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		acls := new([]interface{})
		if err := dao.Search(ctx, incoming.Query, acls, acl.ReadExpirationPeriod(incoming)); err != nil {
			return err
		}

		for _, in := range *acls {
			if val, ok := in.(*idm.ACL); ok {
				if e := streamer.Send(&idm.SearchACLResponse{ACL: val}); e != nil {
					return e
				}
			}
		}

		if e := streamer.Send(nil); e != nil {
			return e
		}
	}

	return nil
}
