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

// Package grpc provides the persistence for workspaces
package grpc

import (
	"github.com/micro/go-micro"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/resources"
	"github.com/pydio/cells/idm/workspace"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("Workspaces Service"),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, []string{}),
			service.WithStorage(workspace.NewDAO, "idm_workspace"),
			service.WithMicro(func(m micro.Service) error {
				ctx := m.Options().Context

				h := new(Handler)
				idm.RegisterWorkspaceServiceHandler(m.Options().Server, h)

				// Register a cleaner for removing a workspace when there are no more ACLs on it.
				wsCleaner := NewWsCleaner(h, ctx)
				if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_IDM_EVENT, wsCleaner)); err != nil {
					return err
				}

				// Register a cleaner on DeleteRole events to purge policies automatically
				cleaner := &resources.PoliciesCleaner{
					Dao: servicecontext.GetDAO(ctx),
					Options: resources.PoliciesCleanerOptions{
						SubscribeRoles: true,
						SubscribeUsers: true,
					},
					LogCtx: ctx,
				}
				if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_IDM_EVENT, cleaner)); err != nil {
					return err
				}

				return nil
			}),
		)
	})
}
