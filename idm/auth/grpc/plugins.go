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
	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	proto "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/idm/auth"
)

func init() {

	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			// service.WithStorage(auth.NewDAO, "dex_"),
			service.Description("Authentication Service : JWT provider and token revocation"),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, []string{}),
			service.Migrations([]*service.Migration{{
				TargetVersion: service.FirstRun(),
				Up:            auth.InsertPruningJob,
			}}),
			service.WithMicro(func(m micro.Service) error {

				tokenRevokerHandler, err := NewAuthTokenRevokerHandler()
				if err != nil {
					return err
				}

				proto.RegisterAuthTokenRevokerHandler(m.Options().Server, tokenRevokerHandler)

				return nil
			}),
		)
	})
}
