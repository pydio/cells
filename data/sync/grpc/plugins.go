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

// Package grpc exposes a resynchronization trigger GRPC api.
package grpc

import (
	"context"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
)

var (
	Name = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_SYNC
	// Service = &registry.Service{
	// 	Name:        Name,
	// 	Provider:    newService,
	// 	Tag:         common.SERVICE_TAG_SYNC,
	// 	Description: "Sample service for data synchronization",
	// }
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_SYNC),
		service.Tag(common.SERVICE_TAG_DATA),
		service.Description("Sample service for data synchronization"),
		service.WithMicro(func(m micro.Service) error {
			ctx := m.Options().Context
			config := servicecontext.GetConfig(ctx)
			handler, err := NewHandler(config)
			if err != nil {
				log.Logger(context.Background()).Error("Cannot start sync service, probably because config is not set. Ignoring.")
				return nil
			}
			// Register GRPC Resync Trigger
			sync.RegisterSyncEndpointHandler(m.Options().Server, handler)

			// Register Event Subscriber
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_TREE_CHANGES, handler.OnTreeEvent)); err != nil {
				return err
			}
			return nil
		}),
	)
}
