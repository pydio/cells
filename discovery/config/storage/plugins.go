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
	"flag"
	"fmt"
	"net/http"
	"strings"

	"github.com/spf13/viper"
	"go.etcd.io/etcd/raft/raftpb"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config/raft"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

var store *raft.KVStore

func init() {

	plugins.Register(func(ctx context.Context) {
		id := viper.GetInt("nats_streaming_cluster_node_id")
		port := fmt.Sprintf("%d", 20000 + id)
		fmt.Println(port)
		service.NewService(
			service.Name(common.ServiceStorageNamespace_+common.ServiceConfig),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Main service loading configurations for all other services."),
			service.Port(port),
			service.WithHTTP(func() http.Handler {

				cluster := flag.String("cluster", "http://127.0.0.1:9021", "comma separated cluster peers")

				// kvport := flag.Int("port", 9121, "key-value server port")
				join := flag.Bool("join", false, "join an existing cluster")
				flag.Parse()

				proposeC := make(chan string)
				confChangeC := make(chan raftpb.ConfChange)

				getSnapshot := func() ([]byte, error) { return store.GetSnapshot() }
				commitC, errorC, snapshotterReady := raft.NewRaftNode(id, strings.Split(*cluster, ","), "pydio.storage.config", *join, getSnapshot, proposeC, confChangeC)

				store = raft.NewKVStore(<-snapshotterReady, proposeC, commitC, errorC)

				return NewRouter()
			}),
		)


	})
}
