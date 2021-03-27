package auth

import (
	"context"
	"fmt"
	"strings"

	"github.com/micro/go-micro/errors"
	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/utils/permissions"
)

// CheckOIDCPolicies builds a local policies checker by loading "oidc"-resource policies and putting them in
// an in-memory ladon.Manager. It reloads policies every 1mn.
func checkOIDCPolicies(ctx context.Context, user *idm.User) error {

	subjects := permissions.PolicyRequestSubjectsFromUser(user)
	policyContext := make(map[string]string)
	permissions.PolicyContextFromMetadata(policyContext, ctx)

	checker, err := permissions.CachedPoliciesChecker(ctx, "oidc")
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
			subjects = append(subjects, "user:"+claims.Name)
			// Add all profiles up to the current one (e.g admin will check for anon, shared, standard, admin)
			for _, p := range common.PydioUserProfiles {
				subjects = append(subjects, "profile:"+p)
				if p == claims.Profile {
					break
				}
			}
			//subjects = append(subjects, "profile:"+claims.Profile)
			for _, r := range strings.Split(claims.Roles, ",") {
				subjects = append(subjects, "role:"+r)
			}
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
					subjects = append(subjects, r.Uuid)
				}
			} else {
				log.Logger(ctx).Warn("[policies] Cannot find user "+uName+", although in context (maybe deleted?)", zap.Error(e))
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
