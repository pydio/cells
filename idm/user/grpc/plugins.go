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

// Package grpc provides the gRPC service to communicate with the Pydio's user persistence layer.
package grpc

import (
	"context"
	"encoding/base64"
	"github.com/pydio/cells/v4/common/dao"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"os"
	"strings"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/idm/user"
	"github.com/pydio/cells/v4/scheduler/actions"
)

const (
	EnvPydioAdminUserLogin    = "PYDIO_ADMIN_USER_LOGIN"
	EnvPydioAdminUserPassword = "PYDIO_ADMIN_USER_PASSWORD"
	ServiceName               = common.ServiceGrpcNamespace_ + common.ServiceUser
)

func init() {

	actions.GetActionsManager().Register(DeleteUsersActionName, func() actions.ConcreteAction {
		return &DeleteUsersAction{}
	})

	runtime.Register("main", func(ctx context.Context) {
		var s service.Service

		getDAO := func(ctx context.Context) user.DAO {
			var c dao.DAO

			if cfgFromCtx := servercontext.GetConfig(ctx); cfgFromCtx != nil {
				driver, dsn, _ := config.GetStorageDriver(cfgFromCtx, "storage", ServiceName)

				c, _ := dao.InitDAO(ctx, driver, dsn, "idm_user", user.NewDAO, cfgFromCtx.Val("services", ServiceName))

				service.UpdateServiceVersion(servicecontext.WithDAO(ctx, c), cfgFromCtx, s.Options())
			} else {
				c = servicecontext.GetDAO(s.Options().Context)
			}

			return c.(user.DAO)
		}

		s = service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Users persistence layer"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            InitDefaults,
				},
			}),
			service.WithStorage(user.NewDAO, service.WithStoragePrefix("idm_user")),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				idm.RegisterUserServiceEnhancedServer(server, NewHandler(ctx, getDAO))

				// Register a cleaner for removing a workspace when there are no more ACLs on it.
				cleaner := &RolesCleaner{Dao: getDAO}
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if e := message.Unmarshal(ev); e == nil {
						return cleaner.Handle(ctx, ev)
					}
					return nil
				}); e != nil {
					return e
				}

				return nil
			}),
		)

	})
}

func InitDefaults(ctx context.Context) error {

	var login, pwd string
	dao := servicecontext.GetDAO(ctx).(user.DAO)
	cfg := servercontext.GetConfig(ctx)

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
			if err := dao.AddPolicies(false, newUser.Uuid, builder.Policies()); err != nil {
				return err
			}
			// Create user role
			roleClient := idm.NewRoleServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceRole))
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
		if err := dao.AddPolicies(false, newAnon.Uuid, builder.Policies()); err != nil {
			return err
		}
		// Create user role
		roleClient := idm.NewRoleServiceClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceRole))
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
	if _, err := dao.Bind(user.Login, user.Password); err != nil && errors.FromError(err).Code != 404 {
		return nil, err
	} else if err == nil {
		log.Logger(ctx).Info("Skipping user " + user.Login + ", already exists")
		return nil, nil
	}
	// User is not created yet, add it now
	out, _, err := dao.Add(user)
	if err != nil {
		return nil, err
	}
	return out.(*idm.User), nil
}
