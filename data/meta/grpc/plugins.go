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

// Package meta provides a GRPC access to the underlying persistence layer for files metadata
package grpc

import (
	micro "github.com/micro/go-micro"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/meta"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META),
			service.Tag(common.SERVICE_TAG_DATA),
			service.Description("Metadata server for tree nodes"),
			service.WithStorage(meta.NewDAO, "data_meta"),
			service.WithMicro(func(m micro.Service) error {

				ctx := m.Options().Context

				engine := NewMetaServer()

				tree.RegisterNodeProviderHandler(m.Options().Server, engine)
				tree.RegisterNodeProviderStreamerHandler(m.Options().Server, engine)
				tree.RegisterNodeReceiverHandler(m.Options().Server, engine)
				tree.RegisterSearcherHandler(m.Options().Server, engine)

				// Register Subscribers
				if err := m.Options().Server.Subscribe(
					m.Options().Server.NewSubscriber(
						common.TOPIC_TREE_CHANGES,
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
