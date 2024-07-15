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
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	pbservice "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/role"
)

var (
	defaultPolicies = []pbservice.ResourcePolicy{
		{Subject: "profile:standard", Action: pbservice.ResourcePolicyAction_READ, Effect: pbservice.ResourcePolicy_allow},
		{Subject: "profile:admin", Action: pbservice.ResourcePolicyAction_WRITE, Effect: pbservice.ResourcePolicy_allow},
	}
)

// Handler definition
type Handler struct {
	idm.UnimplementedRoleServiceServer

	service.Service
}

func NewHandler() idm.RoleServiceServer {
	return &Handler{}
}

// CreateRole adds a role and its policies in database
func (h *Handler) CreateRole(ctx context.Context, req *idm.CreateRoleRequest) (*idm.CreateRoleResponse, error) {
	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return nil, err
	}

	resp := &idm.CreateRoleResponse{}

	if req.Role.Uuid != "" && strings.Contains(req.Role.Uuid, ",") {
		return nil, errors.WithMessage(errors.InvalidParameters, "commas are not allowed in role uuid")
	}

	r, update, err := dao.Add(ctx, req.Role)
	if err != nil {
		return nil, err
	}
	resp.Role = r
	if len(r.Policies) == 0 {
		r.Policies = make([]*pbservice.ResourcePolicy, len(defaultPolicies))
		for i, p := range defaultPolicies {
			v := p
			r.Policies[i] = &v
		}
	}

	err = dao.AddPolicies(ctx, update, r.Uuid, r.Policies)
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

	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if req.Query == nil {
		return nil, errors.WithMessage(errors.InvalidParameters, "cannot send a DeleteRole request with an empty query")
	}

	var roles []*idm.Role
	if err = dao.Search(ctx, req.Query, &roles); err != nil {
		return nil, err
	}

	numRows, err := dao.Delete(ctx, req.Query)
	if err != nil {
		return nil, err
	}
	response := &idm.DeleteRoleResponse{
		RowsDeleted: numRows,
	}

	for _, r := range roles {
		// Errors a ignored until now. Should we stop and return an error or better handle the error?
		err2 := dao.DeletePoliciesForResource(ctx, r.Uuid)
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies for removed role "+r.Label, zap.Error(err2))
			continue
		}
		err2 = dao.DeletePoliciesBySubject(ctx, fmt.Sprintf("role:%s", r.Uuid))
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

	ctx := response.Context()

	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return err
	}
	request.Query = pbservice.PrepareResourcePolicyQuery(request.Query)

	if err := dao.Search(ctx, request.Query, &roles); err != nil {
		return err
	}

	for _, r := range roles {
		r.Policies, err = dao.GetPoliciesForResource(ctx, r.GetUuid())
		if err != nil {
			return err
		}
		if e := response.Send(&idm.SearchRoleResponse{Role: r}); e != nil {
			return e
		}
	}

	return nil
}

// CountRole in database
func (h *Handler) CountRole(ctx context.Context, request *idm.SearchRoleRequest) (*idm.CountRoleResponse, error) {
	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return nil, err
	}

	count, err := dao.Count(ctx, request.Query)
	if err != nil {
		return nil, err
	}

	return &idm.CountRoleResponse{Count: count}, nil
}

// StreamRole from database
func (h *Handler) StreamRole(streamer idm.RoleService_StreamRoleServer) error {
	ctx := streamer.Context()

	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return err
	}

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		var roles []*idm.Role
		if err = dao.Search(ctx, incoming.Query, &roles); err != nil {
			return err
		}

		for _, r := range roles {
			r.Policies, err = dao.GetPoliciesForResource(ctx, r.GetUuid())
			if err != nil {
				return err
			}
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
