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

package rest

import (
	"context"
	"fmt"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	serviceproto "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

// NewRoleHandler creates and configure a new RoleHandler
func NewRoleHandler() *RoleHandler {
	handler := new(RoleHandler)
	handler.ServiceName = common.ServiceRole
	handler.ResourceName = "role"
	handler.PoliciesLoader = handler.PoliciesForRole
	return handler
}

// RoleHandler is the REST specific handler to access the role service
type RoleHandler struct {
	resources.ResourceProviderHandler
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *RoleHandler) SwaggerTags() []string {
	return []string{"RoleService"}
}

// Filter returns a function to filter the swagger path
func (s *RoleHandler) Filter() func(string) string {
	return nil
}

// GetRole provides a REST end point to retrieve a given Role with UUID
func (s *RoleHandler) GetRole(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	uuid := req.PathParameter("Uuid")
	log.Logger(ctx).Debug("Received Role.Get API request for uuid " + uuid)
	query, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: []string{uuid},
	})
	cl := idmc.RoleServiceClient(ctx)
	var role *idm.Role
	streamer, err := cl.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &serviceproto.Query{
			SubQueries: []*anypb.Any{query},
		},
	})
	if er := commons.ForEach(streamer, err, func(resp *idm.SearchRoleResponse) error {
		role = resp.GetRole()
		role.PoliciesContextEditable = s.IsContextEditable(ctx, role.Uuid, role.Policies)
		return nil
	}); er != nil {
		return er
	}
	if role == nil {
		return errors.WithMessagef(errors.RoleNotFound, "cannot find role with uuid %s", uuid)
	} else {
		return rsp.WriteEntity(role)
	}

}

// SearchRoles provides a REST endpoint to query the role repository
func (s *RoleHandler) SearchRoles(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()

	var inputQuery rest.SearchRoleRequest
	if err := req.ReadEntity(&inputQuery); err != nil {
		return err
	}
	log.Logger(ctx).Debug("Received Role.Search API request", zap.Any("q", &inputQuery))
	// Transform to standard query
	query := &serviceproto.Query{
		Limit:     inputQuery.Limit,
		Offset:    inputQuery.Offset,
		GroupBy:   inputQuery.GroupBy,
		Operation: inputQuery.Operation,
	}
	for _, q := range inputQuery.Queries {
		anyfied, _ := anypb.New(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}
	var er error
	if query.ResourcePolicyQuery, er = s.RestToServiceResourcePolicy(ctx, inputQuery.ResourcePolicyQuery); er != nil {
		return er // already a 403
	}
	cl := idmc.RoleServiceClient(ctx)
	request := &idm.SearchRoleRequest{Query: query}
	cr, e := cl.CountRole(ctx, request)
	if e != nil {
		return e
	}

	result := &rest.RolesCollection{
		Total: cr.GetCount(),
	}
	streamer, err := cl.SearchRole(ctx, request)
	if er = commons.ForEach(streamer, err, func(resp *idm.SearchRoleResponse) error {
		resp.Role.PoliciesContextEditable = s.IsContextEditable(ctx, resp.Role.Uuid, resp.Role.Policies)
		result.Roles = append(result.Roles, resp.Role)
		return nil
	}); er != nil {
		return er
	}

	return rsp.WriteEntity(result)

}

// DeleteRole provides a REST endpoint to delete a given role given its UUID
func (s *RoleHandler) DeleteRole(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	uuid := req.PathParameter("Uuid")
	log.Logger(ctx).Debug("Received Role.Delete API request", zap.String("name", uuid))

	cl := idmc.RoleServiceClient(ctx)
	if checkError := s.IsAllowed(ctx, uuid, serviceproto.ResourcePolicyAction_WRITE, cl); checkError != nil {
		return checkError
	}

	// Now delete role
	query, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: []string{uuid},
	})
	_, e := cl.DeleteRole(ctx, &idm.DeleteRoleRequest{
		Query: &serviceproto.Query{SubQueries: []*anypb.Any{query}},
	})
	if e != nil {
		return e
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted role [%s]", uuid),
		log.GetAuditId(common.AuditRoleDelete),
		zap.String(common.KeyRoleUuid, uuid),
	)
	return rsp.WriteEntity(&idm.Role{Uuid: uuid})

}

// SetRole provides a REST endpoint to create or update a role in the repository
func (s *RoleHandler) SetRole(req *restful.Request, rsp *restful.Response) error {

	var inputRole idm.Role
	if err := req.ReadEntity(&inputRole); err != nil {
		return err
	}
	if inputRole.Uuid == "" {
		inputRole.Uuid = req.PathParameter("Uuid")
	}
	ctx := req.Request.Context()
	cl := idmc.RoleServiceClient(ctx)
	log.Logger(ctx).Debug("Received Role.Set", zap.Any("r", &inputRole))

	if checkError := s.IsAllowed(ctx, inputRole.Uuid, serviceproto.ResourcePolicyAction_WRITE, cl); !errors.Is(checkError, errors.StatusNotFound) {
		return checkError
	}
	// in fact create or update
	resp, er := cl.CreateRole(ctx, &idm.CreateRoleRequest{
		Role: &inputRole,
	})
	if er != nil {
		return er
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Updated role [%s]", inputRole.Label),
		log.GetAuditId(common.AuditRoleUpdate),
		inputRole.Zap(),
	)
	return rsp.WriteEntity(resp.Role)

}

// PoliciesForRole retrieves Policies bound to a role given its UUID
func (s *RoleHandler) PoliciesForRole(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*serviceproto.ResourcePolicy, e error) {

	query, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: []string{resourceId},
	})
	searchQuery := &serviceproto.Query{SubQueries: []*anypb.Any{query}}

	var found bool
	cli := resourceClient.(idm.RoleServiceClient)
	st, e := cli.SearchRole(ctx, &idm.SearchRoleRequest{Query: searchQuery})
	if e = commons.ForEach(st, e, func(t *idm.SearchRoleResponse) error {
		policies = t.GetRole().GetPolicies()
		found = true
		return nil
	}); e != nil {
		return policies, e
	}
	if !found {
		return policies, errors.WithMessagef(errors.RoleNotFound, "cannot find role with id %s", resourceId)
	}
	return
}
