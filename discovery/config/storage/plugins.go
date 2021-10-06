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

package storage

import (
	"context"
	"fmt"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common/config"
	microconf "github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/file"
	"github.com/pydio/cells/common/proto/storage"
	proto "github.com/pydio/config-srv/proto/config"
	microconfig "github.com/pydio/go-os/config"
	"github.com/spf13/viper"
	"go.etcd.io/etcd/raft/raftpb"
	"path/filepath"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config/raft"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

var store *raft.KVStore

func init() {
	plugins.Register("cluster", func(ctx context.Context) {
		id := viper.GetInt("nats_streaming_cluster_node_id")
		port := fmt.Sprintf("%d", 20000 + id)
		fmt.Println(port)
		service.NewService(
			service.Name(common.ServiceStorageNamespace_+common.ServiceConfig),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Main service loading configurations for all other services."),
			service.Port(port),
			service.WithMicro(func(m micro.Service) error {
				source := file.NewSource(
					microconfig.SourceName(filepath.Join(config.PydioConfigDir, "cluster", config.PydioConfigFile)),
				)

				defaultConfig := config.New(
					microconf.New(
						microconfig.NewConfig(
							microconfig.WithSource(source),
							microconfig.PollInterval(10*time.Second),
						),
					),
				)

				join := false

				proposeC := make(chan string)
				confChangeC := make(chan raftpb.ConfChange)

				getSnapshot := func() ([]byte, error) {
					return store.GetSnapshot()
				}

				meta := make(map[string]string)
				for k, v := range m.Options().Server.Options().Metadata {
					meta[k] = v
				}

				meta["rafttransport"] = fmt.Sprintf("http://:%d", 21000 + id)

				m.Options().Server.Init(
					server.Metadata(meta),
				)

				commitC, errorC, snapshotterReady := raft.NewRaftNode(
					id,
					m.Server().Options().Id,
					meta["rafttransport"],
					"pydio.storage.config",
					join,
					getSnapshot,
					proposeC,
					confChangeC,
					)

				store = raft.NewKVStore(defaultConfig.Val(), <-snapshotterReady, proposeC, commitC, errorC)

				handler := NewHandler(store)

				storage.RegisterStorageEndpointHandler(m.Options().Server, handler)
				proto.RegisterConfigHandler(m.Options().Server, handler)

				if m := config.Get().Map(); len(m) > 0 {
					store.Propose("", m)
				}

				return nil
			}),
		)
	})
}
