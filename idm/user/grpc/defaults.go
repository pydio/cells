package grpc

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/user"
)

const (
	EnvPydioAdminUserLogin    = "PYDIO_ADMIN_USER_LOGIN"
	EnvPydioAdminUserPassword = "PYDIO_ADMIN_USER_PASSWORD"
)

func InitDefaults(ctx context.Context) error {
	var login, pwd string

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return err
	}

	var cfg config.Store
	if !propagator.Get(ctx, config.ContextKey, &cfg) {
		return fmt.Errorf("no config")
	}

	if os.Getenv(EnvPydioAdminUserLogin) != "" && os.Getenv(EnvPydioAdminUserPassword) != "" {
		login = os.Getenv(EnvPydioAdminUserLogin)
		pwd = os.Getenv(EnvPydioAdminUserPassword)
	}

	if rootConfig := cfg.Val("defaults", "root").String(); rootConfig != "" {
		sDec, _ := base64.StdEncoding.DecodeString(rootConfig)
		parts := strings.Split(string(sDec), "||||")
		login = parts[0]
		pwd = parts[1]
		// Now remove from configs
		_ = cfg.Val("defaults", "root").Del()
		if err := cfg.Save("cli", "First Run / Creating default root user"); err != nil {
			return err
		}
	}

	if login != "" && pwd != "" {
		// Check if user exists
		newUser, err := CreateIfNotExists(ctx, dao, &idm.User{
			Login:      login,
			Password:   pwd,
			Attributes: map[string]string{idm.UserAttrProfile: common.PydioProfileAdmin},
		})
		if err != nil {
			return err
		} else if newUser != nil {
			builder := permissions.NewResourcePoliciesBuilder()
			builder = builder.WithProfileRead(common.PydioProfileStandard)
			builder = builder.WithSubjectWrite(newUser.GetUuid())
			builder = builder.WithProfileWrite(common.PydioProfileAdmin)
			if _, err := dao.AddPolicies(ctx, false, newUser.Uuid, builder.Policies()); err != nil {
				return err
			}
			// Create user role
			roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(ctx, common.ServiceRoleGRPC))
			if _, err := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
				Uuid:     newUser.Uuid,
				Label:    newUser.Login + " role",
				UserRole: true,
				Policies: builder.Policies(),
			}}); err != nil {
				return err
			}
			log.Logger(ctx).Info("Initialization: created admin user '" + login + "' and its associated role")
		}
	}

	newAnon, err := CreateIfNotExists(ctx, dao, &idm.User{
		Login:      common.PydioS3AnonUsername,
		Password:   common.PydioS3AnonUsername,
		Attributes: map[string]string{"profile": common.PydioProfileAnon},
	})
	if err != nil {
		return err
	}

	if newAnon != nil {
		builder := permissions.NewResourcePoliciesBuilder()
		builder = builder.WithSubjectRead(newAnon.GetUuid())
		builder = builder.WithProfileRead(common.PydioProfileAdmin)
		builder = builder.WithProfileWrite(common.PydioProfileAdmin)
		if _, err := dao.AddPolicies(ctx, false, newAnon.GetUuid(), builder.Policies()); err != nil {
			return err
		}
		// Create user role
		roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(ctx, common.ServiceRoleGRPC))
		if _, err := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
			Uuid:     newAnon.Uuid,
			Label:    newAnon.Login + " role",
			UserRole: true,
			Policies: builder.Policies(),
		}}); err != nil {
			return err
		}
		log.Logger(ctx).Info("Initialization: created s3 anonymous user and its associated role...")
	}

	return nil
}

// CreateIfNotExists creates a user if DAO.Bind() call returns a 404 error.
func CreateIfNotExists(ctx context.Context, dao user.DAO, user *idm.User) (*idm.User, error) {
	if _, err := dao.Bind(ctx, user.Login, user.Password); !errors.Is(err, errors.StatusNotFound) {
		return nil, err
	} else if err == nil {
		log.Logger(ctx).Info("Skipping user " + user.Login + ", already exists")
		return nil, nil
	}
	// User is not created yet, add it now
	out, _, err := dao.Add(ctx, user)
	if err != nil {
		return nil, err
	}
	return out.(*idm.User), nil
}
