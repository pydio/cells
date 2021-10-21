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
	"net/http"

	dlog "github.com/dexidp/dex/pkg/log"
	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
)

var (
	_ PasswordConnector = (*pydioconnector)(nil)
)

func init() {
	RegisterConnectorType("pydio", func(_ proto.Message) (Opener, error) {
		return new(pydioconfig), nil
	})
}

type pydioconfig struct{}

func (c *pydioconfig) Open(string, dlog.Logger) (Connector, error) {
	return &pydioconnector{}, nil
}

type pydioconnector struct{}

func (p *pydioconnector) Prompt() string {
	return "pydio"
}

func (p *pydioconnector) Login(ctx context.Context, s Scopes, username, password string) (Identity, bool, error) {
	// Check the user has successfully logged in
	c := idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, defaults.NewClient())
	resp, err := c.BindUser(ctx, &idm.BindUserRequest{UserName: username, Password: password})
	if err != nil {
		errr := errors.Parse(err.Error())
		if errr.Code == http.StatusForbidden {
			return Identity{}, false, nil
		}

		return Identity{}, false, err
	}

	user := resp.GetUser()
	return Identity{
		UserID:        user.GetUuid(),
		Username:      user.GetLogin(),
		Email:         user.GetAttributes()["email"],
		EmailVerified: true,
		Groups:        []string{},
	}, true, nil
}
