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

	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// CheckOIDCPolicies builds a local policies checker by loading "oidc"-resource policies and putting them in
// an in-memory ladon.Manager. It reloads policies every 1mn.
func checkOIDCPolicies(ctx context.Context, user *idm.User) error {

	subjects := permissions.PolicyRequestSubjectsFromUser(ctx, user, false)
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
		if er := checker.IsAllowed(request); er != nil && errors.Is(er, ladon.ErrRequestForcefullyDenied) {
			break
		} else if er == nil {
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

		claims, ok := claim.FromContext(ctx)
		if !ok {
			return subjects, errors.WithStack(errors.MissingClaims)
		}
		if claims.Profile != common.PydioProfileAdmin {
			return subjects, errors.WithMessage(errors.StatusForbidden, "only admin profiles can list resources with ANY or NONE filter")
		}
		return subjects, nil

	case rest.ResourcePolicyQuery_CONTEXT:

		subjects = append(subjects, "*")
		if claims, ok := claim.FromContext(ctx); ok {
			subjects = append(subjects, permissions.PolicyRequestSubjectsFromClaims(ctx, claims, true)...)
		} else if uName := claim.UserNameFromContext(ctx); uName != "" {
			if uName == common.PydioSystemUsername {
				subjects = append(subjects, permissions.PolicySubjectProfilePrefix+common.PydioProfileAdmin)
			} else if u, e := permissions.SearchUniqueUser(ctx, uName, ""); e == nil {
				subjects = append(subjects, permissions.PolicyRequestSubjectsFromUser(ctx, u, true)...)
			} else {
				if !errors.Is(e, errors.UserNotFound) {
					log.Logger(ctx).Warn("[policies] Cannot find user '"+uName+"' although in context", zap.Error(e))
				}
				return nil, e
			}
		} else {
			log.Logger(ctx).Error("Cannot find claims in context, using anon profile", zap.Any("c", ctx))
			subjects = append(subjects, permissions.PolicySubjectProfilePrefix+common.PydioProfileAnon)
		}

	case rest.ResourcePolicyQuery_USER:

		if q.UserId == "" {
			return subjects, errors.WithMessage(errors.StatusBadRequest, "resources", "Please provide a non-empty user id")
		}
		claims, ok := claim.FromContext(ctx)
		if !ok {
			return subjects, errors.WithStack(errors.MissingClaims)
		}
		if claims.Profile != common.PydioProfileAdmin {
			return subjects, errors.WithMessage(errors.StatusForbidden, "resources", "Only admin profiles can list resources of other users")
		}
		subjects = append(subjects, "*")
		if user, err := permissions.SearchUniqueUser(ctx, "", q.UserId); err != nil {
			return subjects, errors.WithMessage(errors.StatusBadRequest, "resources", "Cannot find user with id "+q.UserId+", error was "+err.Error())
		} else {
			subjects = append(subjects, permissions.PolicyRequestSubjectsFromUser(ctx, user, false)...)
		}
	}
	return
}
