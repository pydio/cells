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

package dex

import (
	"context"
	"fmt"

	"github.com/coreos/dex/connector"
	"github.com/micro/go-micro/client"
	gmerrors "github.com/micro/go-micro/errors"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
)

type ApiConfig struct {
}

func (c *ApiConfig) Open(logger logrus.FieldLogger) (connector.Connector, error) {
	return c.OpenConnector(logger)
}

func (c *ApiConfig) OpenConnector(logger logrus.FieldLogger) (interface{}, error) {
	return c.openConnector(logger)
}

func (c *ApiConfig) openConnector(logger logrus.FieldLogger) (*pydioAPIConnector, error) {
	return &pydioAPIConnector{
		ApiConfig: *c,
		logger:    logger,
		//client:    grpc.NewClient(),
		UserServiceClient: idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient()),
		RoleServiceClient: idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient()),
	}, nil
}

type pydioAPIConnector struct {
	ApiConfig
	logger            logrus.FieldLogger
	client            client.Client
	UserServiceClient idm.UserServiceClient
	RoleServiceClient idm.RoleServiceClient
}

var (
	_ connector.PasswordConnector = (*pydioAPIConnector)(nil)
	_ connector.RefreshConnector  = (*pydioAPIConnector)(nil)
)

func (p *pydioAPIConnector) Login(ctx context.Context, s connector.Scopes, username, password string) (identity connector.Identity, validPassword bool, err error) {

	c := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

	resp, err := c.BindUser(ctx, &idm.BindUserRequest{UserName: username, Password: password})

	if err != nil {
		// Workaround issue triggered by the fact that the go-micro.Error object overrides the Error() method to return a JSON encoded object
		errMsg := err.Error()
		if me, ok := err.(*gmerrors.Error); ok {
			errMsg = fmt.Sprintf("%d (%s) %s error: %s", me.Code, me.Status, me.Id, me.Detail)
		}
		log.Logger(ctx).Error("cannot bind user "+username, zap.Error(err))
		log.Auditer(ctx).Error(
			"Could not bind user ["+username+"]: "+errMsg,
			log.GetAuditId(common.AUDIT_LOGIN_FAILED),
			zap.String(common.KEY_USERNAME, username),
		)
		return connector.Identity{}, false, err
	}

	identity = ConvertUserApiToIdentity(resp.GetUser(), "pydioapi")
	log.Logger(ctx).Info("Login", zap.Any("identity", identity))
	return identity, true, nil
}

func (p *pydioAPIConnector) Refresh(ctx context.Context, s connector.Scopes, ident connector.Identity) (connector.Identity, error) {

	log.Logger(ctx).Info("Refresh request for User ID:" + ident.UserID)
	ident.UserID = ident.UserID + "c"

	return ident, nil
}
