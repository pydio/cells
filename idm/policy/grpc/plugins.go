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

// Package grpc is the policy engine service
package grpc

import (
	"context"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/idm/policy"
)

func init() {
	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServicePolicy),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Policy Engine Service"),
			service.WithStorage(policy.NewDAO, "idm_policy"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            policy.InitDefaults,
				},
				{
					TargetVersion: service.ValidVersion("1.0.1"),
					Up:            policy.Upgrade101,
				},
				{
					TargetVersion: service.ValidVersion("1.0.3"),
					Up:            policy.Upgrade103,
				},
				{
					TargetVersion: service.ValidVersion("1.2.0"),
					Up:            policy.Upgrade120,
				},
				{
					TargetVersion: service.ValidVersion("1.2.2"),
					Up:            policy.Upgrade122,
				},
				{
					TargetVersion: service.ValidVersion("1.4.2"),
					Up:            policy.Upgrade142,
				},
				{
					TargetVersion: service.ValidVersion("2.0.2"),
					Up:            policy.Upgrade202,
				},
				{
					TargetVersion: service.ValidVersion("2.0.99"),
					Up:            policy.Upgrade210,
				},
				{
					TargetVersion: service.ValidVersion("2.1.99"),
					Up:            policy.Upgrade220,
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				handler := new(Handler)
				idm.RegisterPolicyEngineServiceHandler(m.Options().Server, handler)
				return nil
			}),
		)
	})
}
