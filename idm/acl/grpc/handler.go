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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	pbservice "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/idm/acl"
)

// Handler definition
type Handler struct {
	idm.UnimplementedACLServiceServer
	tree.UnimplementedNodeProviderStreamerServer

	service.Service
	dao service.DAOProviderFunc[acl.DAO]
}

func NewHandler(_ context.Context, svc service.Service) *Handler {
	return &Handler{
		Service: svc,
		dao:     service.DAOFromContext[acl.DAO](svc),
	}
}

// CreateACL in database
func (h *Handler) CreateACL(ctx context.Context, req *idm.CreateACLRequest) (*idm.CreateACLResponse, error) {

	resp := &idm.CreateACLResponse{}

	if err := h.dao(ctx).Add(req.ACL); err != nil {
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

	numRows, err := h.dao(ctx).SetExpiry(req.Query, time.Unix(req.Timestamp, 0), nil)
	if err != nil {
		return nil, err
	}

	resp.Rows = numRows

	return resp, nil
}

// RestoreACL in database
func (h *Handler) RestoreACL(ctx context.Context, req *idm.RestoreACLRequest) (*idm.RestoreACLResponse, error) {

	resp := &idm.RestoreACLResponse{}

	// Set zeroTime to restore
	numRows, err := h.dao(ctx).SetExpiry(req.Query, time.Time{}, acl.ReadExpirationPeriod(req))
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
	if err := h.dao(ctx).Search(req.Query, acls, period); err != nil {
		return nil, err
	}

	numRows, err := h.dao(ctx).Del(req.Query, period)
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

	acls := new([]interface{})
	if err := h.dao(response.Context()).Search(request.Query, acls, acl.ReadExpirationPeriod(request)); err != nil {
		return err
	}

	for _, in := range *acls {
		val, ok := in.(*idm.ACL)
		if !ok {
			return errors.InternalServerError(common.ServiceAcl, "Wrong type")
		}
		if e := response.Send(&idm.SearchACLResponse{ACL: val}); e != nil {
			return e
		}
	}

	return nil
}

// StreamACL from database
func (h *Handler) StreamACL(streamer idm.ACLService_StreamACLServer) error {

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		acls := new([]interface{})
		if err := h.dao(streamer.Context()).Search(incoming.Query, acls, acl.ReadExpirationPeriod(incoming)); err != nil {
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
