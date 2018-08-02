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
	"io"
	"strings"

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
	"github.com/pydio/cells/common/utils"
)

var profilesLevel = map[string]int{
	common.PYDIO_PROFILE_ANON:     0,
	common.PYDIO_PROFILE_SHARED:   1,
	common.PYDIO_PROFILE_STANDARD: 2,
	common.PYDIO_PROFILE_ADMIN:    3,
}

type UserHandler struct {
	resources.ResourceProviderHandler
}

func NewUserHandler() *UserHandler {
	h := &UserHandler{}
	h.PoliciesLoader = h.PoliciesForUserId
	h.ServiceName = common.SERVICE_USER
	h.ResourceName = "user"
	return h
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *UserHandler) SwaggerTags() []string {
	return []string{"UserService"}
}

// Filter returns a function to filter the swagger path
func (s *UserHandler) Filter() func(string) string {
	return func(s string) string {
		return strings.Replace(s, "{Login}", "{Login:*}", 1)
	}
}

// BindUser checks credentials and bind the user if successful
func (s *UserHandler) BindUser(req *restful.Request, rsp *restful.Response) {

	var user idm.User
	err := req.ReadEntity(&user)
	if err != nil {
		rsp.WriteError(500, err)
		return
	}

	if len(user.Login) == 0 || len(user.Password) == 0 {
		rsp.WriteError(500, errors.BadRequest(common.SERVICE_USER, "Missing arguments for bind request"))
		return
	}

	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	resp, er := cli.BindUser(req.Request.Context(), &idm.BindUserRequest{
		UserName: user.Login,
		Password: user.Password,
	})
	if er != nil {
		rsp.WriteError(401, er)
		return
	}
	rsp.WriteEntity(resp.User)

}

// SearchUsers performs a paginated query to the user repository.
func (s *UserHandler) SearchUsers(req *restful.Request, rsp *restful.Response) {
	ctx := req.Request.Context()

	var userReq rest.SearchUserRequest
	err := req.ReadEntity(&userReq)
	log.Logger(ctx).Debug("Received User.Get API request", zap.Any("q", userReq), zap.Error(err))
	// Ignore empty body
	if err != nil && err != io.EOF {
		rsp.WriteError(500, err)
		return
	}
	// Transform to standard query
	query := &service2.Query{
		Limit:     userReq.Limit,
		Offset:    userReq.Offset,
		GroupBy:   userReq.GroupBy,
		Operation: userReq.Operation,
	}
	var er error
	if query.ResourcePolicyQuery, er = s.RestToServiceResourcePolicy(ctx, userReq.ResourcePolicyQuery); er != nil {
		log.Logger(ctx).Error("403", zap.Error(er))
		service.RestError403(req, rsp, er)
		return
	}
	for _, q := range userReq.Queries {
		anyfied, _ := ptypes.MarshalAny(q)
		if q.Login != "" && strings.HasSuffix(q.Login, "*") {
			// This is a wildcard on line, transform this query to a search on login OR displayName
			attQuery, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
				AttributeName:  "displayName",
				AttributeValue: q.Login,
			})
			wildQuery, _ := ptypes.MarshalAny(&service2.Query{
				Operation:  service2.OperationType_OR,
				SubQueries: []*any.Any{anyfied, attQuery},
			})
			query.SubQueries = append(query.SubQueries, wildQuery)
		} else {
			query.SubQueries = append(query.SubQueries, anyfied)
		}
	}
	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	resp, err := cli.CountUser(ctx, &idm.SearchUserRequest{
		Query: query,
	})
	if err != nil {
		// Handle error
		rsp.WriteError(500, err)
		return
	}
	response := &rest.UsersCollection{
		Total: resp.Count,
	}

	if !userReq.CountOnly {

		streamer, err := cli.SearchUser(ctx, &idm.SearchUserRequest{
			Query: query,
		})
		if err != nil {
			// Handle error
			rsp.WriteError(500, err)
			return
		}
		defer streamer.Close()
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			if resp.User.IsGroup {
				response.Groups = append(response.Groups, resp.User)
			} else {
				u := resp.User
				u.Roles = utils.GetRolesForUser(ctx, u, false)
				u.PoliciesContextEditable = s.IsContextEditable(ctx, u.Uuid, u.Policies)
				response.Users = append(response.Users, u)
			}
		}
	}

	rsp.WriteEntity(response)
}

// DeleteUser removes a user or group from the repository.
func (s *UserHandler) DeleteUser(req *restful.Request, rsp *restful.Response) {

	login := req.PathParameter("Login")
	ctx := req.Request.Context()
	singleQ := &idm.UserSingleQuery{}
	if strings.HasSuffix(req.Request.RequestURI, "%2F") {
		log.Logger(req.Request.Context()).Debug("Received User.Delete API request (GROUP)", zap.String("login", login), zap.String("request", req.Request.RequestURI))
		singleQ.GroupPath = login
		singleQ.Recursive = true
	} else {
		log.Logger(req.Request.Context()).Debug("Received User.Delete API request (LOGIN)", zap.String("login", login), zap.String("request", req.Request.RequestURI))
		singleQ.Login = login
	}
	query, _ := ptypes.MarshalAny(singleQ)
	mainQuery := &service2.Query{SubQueries: []*any.Any{query}}
	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

	// Search first to check policies
	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	defer stream.Close()
	for {
		response, e := stream.Recv()
		if e != nil {
			break
		}
		if response == nil {
			continue
		}
		if !s.MatchPolicies(ctx, response.User.Uuid, response.User.Policies, service2.ResourcePolicyAction_WRITE) {
			log.Auditer(ctx).Error(
				fmt.Sprintf("Error while trying to delete forbidden user %s", response.User.Uuid),
				log.GetAuditId(common.AUDIT_USER_DELETE),
				response.User.ZapUuid(),
			)
			service.RestError403(req, rsp, errors.Forbidden(common.SERVICE_USER, "You are not allowed to edit this resource"))
			return
		}
		break
	}

	// Now delete user or group
	n, e := cli.DeleteUser(req.Request.Context(), &idm.DeleteUserRequest{Query: mainQuery})
	if e != nil {
		service.RestError500(req, rsp, e)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("%d users have been deleted", n.RowsDeleted),
			log.GetAuditId(common.AUDIT_USER_DELETE),
		)
		rsp.WriteEntity(&rest.DeleteResponse{Success: true, NumRows: n.RowsDeleted})
	}

}

// PutUser creates or updates a User if calling client has sufficient permissions.
func (s *UserHandler) PutUser(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputUser idm.User
	err := req.ReadEntity(&inputUser)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch idm.User from request", zap.Error(err))
		rsp.WriteError(500, err)
		return
	}
	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	log.Logger(req.Request.Context()).Debug("Received User.Put API request", inputUser.ZapLogin())
	var update *idm.User
	if inputUser.Uuid != "" {
		if existing, exists := s.userById(ctx, inputUser.Uuid, cli); exists {
			update = existing
		}
	}
	if update != nil {
		// Check User Policies
		if !s.MatchPolicies(ctx, update.Uuid, update.Policies, service2.ResourcePolicyAction_WRITE) {
			log.Auditer(ctx).Error(
				fmt.Sprintf("Error trying to edit forbidden user %s", update.Uuid),
				log.GetAuditId(common.AUDIT_USER_UPDATE),
				update.ZapUuid(),
			)
			service.RestError403(req, rsp, errors.Forbidden(common.SERVICE_USER, "You are not allowed to edit this user!"))
			return
		}
		// Check ADD/REMOVE Roles Policies
		roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
		rolesToCheck := s.diffRoles(inputUser.Roles, update.Roles)
		removes := s.diffRoles(update.Roles, inputUser.Roles)
		log.Logger(ctx).Debug("ADD/REMOVE ROLES", zap.Any("add", rolesToCheck), zap.Any("remove", removes), zap.Any("new", inputUser.Roles), zap.Any("existings", update.Roles))
		rolesToCheck = append(rolesToCheck, removes...)
		if err := s.checkCanAssignRoles(ctx, rolesToCheck, roleCli); err != nil {
			log.Auditer(ctx).Error(
				"Error trying to assign role (forbidden)",
				log.GetAuditId(common.AUDIT_USER_UPDATE),
			)
			service.RestError403(req, rsp, err)
			return
		}
	}

	// Check profile is not higher than current user profile
	if !inputUser.IsGroup {
		_, ctxClaims := utils.FindUserNameInContext(ctx)
		if profilesLevel[inputUser.Attributes["profile"]] > profilesLevel[ctxClaims.Profile] {
			service.RestError403(req, rsp, fmt.Errorf("you are not allowed to set a profile (%s) higher than your current profile (%s)", inputUser.Attributes["profile"], ctxClaims.Profile))
			return
		}
	}

	response, er := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: &inputUser,
	})
	if er != nil {
		rsp.WriteError(500, er)
		return
	}

	if update == nil && inputUser.IsGroup {
		roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
		_, er := roleCli.CreateRole(ctx, &idm.CreateRoleRequest{
			Role: &idm.Role{
				Uuid:      response.User.Uuid,
				GroupRole: true,
				Label:     "Group " + response.User.Uuid,
			},
		})
		if er != nil {
			rsp.WriteError(500, er)
			return
		}
	}
	if update != nil {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Update user %s", update.Uuid),
			log.GetAuditId(common.AUDIT_USER_UPDATE),
			update.ZapUuid(),
		)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Create user %s", response.User.Uuid),
			log.GetAuditId(common.AUDIT_USER_CREATE),
			response.User.ZapUuid(),
		)
	}

	u := response.User
	u.Roles = utils.GetRolesForUser(ctx, u, false)
	rsp.WriteEntity(u)

}

// PutRoles updates an existing user with the passed list of roles.
func (s *UserHandler) PutRoles(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputUser idm.User
	err := req.ReadEntity(&inputUser)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch idm.User from rest query", zap.Error(err))
		rsp.WriteError(500, err)
		return
	}
	log.Logger(ctx).Debug("Received User.PutRoles API request", inputUser.ZapLogin())

	if inputUser.Uuid == "" {
		service.RestError500(req, rsp, errors.BadRequest(common.SERVICE_USER, "Please provide a user ID"))
		return
	}
	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	var update *idm.User
	var exists bool
	if update, exists = s.userById(ctx, inputUser.Uuid, cli); !exists {
		service.RestError404(req, rsp, errors.NotFound(common.SERVICE_USER, "user not found"))
		return
	}

	// Check ADD/REMOVE Roles Policies
	roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	rolesToCheck := s.diffRoles(inputUser.Roles, update.Roles)
	removes := s.diffRoles(update.Roles, inputUser.Roles)
	log.Logger(ctx).Debug("ADD/REMOVE ROLES", zap.Any("add", rolesToCheck), zap.Any("remove", removes), zap.Any("new", inputUser.Roles), zap.Any("existings", update.Roles))
	rolesToCheck = append(rolesToCheck, removes...)
	if err := s.checkCanAssignRoles(ctx, rolesToCheck, roleCli); err != nil {
		log.Auditer(ctx).Error(
			fmt.Sprintf("Error trying to assign role (forbidden) on user %s", update.Uuid),
			log.GetAuditId(common.AUDIT_USER_UPDATE),
		)
		service.RestError403(req, rsp, err)
		return
	}

	// Save existing user with new set of roles
	update.Roles = inputUser.Roles

	response, er := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: update,
	})
	if er != nil {
		rsp.WriteError(500, er)
	} else {
		u := response.User
		u.Roles = update.Roles
		log.Auditer(ctx).Info(
			fmt.Sprintf("Update user roles %s", response.User.Uuid),
			log.GetAuditId(common.AUDIT_USER_UPDATE),
			response.User.ZapUuid(),
		)
		rsp.WriteEntity(u)
	}
}

// PoliciesForUserId retrieves policies for a given UserId.
func (s *UserHandler) PoliciesForUserId(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*service2.ResourcePolicy, e error) {

	user, exists := s.userById(ctx, resourceId, resourceClient.(idm.UserServiceClient))
	if !exists {
		return policies, errors.NotFound(common.SERVICE_USER, "cannot find user with id "+resourceId)
	}
	policies = user.Policies
	return

}

// Load all roles that will be changed and use their Policies to check if they can be
// assigned in the current context.
func (s *UserHandler) checkCanAssignRoles(ctx context.Context, roles []*idm.Role, cli idm.RoleServiceClient) error {
	if len(roles) == 0 {
		// Ignore
		return nil
	}
	var uuids []string
	for _, role := range roles {
		uuids = append(uuids, role.Uuid)
	}
	q, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: uuids})
	streamer, e := cli.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service2.Query{SubQueries: []*any.Any{q}}})
	if e != nil {
		return e
	}
	defer streamer.Close()
	for {
		rsp, e := streamer.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		if !s.MatchPolicies(ctx, rsp.Role.Uuid, rsp.Role.Policies, service2.ResourcePolicyAction_WRITE) {
			log.Logger(ctx).Error("trying to assign a role that is not writeable in the context", zap.Any("r", rsp.Role))
			return errors.Forbidden(common.SERVICE_USER, "You are not allowed to assign this role "+rsp.Role.Uuid)
		}
	}
	return nil
}

// Diff two slices of roles.
func (s *UserHandler) diffRoles(as []*idm.Role, bs []*idm.Role) (diff []*idm.Role) {

	for _, a := range as {
		if a.UserRole || a.GroupRole {
			continue
		}
		exists := false
		for _, b := range bs {
			if b.GroupRole || b.UserRole {
				continue
			}
			if a.Uuid == b.Uuid {
				exists = true
				break
			}
		}
		if !exists {
			diff = append(diff, a)
		}
	}

	return
}

// Loads an existing user by his Uuid.
func (s *UserHandler) userById(ctx context.Context, userId string, cli idm.UserServiceClient) (user *idm.User, exists bool) {

	subQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
		Uuid: userId,
	})

	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{
		Query: &service2.Query{
			SubQueries: []*any.Any{subQ},
		},
	})
	if err != nil {
		return
	}
	defer stream.Close()
	for {
		rsp, e := stream.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		user = rsp.User
		user.Roles = utils.GetRolesForUser(ctx, user, false)
		exists = true
		break
	}

	return

}
