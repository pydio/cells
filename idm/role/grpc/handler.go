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
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/idm/role"
)

var (
	defaultPolicies = []*service.ResourcePolicy{
		{Subject: "profile:standard", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
		{Subject: "profile:admin", Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
	}
)

// Handler definition
type Handler struct {
	idm.UnimplementedRoleServiceServer
	dao role.DAO
}

func NewHandler(ctx context.Context, dao role.DAO) idm.RoleServiceServer {
	return &Handler{dao: dao}
}

func (h *Handler) Name() string {
	return ServiceName
}

// CreateRole adds a role and its policies in database
func (h *Handler) CreateRole(ctx context.Context, req *idm.CreateRoleRequest) (*idm.CreateRoleResponse, error) {
	resp := &idm.CreateRoleResponse{}

	if req.Role.Uuid != "" && strings.Contains(req.Role.Uuid, ",") {
		return nil, errors.BadRequest("forbidden.characters", "commas are not allowed in role uuid")
	}

	r, update, err := h.dao.Add(req.Role)
	if err != nil {
		return nil, err
	}
	resp.Role = r
	if len(r.Policies) == 0 {
		r.Policies = defaultPolicies
	} /* else {
		for i, pol := range r.Policies {
			fmt.Printf("%d. %s - action: %s\n", i, pol.Subject, pol.Action)
		}
	} */
	err = h.dao.AddPolicies(update, r.Uuid, r.Policies)
	if err != nil {
		return nil, err
	}

	if update {
		// Propagate event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_UPDATE,
			Role: r,
		})
		log.Logger(ctx).Info(
			fmt.Sprintf("Role [%s] has been updated", r.Label),
			log.GetAuditId(common.AuditRoleUpdate),
			r.ZapUuid(),
		)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated role [%s]", r.Label),
			log.GetAuditId(common.AuditRoleUpdate),
			r.ZapUuid(),
		)
	} else {
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_CREATE,
			Role: r,
		})
		log.Logger(ctx).Info(
			fmt.Sprintf("Role [%s] has been created", r.Label),
			log.GetAuditId(common.AuditRoleCreate),
			r.ZapUuid(),
		)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created role [%s]", r.Label),
			log.GetAuditId(common.AuditRoleCreate),
			r.ZapUuid(),
		)
	}

	return resp, nil
}

// DeleteRole from database
func (h *Handler) DeleteRole(ctx context.Context, req *idm.DeleteRoleRequest) (*idm.DeleteRoleResponse, error) {

	if req.Query == nil {
		return nil, errors.BadRequest(common.ServiceRole, "cannot send a DeleteRole request with an empty query")
	}

	var roles []*idm.Role
	if err := h.dao.Search(req.Query, &roles); err != nil {
		return nil, err
	}

	numRows, err := h.dao.Delete(req.Query)
	if err != nil {
		return nil, err
	}
	response := &idm.DeleteRoleResponse{
		RowsDeleted: numRows,
	}

	for _, r := range roles {
		// Errors a ignored until now. Should we stop and return an error or better handle the error?
		err2 := h.dao.DeletePoliciesForResource(r.Uuid)
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies for removed role "+r.Label, zap.Error(err2))
			continue
		}
		err2 = h.dao.DeletePoliciesBySubject(fmt.Sprintf("role:%s", r.Uuid))
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies by subject for removed role "+r.Label, zap.Error(err2))
			continue
		}

		// propagate event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_DELETE,
			Role: r,
		})
		log.Auditer(ctx).Info(
			fmt.Sprintf("Deleted role [%s]", r.Label),
			log.GetAuditId(common.AuditRoleDelete),
			r.ZapUuid(),
		)
	}
	return response, nil
}

// SearchRole in database
func (h *Handler) SearchRole(request *idm.SearchRoleRequest, response idm.RoleService_SearchRoleServer) error {

	var roles []*idm.Role

	if err := h.dao.Search(request.Query, &roles); err != nil {
		return err
	}

	for _, r := range roles {
		if e := response.Send(&idm.SearchRoleResponse{Role: r}); e != nil {
			return e
		}
	}

	return nil
}

// CountRole in database
func (h *Handler) CountRole(ctx context.Context, request *idm.SearchRoleRequest) (*idm.CountRoleResponse, error) {

	count, err := h.dao.Count(request.Query)
	if err != nil {
		return nil, err
	}

	return &idm.CountRoleResponse{Count: count}, nil
}

// StreamRole from database
func (h *Handler) StreamRole(streamer idm.RoleService_StreamRoleServer) error {

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		var roles []*idm.Role
		if err := h.dao.Search(incoming.Query, &roles); err != nil {
			return err
		}

		for _, r := range roles {
			if e := streamer.Send(&idm.SearchRoleResponse{Role: r}); e != nil {
				return e
			}
		}

		if e := streamer.Send(nil); e != nil {
			return e
		}
	}

	return nil
}
