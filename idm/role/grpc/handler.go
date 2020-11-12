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

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/idm/role"
)

var (
	defaultPolicies = []*service.ResourcePolicy{
		{Subject: "profile:standard", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
		{Subject: "profile:admin", Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
	}
)

// Handler definition
type Handler struct{}

// CreateRole adds a role and its policies in database
func (h *Handler) CreateRole(ctx context.Context, req *idm.CreateRoleRequest, resp *idm.CreateRoleResponse) error {
	dao := servicecontext.GetDAO(ctx).(role.DAO)
	if req.Role.Uuid != "" && strings.Contains(req.Role.Uuid, ",") {
		return errors.BadRequest("forbidden.characters", "commas are not allowed in role uuid")
	}

	r, update, err := dao.Add(req.Role)
	if err != nil {
		return err
	}
	resp.Role = r
	if len(r.Policies) == 0 {
		r.Policies = defaultPolicies
	} /* else {
		for i, pol := range r.Policies {
			fmt.Printf("%d. %s - action: %s\n", i, pol.Subject, pol.Action)
		}
	} */
	err = dao.AddPolicies(update, r.Uuid, r.Policies)
	if err != nil {
		return err
	}

	if update {
		// Propagate event
		client.Publish(ctx, client.NewPublication(common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_UPDATE,
			Role: r,
		}))
		log.Logger(ctx).Info(
			fmt.Sprintf("Role [%s] has been updated", r.Label),
			log.GetAuditId(common.AUDIT_ROLE_UPDATE),
			r.ZapUuid(),
		)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated role [%s]", r.Label),
			log.GetAuditId(common.AUDIT_ROLE_UPDATE),
			r.ZapUuid(),
		)
	} else {
		client.Publish(ctx, client.NewPublication(common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_CREATE,
			Role: r,
		}))
		log.Logger(ctx).Info(
			fmt.Sprintf("Role [%s] has been created", r.Label),
			log.GetAuditId(common.AUDIT_ROLE_CREATE),
			r.ZapUuid(),
		)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created role [%s]", r.Label),
			log.GetAuditId(common.AUDIT_ROLE_CREATE),
			r.ZapUuid(),
		)
	}

	return nil
}

// DeleteRole from database
func (h *Handler) DeleteRole(ctx context.Context, req *idm.DeleteRoleRequest, response *idm.DeleteRoleResponse) error {
	dao := servicecontext.GetDAO(ctx).(role.DAO)

	if req.Query == nil {
		return errors.BadRequest(common.SERVICE_ROLE, "cannot send a DeleteRole request with an empty query")
	}

	var roles []*idm.Role
	if err := dao.Search(req.Query, &roles); err != nil {
		return err
	}

	numRows, err := dao.Delete(req.Query)
	response.RowsDeleted = numRows
	if err != nil {
		return err
	}

	for _, r := range roles {
		// FIXME errors where ignored until now. Should we stop and return an error
		// or better handle the error?
		err2 := dao.DeletePoliciesForResource(r.Uuid)
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies for removed role "+r.Label, zap.Error(err2))
			continue
		}
		err2 = dao.DeletePoliciesBySubject(fmt.Sprintf("role:%s", r.Uuid))
		if err2 != nil {
			log.Logger(ctx).Error("could not delete policies by subject for removed role "+r.Label, zap.Error(err2))
			continue
		}

		// propagate event
		client.Publish(ctx, client.NewPublication(common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_DELETE,
			Role: r,
		}))
		log.Auditer(ctx).Info(
			fmt.Sprintf("Deleted role [%s]", r.Label),
			log.GetAuditId(common.AUDIT_ROLE_DELETE),
			r.ZapUuid(),
		)
	}
	return nil
}

// SearchRole in database
func (h *Handler) SearchRole(ctx context.Context, request *idm.SearchRoleRequest, response idm.RoleService_SearchRoleStream) error {
	dao := servicecontext.GetDAO(ctx).(role.DAO)

	var roles []*idm.Role

	defer response.Close()

	if err := dao.Search(request.Query, &roles); err != nil {
		return err
	}

	for _, r := range roles {
		response.Send(&idm.SearchRoleResponse{Role: r})
	}

	return nil
}

// StreamRole from database
func (h *Handler) StreamRole(ctx context.Context, streamer idm.RoleService_StreamRoleStream) error {
	dao := servicecontext.GetDAO(ctx).(role.DAO)

	defer streamer.Close()

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		var roles []*idm.Role
		if err := dao.Search(incoming.Query, &roles); err != nil {
			return err
		}

		for _, r := range roles {
			streamer.Send(&idm.SearchRoleResponse{Role: r})
		}

		streamer.Send(nil)
	}

	return nil
}
