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

// Package grpc provides the Pydio grpc service for querying indexer.
//
// Insertion in the index is not performed directly but via events broadcasted by the broker.
package grpc

import (
	"path/filepath"

	servicecontext "github.com/pydio/cells/common/service/context"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/search/dao/bleve"
)

var (
	Name = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_SEARCH
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(Name),
			service.Tag(common.SERVICE_TAG_DATA),
			service.Description("Search Engine"),
			service.RouterDependencies(),
			service.Fork(true),
			service.WithMicro(func(m micro.Service) error {
				indexContent := servicecontext.GetConfig(m.Options().Context).Val("indexContent").Bool()

				dir, _ := config.ServiceDataDir(Name)
				bleve.BleveIndexPath = filepath.Join(dir, "searchengine.bleve")
				bleveEngine, err := bleve.NewBleveEngine(indexContent)
				if err != nil {
					return err
				}

				server := &SearchServer{
					Engine:           bleveEngine,
					TreeClient:       tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient()),
					ReIndexThrottler: make(chan struct{}, 5),
				}

				tree.RegisterSearcherHandler(m.Options().Server, server)
				sync.RegisterSyncEndpointHandler(m.Options().Server, server)

				// Register Subscribers
				if err := m.Options().Server.Subscribe(
					m.Options().Server.NewSubscriber(
						common.TOPIC_META_CHANGES,
						server.CreateNodeChangeSubscriber(),
					),
				); err != nil {
					return err
				}

				return nil
			}),
		)
	})
}
