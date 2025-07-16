/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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

package modifiers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/service/frontend"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

// LoginSuccessWrapper wraps functionalities after user was successfully logged in
func LoginSuccessWrapper(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" && a != "authorization_code" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}
		// BEFORE MIDDLEWARE

		// MIDDLEWARE
		err := middleware(req, rsp, in, out, session)
		if err != nil {
			return err
		}

		// AFTER MIDDLEWARE

		// retrieving user
		username, ok := in.AuthInfo["login"]
		if !ok {
			return errors.WithMessage(errors.StatusBadRequest, "missing user id") // serviceerrors.New("user.not_found", "User id not found", http.StatusNotFound)
		}

		ctx := req.Request.Context()

		// Searching user for attributes
		user, err := permissions.SearchUniqueUser(ctx, username, "")
		if err != nil {
			return err
		}

		// If user is "hidden", he is not allowed to log on the main interface
		if user.Attributes != nil {
			_, mini := session.Values["minisite"]
			if user.IsHidden() && !mini {
				log.Auditer(ctx).Error(
					"Hidden user ["+user.Login+"] tried to log in on main interface",
					log.GetAuditId(common.AuditLoginPolicyDenial),
					zap.String(common.KeyUserUuid, user.Uuid),
				)
				log.Logger(ctx).Error("Denied login for hidden user " + user.Login + " on main interface")
				return errors.WithStack(errors.LoginNotAllowed) // serviceerrors.Unauthorized("hidden.user.nominisite", "You are not allowed to log in to this interface")
			}
		}

		// Checking user is locked
		if permissions.IsUserLocked(user) {
			log.Auditer(ctx).Error(
				"Locked user ["+user.Login+"] tried to log in.",
				log.GetAuditId(common.AuditLoginPolicyDenial),
				zap.String(common.KeyUserUuid, user.Uuid),
			)
			log.Logger(ctx).Error("lock denies login for "+user.Login, zap.Error(errors.New("blocked login")))
			return errors.WithAPICode(errors.UserLocked, errors.ApiUserLocked, "login", user.Login)
		}

		// Reset failed connections
		if user.Attributes != nil {
			if _, ok := user.Attributes["failedConnections"]; ok {
				log.Logger(ctx).Info("[WrapWithUserLocks] Resetting user failedConnections", user.ZapLogin())
				userClient := idm.NewUserServiceClient(grpc.ResolveConn(ctx, common.ServiceUserGRPC))
				delete(user.Attributes, "failedConnections")
				userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user})
			}
		}

		// Checking policies
		cli := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
		policyContext := make(map[string]string)
		permissions.PolicyContextFromMetadata(policyContext, ctx)
		subjects := permissions.PolicyRequestSubjectsFromUser(ctx, user, false)

		// Check all subjects, if one has deny return false
		policyRequest := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "oidc",
			Action:   "login",
			Context:  policyContext,
		}

		if resp, err := cli.IsAllowed(ctx, policyRequest); err != nil || !resp.Allowed {
			log.Auditer(ctx).Error(
				"Policy denied login to ["+user.Login+"]",
				log.GetAuditId(common.AuditLoginPolicyDenial),
				zap.String(common.KeyUserUuid, user.Uuid),
				zap.Any(common.KeyPolicyRequest, policyRequest),
				zap.Error(err),
			)
			log.Logger(ctx).Error("policy denies login for request", zap.Any(common.KeyPolicyRequest, policyRequest), zap.Error(err))
			return errors.WithStack(errors.LoginNotAllowed) // serviceerrors.Unauthorized(common.ServiceUser, "User "+user.Login+" is not authorized to log in")
		}

		if lang, ok := in.AuthInfo["lang"]; ok {
			if _, o := languages.AvailableLanguages[lang]; o {
				aclClient := idm.NewACLServiceClient(grpc.ResolveConn(ctx, common.ServiceAclGRPC))
				// Remove previous value if any
				delQ, _ := anypb.New(&idm.ACLSingleQuery{
					RoleIDs:      []string{user.GetUuid()},
					Actions:      []*idm.ACLAction{{Name: "parameter:core.conf:lang"}},
					WorkspaceIDs: []string{"PYDIO_REPO_SCOPE_ALL"},
				})
				send, can := context.WithTimeout(ctx, 500*time.Millisecond)
				defer can()
				_, _ = aclClient.DeleteACL(send, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{delQ}}})
				// Insert new ACL with language value
				_, e := aclClient.CreateACL(send, &idm.CreateACLRequest{ACL: &idm.ACL{
					Action:      &idm.ACLAction{Name: "parameter:core.conf:lang", Value: lang},
					RoleID:      user.GetUuid(),
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				}})
				if e != nil {
					log.Logger(ctx).Error("Cannot update language for user", user.ZapLogin(), zap.String("lang", lang), zap.Error(e))
				} else {
					log.Logger(ctx).Info("Updated language for "+user.GetLogin()+" to "+lang, user.ZapLogin(), zap.String("lang", lang))
				}
			}
		}

		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_LOGIN,
			User: user,
		})

		return nil
	}
}

// LoginFailedWrapper wraps functionalities after user failed to log in
func LoginFailedWrapper(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *frontend.FrontSessionWithRuntimeCtx, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" && a != "external" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		// MIDDLEWARE
		err := middleware(req, rsp, in, out, session)
		if err == nil || errors.Is(err, errors.UserNotFound) {
			return err
		}

		ctx := req.Request.Context()
		ctx, span := tracing.StartLocalSpan(ctx, "Middleware:LoginFailedWrapper")
		defer span.End()

		username := in.AuthInfo["login"]

		const maxFailedLogins = 10

		// Searching user for attributes
		user, _ := permissions.SearchUniqueUser(ctx, username, "")
		if user == nil {
			return err // errors.New("login.failed", "Login failed", http.StatusUnauthorized)
		}

		// double check if user was already locked to reduce work load
		if permissions.IsUserLocked(user) {
			msg := fmt.Sprintf("locked user %s is still trying to connect", user.GetLogin())
			log.Logger(ctx).Warn(msg, user.ZapLogin())
			return errors.WithAPICode(errors.Tag(err, errors.UserLocked), errors.ApiUserLocked, "login", user.Login)
		}

		var failedInt int64
		if user.Attributes == nil {
			user.Attributes = make(map[string]string)
		}
		if failed, ok := user.Attributes["failedConnections"]; ok {
			failedInt, _ = strconv.ParseInt(failed, 10, 32)
		}
		failedInt++
		user.Attributes["failedConnections"] = fmt.Sprintf("%d", failedInt)
		hardLock := false

		if failedInt >= maxFailedLogins {
			// Set lock via attributes
			var locks []string
			if l, ok := user.Attributes["locks"]; ok {
				var existingLocks []string
				if e := json.Unmarshal([]byte(l), &existingLocks); e == nil {
					for _, lock := range existingLocks {
						if lock != "logout" {
							locks = append(locks, lock)
						}
					}
				}
			}
			locks = append(locks, "logout")
			data, _ := json.Marshal(locks)
			user.Attributes["locks"] = string(data)
			msg := fmt.Sprintf("Locked user [%s] after %d failed connections", user.GetLogin(), maxFailedLogins)
			log.Logger(ctx).Error(msg, user.ZapLogin())
			log.Auditer(ctx).Error(
				msg,
				log.GetAuditId(common.AuditLockUser),
				user.ZapLogin(),
				zap.String(common.KeyUserUuid, user.GetUuid()),
			)
			hardLock = true
		}

		log.Logger(ctx).Debug(fmt.Sprintf("[WrapWithUserLocks] Updating failed connection number for user [%s]", user.GetLogin()), user.ZapLogin())
		userClient := idm.NewUserServiceClient(grpc.ResolveConn(ctx, common.ServiceUserGRPC))
		if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user}); e != nil {
			log.Logger(ctx).Error("could not store failedConnection for user", zap.Error(e))
		}

		// Replacing error not to give any hint
		if hardLock {
			return errors.WithStack(errors.LoginNotAllowed) // serviceerrors.New("user.locked", "User is locked - Please contact your admin", http.StatusUnauthorized)
		} else {
			return errors.Tag(err, errors.StatusUnauthorized) // serviceerrors.New("login.failed", "Login failed", http.StatusUnauthorized)
		}
	}
}
