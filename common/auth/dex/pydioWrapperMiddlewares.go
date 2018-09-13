package dex

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/coreos/dex/connector"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"time"

	"strconv"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
)

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

	Attempts *auth.ConnectionAttempt
}
type WrapperConnectorProvider func(ctx context.Context, in *WrapperConnectorOperation) (*WrapperConnectorOperation, error)
type WrapperConnectorMiddleware func(wrapperConnector WrapperConnectorProvider) WrapperConnectorProvider

var (
	wrapperMiddlewares = make(map[string][]WrapperConnectorMiddleware)
)

func RegisterWrapperConnectorMiddleware(operation string, middleware WrapperConnectorMiddleware) {
	wrapperMiddlewares[operation] = append(wrapperMiddlewares[operation], middleware)
}

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
			} else {
				op.User = u
				return op, nil
			}
		}

		return op, e

	}
}

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
				"policy denies login to "+user.Login,
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

func WrapWithUserLocks(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

		var opE error
		op, opE = middleware(ctx, op)

		// User loaded - Additional checks *even* if successful login
		if op.User != nil {
			var hasLock bool
			user := op.User
			if user.Attributes != nil {
				if l, ok := user.Attributes["locks"]; ok {
					var locks []string
					if e := json.Unmarshal([]byte(l), &locks); e == nil {
						for _, lock := range locks {
							if lock == "logout" {
								hasLock = true
								break
							}
						}
					}
				}
			}
			if hasLock {
				e := fmt.Errorf("user " + user.Login + " has locked out attribute")
				log.Auditer(ctx).Error(
					e.Error(),
					log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
					zap.String(common.KEY_USER_UUID, user.Uuid),
					zap.Error(fmt.Errorf("user has logout attribute")),
				)
				log.Logger(ctx).Error("lock denies login for request", zap.Error(e))
				return op, errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" is not authorized to log in")
			}
			// Reset failedConnections now
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
					log.Logger(ctx).Error("Setting lock on user as there were too many failed connections", u.ZapLogin())
				}
				log.Logger(ctx).Info("[WrapWithUserLocks] Updating user failedConnections", u.ZapLogin())
				userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
				if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
					log.Logger(ctx).Error("could not store failedConnection for user", zap.Error(e))
				}
			}

		}

		return op, opE

	}

}

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

func WrapWithIPBan(middleware WrapperConnectorProvider) WrapperConnectorProvider {

	return func(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {
		if op.OperationType != "Login" {
			return middleware(ctx, op)
		}

		// BEFORE MIDDLEWARE
		md, _ := metadata.FromContext(ctx)
		cli := auth.NewAuthTokenRevokerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, defaults.NewClient())
		if address, ok := md[servicecontext.HttpMetaRemoteAddress]; ok {
			op.Attempts = &auth.ConnectionAttempt{IP: address, ConnectionTime: time.Now().Unix()}
			if resp, e := cli.IsBanned(ctx, op.Attempts); e == nil {
				if resp.IsBanned {
					log.Auditer(ctx).Error("IP Address is banned: "+address, log.GetAuditId(common.AUDIT_LOGIN_FAILED), zap.String(common.KEY_USERNAME, op.Login))
					log.Logger(ctx).Error("IP address is banned", zap.String("ip", address))
					return op, errors.Unauthorized(common.SERVICE_AUTH, "ip address is banned, please retry later")
				}
			}
		}
		var e error
		op, e = middleware(ctx, op)

		// AFTER MIDDLEWARE
		if op.Attempts != nil {
			if e != nil && op.LoginError {
				op.Attempts.IsSuccess = false
			} else {
				op.Attempts.IsSuccess = true
			}
			log.Logger(ctx).Info("[WrapWithIPBan] Updating IP attempts", zap.Any("attempts", op.Attempts))
			if _, e := cli.StoreFailedConnection(ctx, op.Attempts); e != nil {
				log.Logger(ctx).Error("Oops, could not update connection attempts", zap.Error(e))
			}
		}
		return op, e
	}
}
