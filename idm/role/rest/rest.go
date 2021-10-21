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

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service"
	serviceproto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
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
func (s *RoleHandler) GetRole(req *restful.Request, rsp *restful.Response) {
	ctx := req.Request.Context()
	uuid := req.PathParameter("Uuid")
	log.Logger(ctx).Debug("Received Role.Get API request for uuid " + uuid)
	query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid: []string{uuid},
	})
	cl := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	streamer, err := cl.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &serviceproto.Query{
			SubQueries: []*any.Any{query},
		},
	})
	if err != nil {
		// Handle error
		return
	}
	defer streamer.Close()
	found := false
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		resp.Role.PoliciesContextEditable = s.IsContextEditable(ctx, resp.Role.Uuid, resp.Role.Policies)
		rsp.WriteEntity(resp.Role)
		found = true
		break
	}
	if !found {
		service.RestError404(req, rsp, errors.NotFound(common.ServiceRole, "cannot find role for uuid "+uuid))
		return
	}
}

// SearchRoles provides a REST endpoint to query the role repository
func (s *RoleHandler) SearchRoles(req *restful.Request, rsp *restful.Response) {
	ctx := req.Request.Context()

	var inputQuery rest.SearchRoleRequest
	err := req.ReadEntity(&inputQuery)
	if err != nil {
		log.Logger(req.Request.Context()).Error("cannot fetch rest.SearchRoleRequest from request", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}
	log.Logger(ctx).Debug("Received Role.Search API request", zap.Any("q", inputQuery))
	// Transform to standard query
	query := &serviceproto.Query{
		Limit:     inputQuery.Limit,
		Offset:    inputQuery.Offset,
		GroupBy:   inputQuery.GroupBy,
		Operation: inputQuery.Operation,
	}
	for _, q := range inputQuery.Queries {
		anyfied, _ := ptypes.MarshalAny(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}
	var er error
	if query.ResourcePolicyQuery, er = s.RestToServiceResourcePolicy(ctx, inputQuery.ResourcePolicyQuery); er != nil {
		log.Logger(ctx).Error("403", zap.Error(er))
		service.RestError403(req, rsp, er)
		return
	}
	cl := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	request := &idm.SearchRoleRequest{Query: query}
	cr, e := cl.CountRole(ctx, request)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}
	streamer, err := cl.SearchRole(ctx, request)
	if err != nil {
		log.Logger(req.Request.Context()).Error("While fetching roles", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}
	defer streamer.Close()
	result := new(rest.RolesCollection)
	result.Total = cr.GetCount()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		resp.Role.PoliciesContextEditable = s.IsContextEditable(ctx, resp.Role.Uuid, resp.Role.Policies)
		result.Roles = append(result.Roles, resp.Role)
	}

	rsp.WriteEntity(result)
}

// DeleteRole provides a REST endpoint to delete a given role given its UUID
func (s *RoleHandler) DeleteRole(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	uuid := req.PathParameter("Uuid")
	log.Logger(ctx).Debug("Received Role.Delete API request", zap.String("name", uuid))

	cl := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	if checkError := s.IsAllowed(ctx, uuid, serviceproto.ResourcePolicyAction_WRITE, cl); checkError != nil {
		service.RestError403(req, rsp, checkError)
		return
	}

	// Now delete role
	query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid: []string{uuid},
	})
	_, e := cl.DeleteRole(ctx, &idm.DeleteRoleRequest{
		Query: &serviceproto.Query{SubQueries: []*any.Any{query}},
	})
	if e != nil {
		service.RestError500(req, rsp, e)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Deleted role [%s]", uuid),
			log.GetAuditId(common.AuditRoleDelete),
			zap.String(common.KeyRoleUuid, uuid),
		)
		rsp.WriteEntity(&idm.Role{Uuid: uuid})
	}
}

// SetRole provides a REST endpoint to create or update a role in the repository
func (s *RoleHandler) SetRole(req *restful.Request, rsp *restful.Response) {

	var inputRole idm.Role
	err := req.ReadEntity(&inputRole)
	if err != nil {
		log.Logger(req.Request.Context()).Error("cannot fetch idm.Role from request", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}
	ctx := req.Request.Context()
	cl := idm.NewRoleServiceClient(common.ServiceGrpcNamespace_+common.ServiceRole, defaults.NewClient())
	log.Logger(ctx).Debug("Received Role.Set", zap.Any("r", inputRole))

	if checkError := s.IsAllowed(ctx, inputRole.Uuid, serviceproto.ResourcePolicyAction_WRITE, cl); checkError != nil && errors.Parse(checkError.Error()).Code != 404 {
		service.RestError403(req, rsp, checkError)
		return
	}
	// in fact create or update
	resp, er := cl.CreateRole(ctx, &idm.CreateRoleRequest{
		Role: &inputRole,
	})
	if er != nil {
		service.RestError500(req, rsp, er)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated role [%s]", inputRole.Label),
			log.GetAuditId(common.AuditRoleUpdate),
			inputRole.Zap(),
		)
		rsp.WriteEntity(resp.Role)
	}
}

// PoliciesForRole retrieves Policies bound to a role given its UUID
func (s *RoleHandler) PoliciesForRole(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*serviceproto.ResourcePolicy, e error) {

	query, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid: []string{resourceId},
	})
	searchQuery := &serviceproto.Query{SubQueries: []*any.Any{query}}

	cli := resourceClient.(idm.RoleServiceClient)
	st, e := cli.SearchRole(ctx, &idm.SearchRoleRequest{Query: searchQuery})
	if e != nil {
		return policies, e
	}
	defer st.Close()
	var role *idm.Role
	for {
		resp, err := st.Recv()
		if err != nil {
			break
		}
		role = resp.Role
		policies = role.Policies
		break
	}
	if role == nil {
		return policies, errors.NotFound(common.ServiceRole, "cannot find role with id "+resourceId)
	}
	return
}
