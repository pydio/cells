/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

// Package meta provides tool for reading metadata from services declaring "MetaProvider" support
package meta

import (
	"context"
	"time"

	"github.com/pydio/cells/common/utils/permissions"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
)

const (
	ServiceMetaProvider   = "MetaProvider"
	ServiceMetaNsProvider = "MetaNsProvider"
)

type MetaProviderCloser func()

func InitMetaProviderClients(ctx context.Context, withCoreMeta bool) ([]tree.NodeProviderStreamer_ReadNodeStreamClient, MetaProviderCloser, []string) {

	metaProviders, names := getMetaProviderStreamers(withCoreMeta)
	var streamers []tree.NodeProviderStreamer_ReadNodeStreamClient
	for _, cli := range metaProviders {
		metaStreamer, metaE := cli.ReadNodeStream(ctx)
		if metaE != nil {
			continue
		}
		streamers = append(streamers, metaStreamer)
	}
	outCloser := func() {
		for _, streamer := range streamers {
			streamer.Close()
		}
	}
	//log.Logger(ctx).Info("Init streamers", zap.Any("n", names))
	return streamers, outCloser, names

}

func EnrichNodesMetaFromProviders(ctx context.Context, streamers []tree.NodeProviderStreamer_ReadNodeStreamClient, names []string, nodes ...*tree.Node) {

	profiles := make(map[string][]time.Duration)

	for _, node := range nodes {

		for i, metaStreamer := range streamers {

			name := names[i]
			start := time.Now()
			//log.Logger(ctx).Info("Sending to metaStreamer", zap.String("n", name))
			sendError := metaStreamer.Send(&tree.ReadNodeRequest{Node: node})
			if sendError != nil {
				log.Logger(ctx).Error("Error while sending to metaStreamer", zap.String("n", name), node.ZapPath(), node.ZapUuid(), zap.Error(sendError))
				continue
			}
			metaResponse, err := metaStreamer.Recv()
			if err == nil {

				if node.MetaStore == nil {
					node.MetaStore = make(map[string]string, len(metaResponse.Node.MetaStore))
				}
				for k, v := range metaResponse.Node.MetaStore {
					node.MetaStore[k] = v
				}
			}
			profiles[name] = append(profiles[name], time.Now().Sub(start))

		}
	}

	for n, p := range profiles {
		l := len(p)
		var total time.Duration
		for _, d := range p {
			total += d
		}
		avgNano := float64(total.Nanoseconds()) / float64(l)
		avg := time.Duration(avgNano)
		log.Logger(ctx).Debug("EnrichMetaProvider - Average time spent", zap.Duration(n, avg))
	}

}

func getMetaProviderStreamers(withCoreMeta bool) ([]tree.NodeProviderStreamerClient, []string) {

	// Init with Meta Grpc Service
	var result []tree.NodeProviderStreamerClient
	var names []string

	// Load core Meta
	result = append(result, tree.NewNodeProviderStreamerClient(registry.GetClient(common.SERVICE_META)))
	names = append(names, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META)

	// Load User meta (if claims are not empty!)
	if u, _ := permissions.FindUserNameInContext(ctx); u == "" {
		log.Logger(ctx).Debug("No user/claims found - skipping user metas on metaStreamers init!")
		return result, names
	}

	// Other Meta Providers (running services only)
	services, err := registry.ListServicesWithMicroMeta(ServiceMetaProvider, "stream")
	if err != nil {
		return nil, names
	}

	for _, srv := range services {
		result = append(result, tree.NewNodeProviderStreamerClient(srv.Name(), defaults.NewClient()))
		names = append(names, srv.Name())
	}

	return result, names

}
