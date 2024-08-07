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

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/front"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/user/grpc"
)

var profilesLevel = map[string]int{
	common.PydioProfileAnon:     0,
	common.PydioProfileShared:   1,
	common.PydioProfileStandard: 2,
	common.PydioProfileAdmin:    3,
	"":                          4,
}

type UserHandler struct {
	RuntimeCtx context.Context
	resources.ResourceProviderHandler
}

func NewUserHandler(ctx context.Context) *UserHandler {
	h := &UserHandler{}
	h.RuntimeCtx = ctx
	h.PoliciesLoader = h.PoliciesForUserId
	h.ServiceName = common.ServiceUser
	h.ResourceName = "user"
	return h
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service.
func (s *UserHandler) SwaggerTags() []string {
	return []string{"UserService"}
}

// Filter returns a function to filter the swagger path.
func (s *UserHandler) Filter() func(string) string {
	return func(s string) string {
		return strings.Replace(s, "{Login}", "{Login:*}", 1)
	}
}

// GetUser finds a user by her login, answering to rest endpoint GET:/a/user/{Login}.
func (s *UserHandler) GetUser(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	login := req.PathParameter("Login")
	if login == "" {
		return errors.WithMessage(errors.InvalidParameters, "please provide a login")
	}

	qLogin, _ := anypb.New(&idm.UserSingleQuery{Login: login})
	query := &service2.Query{
		Limit:      1,
		Offset:     0,
		SubQueries: []*anypb.Any{qLogin},
	}
	query.ResourcePolicyQuery, _ = s.RestToServiceResourcePolicy(ctx, nil)
	var result *idm.User

	streamer, err := idmc.UserServiceClient(ctx).SearchUser(ctx, &idm.SearchUserRequest{
		Query: query,
	})
	if err != nil {
		// Handle error
		return err
	}
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		u := resp.User
		if u.Roles, e = permissions.GetRolesForUser(ctx, u, false); e != nil {
			return e
		}
		result = u.WithPublicData(ctx, s.IsContextEditable(ctx, u.Uuid, u.Policies))
	}

	if result != nil {
		return rsp.WriteEntity(result)
	} else {
		return errors.WithMessagef(errors.UserNotFound, "cannot find user with login %s", login)
	}
}

// SearchUsers performs a paginated query to the user repository.
// Warning: in the returned result, users and groups are stored in two distinct arrays.
func (s *UserHandler) SearchUsers(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()

	var userReq rest.SearchUserRequest
	err := req.ReadEntity(&userReq)
	log.Logger(ctx).Debug("Received User.Get API request", zap.Any("q", userReq), zap.Error(err))
	// Ignore empty body
	if err != nil && err != io.EOF {
		return err
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
		return er
	}
	for _, q := range userReq.Queries {
		anyfied, _ := anypb.New(q)
		if q.Login != "" && strings.HasSuffix(q.Login, "*") {
			// This is a wildcard, transform this query to a search on login OR displayName
			attQuery, _ := anypb.New(&idm.UserSingleQuery{
				AttributeName:  "displayName",
				AttributeValue: q.Login,
			})
			wildQuery, _ := anypb.New(&service2.Query{
				Operation:  service2.OperationType_OR,
				SubQueries: []*anypb.Any{anyfied, attQuery},
			})
			query.SubQueries = append(query.SubQueries, wildQuery)
		} else {
			query.SubQueries = append(query.SubQueries, anyfied)
		}
	}
	cli := idmc.UserServiceClient(ctx)
	resp, err := cli.CountUser(ctx, &idm.SearchUserRequest{
		Query: query,
	})
	if err != nil {
		// Handle error
		return er
	}
	response := &rest.UsersCollection{
		Total: resp.Count,
	}
	log.Logger(ctx).Info("User Query", zap.Any("q", query), zap.Int32("t", resp.Count))

	if !userReq.CountOnly {
		streamer, e := cli.SearchUser(ctx, &idm.SearchUserRequest{
			Query: query,
		})
		if fer := commons.ForEach(streamer, e, func(resp *idm.SearchUserResponse) error {
			u := resp.User
			if resp.User.IsGroup {
				u.Roles = append(u.Roles, &idm.Role{Uuid: u.Uuid, GroupRole: true})
				if u.Roles, e = permissions.GetRolesForUser(ctx, u, true); e != nil {
					return e
				}
				u.PoliciesContextEditable = s.IsContextEditable(ctx, u.Uuid, u.Policies)
				response.Groups = append(response.Groups, u)
				log.Logger(ctx).Info("Appending Group" + u.GroupLabel)
			} else {
				if u.Roles, e = permissions.GetRolesForUser(ctx, u, false); e != nil {
					return e
				}
				log.Logger(ctx).Info("Appending User" + u.Login)
				response.Users = append(response.Users, u.WithPublicData(ctx, s.IsContextEditable(ctx, u.Uuid, u.Policies)))
			}
			return nil
		}); fer != nil {
			return fer
		}
	}

	if len(response.Users) > 0 {
		if e := paramsAclsToAttributes(ctx, response.Users); e != nil {
			return e
		}
	}

	return rsp.WriteEntity(response)
}

// DeleteUser removes a user or group from the repository.
func (s *UserHandler) DeleteUser(req *restful.Request, rsp *restful.Response) error {

	login := req.PathParameter("Login")
	ctx := req.Request.Context()
	singleQ := &idm.UserSingleQuery{}
	uName, claims := permissions.FindUserNameInContext(ctx)
	if strings.HasSuffix(req.Request.RequestURI, "%2F") || strings.HasSuffix(req.Request.RequestURI, "/") {
		log.Logger(ctx).Info("Received User.Delete API request (GROUP)", zap.String("login", login), zap.String("crtGroup", claims.GroupPath), zap.String("request", req.Request.RequestURI))
		if strings.HasPrefix(claims.GroupPath, "/"+login) {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiGroupCannotDeleteOwn)
		}
		singleQ.GroupPath = login
		singleQ.Recursive = true
	} else {
		if uName == login {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserCannotDeleteOwn)
		}
		log.Logger(ctx).Debug("Received User.Delete API request (LOGIN)", zap.String("login", login), zap.String("request", req.Request.RequestURI))
		singleQ.Login = login
	}
	query, _ := anypb.New(singleQ)
	mainQuery := &service2.Query{SubQueries: []*anypb.Any{query}}
	cli := idmc.UserServiceClient(ctx)

	// Search first to check policies
	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	err = commons.ForEach(stream, err, func(response *idm.SearchUserResponse) error {
		if s.MatchPolicies(ctx, response.User.Uuid, response.User.Policies, service2.ResourcePolicyAction_WRITE) {
			return nil
		}
		jj, _ := json.Marshal(response.User.Policies)
		subj, _ := auth.SubjectsForResourcePolicyQuery(ctx, nil)
		ss, _ := json.Marshal(subj)
		log.Auditer(ctx).Error(
			fmt.Sprintf("Forbidden action: could not delete user [%s], policies were %s, subjects %s", response.User.Login, string(jj), string(ss)),
			log.GetAuditId(common.AuditUserDelete),
			response.User.ZapUuid(),
		)
		return errors.WithMessage(errors.StatusForbidden, "You are not allowed to edit this resource")
	})
	if err != nil {
		return err
	}

	if singleQ.GroupPath != "" {

		uName, _ := permissions.FindUserNameInContext(ctx)
		// This is a group deletion - send it in background
		jobUuid := uuid.New()
		job := &jobs.Job{
			ID:             "delete-group-" + jobUuid,
			Owner:          uName,
			Label:          "Delete groups in background",
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: grpc.DeleteUsersActionName,
					Parameters: map[string]string{
						"groupPath": singleQ.GroupPath,
					},
				},
			},
		}

		clj := jobsc.JobServiceClient(ctx)
		if _, er := clj.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			return er
		}
		return rsp.WriteEntity(&rest.DeleteResponse{Success: true, NumRows: 0})

	} else {

		// Now delete user or group
		n, e := cli.DeleteUser(req.Request.Context(), &idm.DeleteUserRequest{Query: mainQuery})
		if e != nil {
			return e
		}
		msg := fmt.Sprintf("Deleted user [%s]", login)
		if n.RowsDeleted > 1 {
			msg = fmt.Sprintf("Deleted %d users", n.RowsDeleted)
		}

		log.Auditer(ctx).Info(msg,
			log.GetAuditId(common.AuditUserDelete),
		)
		return rsp.WriteEntity(&rest.DeleteResponse{Success: true, NumRows: n.RowsDeleted})
	}

}

// PutUser creates or updates a User if calling client has sufficient permissions.
func (s *UserHandler) PutUser(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var inputUser idm.User
	if err := req.ReadEntity(&inputUser); err != nil {
		return err
	}
	if inputUser.Login == "" {
		inputUser.Login = req.PathParameter("Login")
	}
	if inputUser.Login == "" {
		return errors.WithMessage(errors.InvalidParameters, "cannot create user without at least a login")
	}
	if strings.Contains(inputUser.Login, "/") {
		return errors.WithMessage(errors.InvalidParameters, "login field cannot contain a group path")
	}
	cli := idmc.UserServiceClient(ctx)
	log.Logger(req.Request.Context()).Debug("Received User.Put API request", inputUser.ZapLogin())
	var update *idm.User
	if inputUser.Uuid != "" {
		// Check update
		if existing, er := s.userById(ctx, inputUser.Uuid, cli); er == nil {
			update = existing
		} else if !errors.Is(er, errors.UserNotFound) {
			return er
		}
	} else if _, err := permissions.SearchUniqueUser(ctx, inputUser.Login, ""); err == nil {
		// Login without Uuid: check if user already exists
		return errors.WithAPICode(errors.StatusConflict, errors.ApiUserAlreadyExists, "login", inputUser.GetLogin())
	}
	var existingAcls []*idm.ACL
	ctxLogin, ctxClaims := permissions.FindUserNameInContext(ctx)
	if update != nil {
		// Check User Policies
		if !s.MatchPolicies(ctx, update.Uuid, update.Policies, service2.ResourcePolicyAction_WRITE) {
			log.Auditer(ctx).Error(
				fmt.Sprintf("Forbidden action: could not edit user [%s]", update.GetLogin()),
				log.GetAuditId(common.AuditUserUpdate),
				update.ZapUuid(),
			)
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserNotEditable)
		}
		// Check ADD/REMOVE Roles Policies
		roleCli := idmc.RoleServiceClient(ctx)
		rolesToCheck := s.diffRoles(inputUser.Roles, update.Roles)
		removes := s.diffRoles(update.Roles, inputUser.Roles)
		log.Logger(ctx).Debug("ADD/REMOVE ROLES", log.DangerouslyZapSmallSlice("add", rolesToCheck), log.DangerouslyZapSmallSlice("remove", removes), log.DangerouslyZapSmallSlice("new", inputUser.Roles), log.DangerouslyZapSmallSlice("existings", update.Roles))
		rolesToCheck = append(rolesToCheck, removes...)
		if err := s.checkCanAssignRoles(ctx, rolesToCheck, roleCli); err != nil {
			log.Auditer(ctx).Error(
				fmt.Sprintf("Forbidden action: could not assign roles on [%s]", update.GetLogin()),
				log.GetAuditId(common.AuditUserUpdate),
				update.ZapUuid(),
			)
			return errors.Tag(err, errors.StatusForbidden)
		}
		// Check user own password change
		if inputUser.Password != "" && ctxLogin == inputUser.Login {
			if _, err := cli.BindUser(ctx, &idm.BindUserRequest{UserName: inputUser.Login, Password: inputUser.OldPassword}); err != nil {
				return errors.Tag(err, errors.StatusUnauthorized)
			}
		}
		// Load current ACLs for personal role
		for _, r := range update.Roles {
			if r.UserRole {
				var er error
				existingAcls, er = permissions.GetACLsForRoles(ctx, []*idm.Role{r}, &idm.ACLAction{Name: "parameter:*"})
				if er != nil {
					return er
				}
			}
		}
		// Put back the pydio: attributes
		if update.Attributes != nil {
			for k, v := range update.Attributes {
				if strings.HasPrefix(k, idm.UserAttrPrivatePrefix) {
					if inputUser.Attributes == nil {
						inputUser.Attributes = map[string]string{}
					}
					inputUser.Attributes[k] = v
				}
			}
		}
	}

	if update == nil && ctxClaims.Profile != common.PydioProfileAdmin {
		// Clear roles
		inputUser.Roles = nil
		// Check that parent group exists, or it will be created automatically (ok for admin, nok for others)
		if strings.Trim(inputUser.GroupPath, "/") != "" {
			if _, ok := permissions.GroupExists(ctx, inputUser.GroupPath); !ok {
				return errors.WithAPICode(errors.StatusForbidden, errors.ApiGroupCannotCreate)
			}
		}
		// Check current isHidden
		crtUser, e := permissions.SearchUniqueUser(ctx, ctxLogin, "")
		if e != nil {
			return errors.Tag(e, errors.StatusUnauthorized)
		}
		if crtUser.IsHidden() {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserCannotCreate)
		}

		// For creation by non-admin, check USER_CREATE_USERS plugins permission.
		if !inputUser.IsHidden() {
			global := config.Get(ctx, "frontend", "plugin", "core.auth", "USER_CREATE_USERS").Default(true).Bool()
			acl, e := permissions.AccessListFromContextClaims(ctx)
			if e != nil {
				return e
			}
			if er := permissions.AccessListLoadFrontValues(ctx, acl); er != nil {
				return e
			}
			local := acl.FlattenedFrontValues().Val("parameters", "core.auth", "USER_CREATE_USERS", permissions.FrontWsScopeAll).Default(global).Bool()
			if !local {
				return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserCannotCreate)
			}
		}
	}

	if inputUser.IsGroup {
		if ctxClaims.Profile != common.PydioProfileAdmin {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiGroupCannotCreate)
		}
		inputUser.GroupPath = strings.TrimSuffix(inputUser.GroupPath, "/") + "/" + inputUser.GroupLabel
	} else {
		// Add a default profile
		if value, ok := inputUser.Attributes[idm.UserAttrProfile]; !ok || value == "" {
			inputUser.Attributes[idm.UserAttrProfile] = common.PydioProfileShared
		}
		// Std users can only create shared ones, except for delegated admins
		// Double-check authorized access to /acl endpoint - if allowed, it's a delegated admin.
		if ctxClaims.Profile == common.PydioProfileStandard && inputUser.Attributes[idm.UserAttrProfile] != common.PydioProfileShared &&
			ctxLogin != inputUser.Login && !allowedUserSpecialPermissions(ctx, ctxClaims) {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserCannotCreateProfile)
		}
		// Generic check - profile is never higher than current user profile
		if profilesLevel[inputUser.Attributes[idm.UserAttrProfile]] > profilesLevel[ctxClaims.Profile] {
			return errors.WithAPICode(errors.StatusForbidden, errors.ApiUserCannotIncreaseProfile, "profile", inputUser.Attributes[idm.UserAttrProfile], "own", ctxClaims.Profile)
		}
		if _, ok := inputUser.Attributes[idm.UserAttrPassHashed]; ok {
			return errors.WithMessage(errors.StatusForbidden, "You are not allowed to use this attribute")
		}
	}

	var acls []*idm.ACL
	var deleteAclActions []string
	var sendEmail bool
	cleanAttributes := map[string]string{}
	for k, v := range inputUser.Attributes {
		if k == "send_email" {
			sendEmail = v == "true"
			continue
		}
		if strings.HasPrefix(k, "parameter:") {
			if !allowedAclKey(ctx, k, true) {
				continue
			}
			var acl = &idm.ACL{
				Action:      &idm.ACLAction{Name: k, Value: v},
				WorkspaceID: permissions.FrontWsScopeAll,
			}
			var sameValue bool
			for _, existing := range existingAcls {
				if existing.Action != nil && existing.Action.Name == k {
					if existing.Action.Value == v {
						sameValue = true
					} else {
						deleteAclActions = append(deleteAclActions, existing.Action.Name)
					}
				}
			}
			if !sameValue {
				acls = append(acls, acl)
			}
			continue
		}
		cleanAttributes[k] = v
	}
	inputUser.Attributes = cleanAttributes

	response, er := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: &inputUser,
	})
	if er != nil {
		return er
	}

	if update == nil {
		var newRole *idm.Role
		if inputUser.IsGroup {
			newRole = &idm.Role{
				Uuid:      response.User.Uuid,
				GroupRole: true,
				Label:     "Group " + response.User.GroupLabel,
			}
		} else {
			newRole = &idm.Role{
				Uuid:     response.User.Uuid,
				UserRole: true,
				Label:    "User " + response.User.Login,
				Policies: []*service2.ResourcePolicy{
					{Subject: "profile:standard", Action: service2.ResourcePolicyAction_READ, Effect: service2.ResourcePolicy_allow},
					{Subject: "user:" + response.User.Login, Action: service2.ResourcePolicyAction_WRITE, Effect: service2.ResourcePolicy_allow},
					{Subject: "profile:admin", Action: service2.ResourcePolicyAction_WRITE, Effect: service2.ResourcePolicy_allow},
				},
			}
		}
		roleCli := idmc.RoleServiceClient(ctx)
		if _, er := roleCli.CreateRole(ctx, &idm.CreateRoleRequest{Role: newRole}); er != nil {
			return er
		}
	}
	out := response.User
	path := "/"
	if len(out.GroupPath) > 1 {
		path = out.GroupPath + "/"
	}
	if update != nil {
		if out.IsGroup {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Updated group [%s]", out.GroupPath),
				log.GetAuditId(common.AuditGroupUpdate),
				out.ZapUuid(),
			)
		} else {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Updated user [%s%s]", path, out.Login),
				log.GetAuditId(common.AuditUserUpdate),
				out.ZapUuid(),
			)
		}
	} else {
		if out.IsGroup {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Created group [%s]", out.GroupPath),
				log.GetAuditId(common.AuditGroupCreate),
				out.ZapUuid(),
			)
		} else {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Created user [%s%s]", path, out.Login),
				log.GetAuditId(common.AuditUserCreate),
				out.ZapUuid(),
			)
		}
	}

	u := response.User

	if len(acls) > 0 {
		aclClient := idmc.ACLServiceClient(ctx) //idm.NewACLServiceClient(grpc2.ResolveConn(ctx, common.ServiceAcl))
		if len(deleteAclActions) > 0 {
			delQuery := &service2.Query{Operation: service2.OperationType_OR}
			for _, action := range deleteAclActions {
				q, _ := anypb.New(&idm.ACLSingleQuery{
					RoleIDs:      []string{u.Uuid},
					Actions:      []*idm.ACLAction{{Name: action}},
					WorkspaceIDs: []string{permissions.FrontWsScopeAll},
				})
				delQuery.SubQueries = append(delQuery.SubQueries, q)
			}
			if _, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: delQuery}); e != nil {
				log.Logger(ctx).Error("Could not delete existing ACLs", zap.Error(e))
			}
		}
		for _, acl := range acls {
			acl.RoleID = u.Uuid
			if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); e != nil {
				log.Logger(ctx).Error("Could not store ACL", acl.Zap(), zap.Error(e))
			}
		}
	}

	if !u.IsGroup {
		permissions.ForceClearUserCache(ctx, u.Login)
	}

	// Reload user fully
	q, _ := anypb.New(&idm.UserSingleQuery{Uuid: u.Uuid})
	streamer, err := cli.SearchUser(ctx, &idm.SearchUserRequest{
		Query: &service2.Query{SubQueries: []*anypb.Any{q}},
	})
	err = commons.ForEach(streamer, err, func(resp *idm.SearchUserResponse) error {
		var e error
		u = resp.User
		if !resp.User.IsGroup {
			if u.Roles, e = permissions.GetRolesForUser(ctx, u, false); e != nil {
				return e
			}
			u = u.WithPublicData(ctx, s.IsContextEditable(ctx, u.Uuid, u.Policies))
			if e = paramsAclsToAttributes(ctx, []*idm.User{u}); e != nil {
				return e
			}
		} else if len(u.Roles) == 0 {
			u.Roles = append(u.Roles, &idm.Role{Uuid: u.Uuid, GroupRole: true})
			if u.Roles, e = permissions.GetRolesForUser(ctx, u, true); e != nil {
				return e
			}
		}
		return nil
	})
	if err != nil {
		return err
	}
	we := rsp.WriteEntity(u)

	_, hasEmailAddress := u.Attributes["email"]
	if sendEmail && hasEmailAddress {
		// Now send email to user in background
		lang := ""
		if l, o := u.Attributes["parameter:core.conf:lang"]; o {
			lang = strings.Trim(l, `"`)
		}
		mailCli := mailer.NewMailerServiceClient(grpc2.ResolveConn(ctx, common.ServiceMailerGRPC))
		email := &mailer.Mail{
			To: []*mailer.User{{
				Uuid:     u.Uuid,
				Name:     u.Attributes["displayName"],
				Address:  u.Attributes["email"],
				Language: lang,
			}},
			TemplateId: "Welcome",
			TemplateData: map[string]string{
				"Login":    inputUser.Login,
				"Password": inputUser.Password,
			},
		}
		c := context.Background()
		if u := ctx.Value(common.PydioContextUserKey); u != nil {
			c = context.WithValue(c, common.PydioContextUserKey, u)
		}
		go func() {
			_, er := mailCli.SendMail(c, &mailer.SendMailRequest{
				InQueue: false,
				Mail:    email,
			})
			if er != nil {
				log.Logger(ctx).Error("Could not send email to new user", zap.Error(er))
			}
		}()
	}
	return we
}

// PutRoles updates an existing user with the passed list of roles.
func (s *UserHandler) PutRoles(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var inputUser idm.User
	err := req.ReadEntity(&inputUser)
	if err != nil {
		return err
	}
	log.Logger(ctx).Debug("Received User.PutRoles API request", inputUser.ZapLogin())

	if inputUser.Uuid == "" {
		return errors.WithMessage(errors.InvalidParameters, "Please provide a user ID")
	}
	cli := idmc.UserServiceClient(ctx)
	var update *idm.User
	var er error
	if update, er = s.userById(ctx, inputUser.Uuid, cli); er != nil {
		return er
	}

	// Check ADD/REMOVE Roles Policies
	roleCli := idmc.RoleServiceClient(ctx)
	rolesToCheck := s.diffRoles(inputUser.Roles, update.Roles)
	removes := s.diffRoles(update.Roles, inputUser.Roles)
	log.Logger(ctx).Debug("ADD/REMOVE ROLES", log.DangerouslyZapSmallSlice("add", rolesToCheck), log.DangerouslyZapSmallSlice("remove", removes), log.DangerouslyZapSmallSlice("new", inputUser.Roles), log.DangerouslyZapSmallSlice("existings", update.Roles))
	rolesToCheck = append(rolesToCheck, removes...)
	if err := s.checkCanAssignRoles(ctx, rolesToCheck, roleCli); err != nil {
		log.Auditer(ctx).Error(
			fmt.Sprintf("Forbidden action: could not assign roles to user [%s]", update.GetLogin()),
			log.GetAuditId(common.AuditUserUpdate),
			update.ZapUuid(),
		)
		return errors.Tag(errors.StatusForbidden, err)
	}

	// Save existing user with new set of roles
	update.Roles = inputUser.Roles

	response, er := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: update,
	})
	if er != nil {
		return er
	}

	u := response.User
	u.Roles = update.Roles
	log.Auditer(ctx).Info(
		fmt.Sprintf("Updated roles on user [%s]", response.User.GetLogin()),
		log.GetAuditId(common.AuditUserUpdate),
		response.User.ZapUuid(),
		zap.Int("Roles length", len(u.Roles)),
	)
	we := rsp.WriteEntity(u.WithPublicData(ctx, s.IsContextEditable(ctx, u.Uuid, u.Policies)))
	permissions.ForceClearUserCache(ctx, response.User.GetLogin())
	return we
}

// PoliciesForUserId retrieves policies for a given UserId.
func (s *UserHandler) PoliciesForUserId(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*service2.ResourcePolicy, e error) {

	user, err := s.userById(ctx, resourceId, resourceClient.(idm.UserServiceClient))
	if err != nil {
		return policies, err
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
	q, _ := anypb.New(&idm.RoleSingleQuery{Uuid: uuids})
	streamer, e := cli.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service2.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return e
	}
	defer streamer.CloseSend()
	for {
		rsp, e := streamer.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		if !s.MatchPolicies(ctx, rsp.Role.Uuid, rsp.Role.Policies, service2.ResourcePolicyAction_WRITE) {
			return errors.WithStack(errors.RoleNotAssignable)
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

// Loads an existing user by her UUID.
func (s *UserHandler) userById(ctx context.Context, userId string, cli idm.UserServiceClient) (*idm.User, error) {

	u, e := permissions.SearchUniqueUser(ctx, "", userId)
	if e != nil {
		return nil, e
	}
	if u.Roles, e = permissions.GetRolesForUser(ctx, u, false); e != nil {
		return nil, e
	}
	return u, nil

}

// paramsAclsToAttributes adds some acl-based parameters inside user attributes.
func paramsAclsToAttributes(ctx context.Context, users []*idm.User) error {
	var roles []*idm.Role
	for _, user := range users {
		var role *idm.Role
		for _, r := range user.Roles {
			if r.UserRole {
				role = r
				break
			}
		}
		if role != nil {
			if user.Attributes == nil {
				user.Attributes = map[string]string{}
			}
			roles = append(roles, role)
		}
	}
	if len(roles) == 0 {
		return nil
	}
	aa, er := permissions.GetACLsForRoles(ctx, roles, &idm.ACLAction{Name: "parameter:*"})
	if er != nil {
		return er
	}
	for _, acl := range aa {
		for _, user := range users {
			if allowedAclKey(ctx, acl.Action.Name, user.PoliciesContextEditable) && user.Uuid == acl.RoleID {
				user.Attributes[acl.Action.Name] = acl.Action.Value
			}
		}
	}
	return nil
}

var paramsCacheConfig = cache.Config{
	Eviction:    "24h",
	CleanWindow: "24h",
}

func allowedAclKey(ctx context.Context, k string, contextEditable bool) bool {
	var params []*front.ExposedParameter
	ca := cache_helper.MustResolveCache(ctx, "short", paramsCacheConfig)
	if !ca.Get("params", &params) {
		mC := front.NewManifestServiceClient(grpc2.ResolveConn(ctx, common.ServiceFrontStaticsGRPC))
		resp, e := mC.ExposedParameters(ctx, &front.ExposedParametersRequest{
			Scope:   "user",
			Exposed: true,
		})
		if e != nil {
			log.Logger(ctx).Error("Cannot read plugins pool", zap.Error(e))
			return false
		}
		params = resp.Parameters
		_ = ca.Set("params", resp.Parameters)
	}

	// Find params that contain user scope but not only that scope
	for _, param := range params {
		if param.Scope == "user" {
			continue
		}
		if !contextEditable && k != "parameter:core.conf:lang" && k != "parameter:core.conf:country" {
			continue
		}
		if k == "parameter:"+param.PluginId+":"+param.Name {
			return true
		}
	}
	return false
}

func allowedUserSpecialPermissions(ctx context.Context, claims claim.Claims) bool {
	subjects := permissions.PolicyRequestSubjectsFromClaims(claims)
	client := idm.NewPolicyEngineServiceClient(grpc2.ResolveConn(ctx, common.ServicePolicyGRPC))
	request := &idm.PolicyEngineRequest{
		Subjects: subjects,
		Resource: "rest:/acl",
		Action:   "PUT",
	}
	resp, _ := client.IsAllowed(ctx, request)
	if resp == nil {
		return false
	}
	return resp.GetAllowed()
}
