package grpc

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/idm/user"
)

const (
	EnvPydioAdminUserLogin    = "PYDIO_ADMIN_USER_LOGIN"
	EnvPydioAdminUserPassword = "PYDIO_ADMIN_USER_PASSWORD"
)

func InitDefaults(ctx context.Context) error {
	var login, pwd string

	var cfg config.Store

	dao, err := manager.Resolve[user.DAO](ctx)
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
		cfg.Val("defaults", "root").Del()
		if err := cfg.Save("cli", "First Run / Creating default root user"); err != nil {
			return err
		}
	}

	if login != "" && pwd != "" {
		log.Logger(ctx).Info("Initialization: creating admin user: " + login)
		// Check if user exists
		newUser, err := CreateIfNotExists(ctx, dao, &idm.User{
			Login:      login,
			Password:   pwd,
			Attributes: map[string]string{"profile": common.PydioProfileAdmin},
		})
		if err != nil {
			return err
		} else if newUser != nil {
			builder := service2.NewResourcePoliciesBuilder()
			builder = builder.WithProfileRead(common.PydioProfileStandard)
			builder = builder.WithUserWrite(login)
			builder = builder.WithProfileWrite(common.PydioProfileAdmin)
			if err := dao.AddPolicies(ctx, false, newUser.Uuid, builder.Policies()); err != nil {
				return err
			}
			// Create user role
			roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(ctx, common.ServiceRole))
			if _, err := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
				Uuid:     newUser.Uuid,
				Label:    newUser.Login + " role",
				UserRole: true,
				Policies: builder.Policies(),
			}}); err != nil {
				return err
			}
		}
	}

	log.Logger(ctx).Info("Initialization: creating s3 anonymous user")

	newAnon, err := CreateIfNotExists(ctx, dao, &idm.User{
		Login:      common.PydioS3AnonUsername,
		Password:   common.PydioS3AnonUsername,
		Attributes: map[string]string{"profile": common.PydioProfileAnon},
	})
	if err != nil {
		return err
	}

	if newAnon != nil {
		builder := service2.NewResourcePoliciesBuilder()
		builder = builder.WithUserRead(common.PydioS3AnonUsername)
		builder = builder.WithProfileRead(common.PydioProfileAdmin)
		builder = builder.WithProfileWrite(common.PydioProfileAdmin)
		if err := dao.AddPolicies(ctx, false, newAnon.Uuid, builder.Policies()); err != nil {
			return err
		}
		// Create user role
		roleClient := idm.NewRoleServiceClient(grpc.ResolveConn(ctx, common.ServiceRole))
		if _, err := roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
			Uuid:     newAnon.Uuid,
			Label:    newAnon.Login + " role",
			UserRole: true,
			Policies: builder.Policies(),
		}}); err != nil {
			return err
		}
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
