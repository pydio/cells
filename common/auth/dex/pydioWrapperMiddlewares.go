package dex

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/coreos/dex/connector"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils"
)

// WrapperConnectorOperation holds all necessary information to perform auth actions using the middleware pattern.
type WrapperConnectorOperation struct {
	OperationType string
	Scopes        connector.Scopes
	Login         string
	Password      string
	LoginError    bool

	ValidUsername string
	AuthSource    string
	User          *idm.User
	Identity      connector.Identity
}

type WrapperConnectorProvider func(ctx context.Context, in *WrapperConnectorOperation) (*WrapperConnectorOperation, error)
type WrapperConnectorMiddleware func(wrapperConnector WrapperConnectorProvider) WrapperConnectorProvider

var (
	wrapperMiddlewares = make(map[string][]WrapperConnectorMiddleware)
)

// RegisterWrapperConnectorMiddleware appends a new connector middleware to the array of already existing middleware for this operation.
func RegisterWrapperConnectorMiddleware(operation string, middleware WrapperConnectorMiddleware) {
	wrapperMiddlewares[operation] = append(wrapperMiddlewares[operation], middleware)
}

// ApplyWrapperConnectorMiddlewares effectively calls each middleware that have been registered for this operation.
func ApplyWrapperConnectorMiddlewares(ctx context.Context, in *WrapperConnectorOperation, coreProvider WrapperConnectorProvider) (*WrapperConnectorOperation, error) {
	var p WrapperConnectorProvider
	if coreProvider == nil {
		p = func(ctx context.Context, in *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {
			return in, nil
		}
	} else {
		p = coreProvider
	}
	if middlewares, ok := wrapperMiddlewares[in.OperationType]; ok {
		for _, m := range middlewares {
			p = m(p)
		}
	}
	return p(ctx, in)
}

// WrapWithIdmUser retrieves an IDM user with her login and adds it to the current operation.
func WrapWithIdmUser(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

		var e error
		op, e = middleware(ctx, op)
		if e != nil {
			return op, e
		}
		if op.ValidUsername != "" {
			u, er := utils.SearchUniqueUser(ctx, op.ValidUsername, "")
			if e != nil {
				return op, er
			}
			op.User = u
			return op, nil
		}
		return op, e
	}
}

// WrapWithPolicyCheck checks policies for the current user and updates passed operation.
func WrapWithPolicyCheck(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

		var e error
		op, e = middleware(ctx, op)
		if e != nil || op.User == nil {
			return op, e
		}
		user := op.User
		cli := idm.NewPolicyEngineServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, defaults.NewClient())
		policyContext := make(map[string]string)
		utils.PolicyContextFromMetadata(policyContext, ctx)
		subjects := utils.PolicyRequestSubjectsFromUser(user)

		// Check all subjects, if one has deny return false
		policyRequest := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "oidc",
			Action:   "login",
			Context:  policyContext,
		}
		if resp, err := cli.IsAllowed(ctx, policyRequest); err != nil || resp.Allowed == false {
			log.Auditer(ctx).Error(
				"Policy denied login to ["+user.Login+"]",
				log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
				zap.String(common.KEY_USER_UUID, user.Uuid),
				zap.Any(common.KEY_POLICY_REQUEST, policyRequest),
				zap.Error(err),
			)
			log.Logger(ctx).Error("policy denies login for request", zap.Any(common.KEY_POLICY_REQUEST, policyRequest), zap.Error(err))
			return op, errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" is not authorized to log in")
		}

		return op, nil
	}
}

// WrapWithUserLocks manages lock after too many fail attemps. It also reset the counter on login success.
func WrapWithUserLocks(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

		var opE error
		op, opE = middleware(ctx, op)

		// User loaded - Additional checks *even* after successful login
		if user := op.User; user != nil {

			// Insure user has not been locked out
			if utils.IsUserLocked(user) {
				log.Auditer(ctx).Error(
					"Locked user ["+user.Login+"] tried to log in.",
					log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
					zap.String(common.KEY_USER_UUID, user.Uuid),
				)
				log.Logger(ctx).Error("lock denies login for "+user.Login, zap.Error(fmt.Errorf("blocked login")))
				return op, errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" has been blocked. Contact your sysadmin.")
			}

			// Reset failed connections
			if user.Attributes != nil {
				if _, ok := user.Attributes["failedConnections"]; ok {
					log.Logger(ctx).Info("[WrapWithUserLocks] Resetting user failedConnections", user.ZapLogin())
					userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
					delete(user.Attributes, "failedConnections")
					userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user})
				}
			}
		}

		// Failed login - increment failed attemps
		if opE != nil && op.LoginError {

			const maxFailedLogins = 10

			if u, e := utils.SearchUniqueUser(ctx, op.Login, ""); e == nil && u != nil {

				// double check if user was already locked to reduce work load
				if utils.IsUserLocked(u) {
					msg := fmt.Sprintf("locked user %s is still trying to connect", u.GetLogin())
					log.Logger(ctx).Warn(msg, u.ZapLogin())
					return op, opE
				}

				var failedInt int64
				if u.Attributes == nil {
					u.Attributes = make(map[string]string)
				}
				if failed, ok := u.Attributes["failedConnections"]; ok {
					failedInt, _ = strconv.ParseInt(failed, 10, 32)
				}
				failedInt++
				u.Attributes["failedConnections"] = fmt.Sprintf("%d", failedInt)

				if failedInt >= maxFailedLogins {
					// Set lock via attributes
					var locks []string
					if l, ok := u.Attributes["locks"]; ok {
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
					u.Attributes["locks"] = string(data)
					msg := fmt.Sprintf("Locked user [%s] after %d failed connections", u.GetLogin(), maxFailedLogins)
					log.Logger(ctx).Error(msg, u.ZapLogin())
					log.Auditer(ctx).Error(
						msg,
						log.GetAuditId(common.AUDIT_LOCK_USER),
						u.ZapLogin(),
						zap.String(common.KEY_USER_UUID, u.GetUuid()),
					)
				}

				log.Logger(ctx).Debug(fmt.Sprintf("[WrapWithUserLocks] Updating failed connection number for user [%s]", u.GetLogin()), u.ZapLogin())
				userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
				if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
					log.Logger(ctx).Error("could not store failedConnection for user", zap.Error(e))
				}
			}
		}
		return op, opE
	}
}

// WrapWithIdentity converts the op.User to an identity and stores it in the current operation.
func WrapWithIdentity(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

		if op.OperationType == "Refresh" && op.Identity.Username != "" {
			op.ValidUsername = op.Identity.Username
		}

		var e error
		op, e = middleware(ctx, op)
		log.Logger(ctx).Debug("[WrapWithIdentity]", zap.Any("op", op), zap.Error(e))
		if e != nil || op.User == nil {
			return op, e
		}

		op.Identity = ConvertUserApiToIdentity(op.User, op.AuthSource)
		return op, nil
	}
}
