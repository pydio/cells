/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package auth

import (
	"context"
	"fmt"
	"strings"

	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

// CheckOIDCPolicies builds a local policies checker by loading "oidc"-resource policies and putting them in
// an in-memory ladon.Manager. It reloads policies every 1mn.
func checkOIDCPolicies(ctx context.Context, user *idm.User) error {

	subjects := permissions.PolicyRequestSubjectsFromUser(user)
	policyContext := make(map[string]string)
	permissions.PolicyContextFromMetadata(policyContext, ctx)

	checker, err := permissions.CachedPoliciesChecker(ctx, "oidc", policyContext)
	if err != nil {
		return err
	}
	if checker == nil {
		log.Logger(ctx).Warn("Policies checker is not yet ready - Ignoring")
		return nil
	}
	reqCtx := ladon.Context{}
	for k, v := range policyContext {
		reqCtx[k] = v
	}
	// check that at least one of the subject is allowed
	var allow bool
	for _, subject := range subjects {
		request := &ladon.Request{
			Resource: "oidc",
			Subject:  subject,
			Action:   "login",
			Context:  reqCtx,
		}
		if err := checker.IsAllowed(request); err != nil && err == ladon.ErrRequestForcefullyDenied {
			break
		} else if err == nil {
			allow = true
		} // Else "default deny" => continue checking
	}

	if !allow {
		return fmt.Errorf("access denied by oidc policy denies access")
	}

	return nil

}

// SubjectsForResourcePolicyQuery prepares a slice of strings that will be used to check for resource ownership.
// Can be extracted either from context or by loading a given user ID from database.
func SubjectsForResourcePolicyQuery(ctx context.Context, q *rest.ResourcePolicyQuery) (subjects []string, err error) {

	if q == nil {
		q = &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT}
	}

	switch q.Type {
	case rest.ResourcePolicyQuery_ANY, rest.ResourcePolicyQuery_NONE:

		var value interface{}
		if value = ctx.Value(claim.ContextKey); value == nil {
			return subjects, errors.BadRequest("resources", "Only admin profiles can list resources of other users")
		}
		claims := value.(claim.Claims)
		if claims.Profile != common.PydioProfileAdmin {
			return subjects, errors.Forbidden("resources", "Only admin profiles can list resources with ANY or NONE filter")
		}
		return subjects, nil

	case rest.ResourcePolicyQuery_CONTEXT:

		subjects = append(subjects, "*")
		if value := ctx.Value(claim.ContextKey); value != nil {
			claims := value.(claim.Claims)
			subjects = append(subjects, SubjectsFromClaim(claims)...)
		} else if uName, _ := permissions.FindUserNameInContext(ctx); uName != "" {
			if uName == common.PydioSystemUsername {
				subjects = append(subjects, "profile:"+common.PydioProfileAdmin)
			} else if u, e := permissions.SearchUniqueUser(ctx, uName, ""); e == nil {
				subjects = append(subjects, "user:"+u.Login)
				for _, p := range common.PydioUserProfiles {
					subjects = append(subjects, "profile:"+p)
					if p == u.Attributes[idm.UserAttrProfile] {
						break
					}
				}
				for _, r := range u.Roles {
					subjects = append(subjects, "role:"+r.Uuid)
				}
			} else {
				if errors.FromError(e).Code != 404 {
					log.Logger(ctx).Warn("[policies] Cannot find user '"+uName+"' although in context", zap.Error(e))
				}
			}
		} else {
			log.Logger(ctx).Error("Cannot find claims in context", zap.Any("c", ctx))
			subjects = append(subjects, "profile:anon")
		}

	case rest.ResourcePolicyQuery_USER:

		if q.UserId == "" {
			return subjects, errors.BadRequest("resources", "Please provide a non-empty user id")
		}
		var value interface{}
		if value = ctx.Value(claim.ContextKey); value == nil {
			return subjects, errors.BadRequest("resources", "Only admin profiles can list resources of other users")
		}
		claims := value.(claim.Claims)
		if claims.Profile != common.PydioProfileAdmin {
			return subjects, errors.Forbidden("resources", "Only admin profiles can list resources of other users")
		}
		subjects = append(subjects, "*")
		if user, err := permissions.SearchUniqueUser(ctx, "", q.UserId); err != nil {
			return subjects, errors.BadRequest("resources", "Cannot find user with id "+q.UserId+", error was "+err.Error())
		} else {
			for _, role := range user.Roles {
				subjects = append(subjects, "role:"+role.Uuid)
			}
			subjects = append(subjects, "user:"+user.Login)
			subjects = append(subjects, "profile:"+user.Attributes[idm.UserAttrProfile])
		}
	}
	return
}

// SubjectsFromClaim builds a list of subjects based on Claim attributes.
func SubjectsFromClaim(claim claim.Claims) (subjects []string) {
	subjects = append(subjects, "user:"+claim.Name)
	// Add all profiles up to the current one (e.g admin will check for anon, shared, standard, admin)
	for _, p := range common.PydioUserProfiles {
		subjects = append(subjects, "profile:"+p)
		if p == claim.Profile {
			break
		}
	}
	//subjects = append(subjects, "profile:"+claims.Profile)
	for _, r := range strings.Split(claim.Roles, ",") {
		subjects = append(subjects, "role:"+r)
	}
	return
}
