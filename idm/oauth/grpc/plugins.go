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

// Package grpc spins an OpenID Connect Server using the coreos/dex implementation
package grpc

import (
	"github.com/jmoiron/sqlx"

	"github.com/micro/go-micro"
	"github.com/ory/hydra/driver"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/oauth"
)

var (
	reg driver.Registry
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_OAUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("OAuth Provider"),
			service.WithStorage(oauth.NewDAO),
			service.WithMicro(func(m micro.Service) error {
				h, err := NewAuthTokenVerifierHandler()
				if err != nil {
					return err
				}

				proto.RegisterAuthTokenVerifierHandler(m.Options().Server, h)

				return nil
			}),
			service.AfterStart(initialize),
		)
	})

	auth.RegisterGRPCProvider(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_OAUTH)
}

func initialize(s service.Service) error {

	ctx := s.Options().Context

	dao := servicecontext.GetDAO(ctx).(sql.DAO)
	db := sqlx.NewDb(dao.DB(), dao.Driver())

	externalURL := config.Get("defaults", "url").String("")

	conf := oauth.NewProvider(externalURL, config.Values("services", common.SERVICE_WEB_NAMESPACE_+common.SERVICE_OAUTH))

	reg = driver.NewRegistrySQL().WithConfig(conf).(*driver.RegistrySQL).WithDB(db)
	reg.Init()

	return nil
}
