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

// Package grpc provides a GRPC access to the underlying persistence layer for files metadata
package grpc

import (
	"context"

	micro "github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/meta"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceMeta),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Metadata server for tree nodes"),
			service.WithStorage(meta.NewDAO, "data_meta"),
			service.Unique(true),
			service.WithMicro(func(m micro.Service) error {

				ctx := m.Options().Context

				engine := NewMetaServer()
				m.Init(micro.BeforeStop(func() error {
					engine.Stop()
					return nil
				}))

				tree.RegisterNodeProviderHandler(m.Options().Server, engine)
				tree.RegisterNodeProviderStreamerHandler(m.Options().Server, engine)
				tree.RegisterNodeReceiverHandler(m.Options().Server, engine)
				tree.RegisterSearcherHandler(m.Options().Server, engine)

				// Register Subscribers
				if err := m.Options().Server.Subscribe(
					m.Options().Server.NewSubscriber(
						common.TopicTreeChanges,
						engine.CreateNodeChangeSubscriber(ctx),
					),
				); err != nil {
					return err
				}

				return nil
			}),
		)
	})
}
