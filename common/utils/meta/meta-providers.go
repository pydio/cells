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
	"io"
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

type Loader interface {
	io.Closer
	LoadMetas(ctx context.Context, nodes ...*tree.Node)
}

type StreamLoader struct {
	names     []string
	streamers []tree.NodeProviderStreamer_ReadNodeStreamClient
	closer    MetaProviderCloser
}

func NewStreamLoader(ctx context.Context) Loader {
	l := &StreamLoader{}
	l.streamers, l.closer, l.names = initMetaProviderClients(ctx)
	return l
}

func (l *StreamLoader) LoadMetas(ctx context.Context, nodes ...*tree.Node) {
	enrichNodesMetaFromProviders(ctx, l.streamers, l.names, nodes...)
}

func (l *StreamLoader) Close() error {
	return l.closer()
}

type MetaProviderCloser func() error

func initMetaProviderClients(ctx context.Context) ([]tree.NodeProviderStreamer_ReadNodeStreamClient, MetaProviderCloser, []string) {

	metaProviders, names := getMetaProviderStreamers(ctx)
	var streamers []tree.NodeProviderStreamer_ReadNodeStreamClient
	for _, cli := range metaProviders {
		metaStreamer, metaE := cli.ReadNodeStream(ctx)
		if metaE != nil {
			log.Logger(ctx).Warn("Could not open meta provider!", zap.Error(metaE))
			continue
		}
		streamers = append(streamers, metaStreamer)
	}
	outCloser := func() error {
		for _, streamer := range streamers {
			streamer.Close()
		}
		return nil
	}
	return streamers, outCloser, names

}

func enrichNodesMetaFromProviders(ctx context.Context, streamers []tree.NodeProviderStreamer_ReadNodeStreamClient, names []string, nodes ...*tree.Node) {

	profiles := make(map[string][]time.Duration)

	for _, node := range nodes {

		for i, metaStreamer := range streamers {
			name := names[i]
			// This metaStream is already loaded, avoid reloading
			if node.HasMetaKey("pydio:meta-loaded-" + name) {
				log.Logger(ctx).Debug("Meta " + name + " already loaded, skipping")
				continue
			}
			start := time.Now()
			sendError := metaStreamer.Send(&tree.ReadNodeRequest{Node: node})
			if sendError != nil {
				if sendError != io.EOF && sendError != io.ErrUnexpectedEOF {
					log.Logger(ctx).Error("Error while sending to metaStreamer", zap.String("n", name), node.ZapPath(), node.ZapUuid(), zap.Error(sendError))
				}
				continue
			}
			metaResponse, err := metaStreamer.Recv()
			if err == nil {
				if node.MetaStore == nil {
					node.MetaStore = make(map[string]string, len(metaResponse.Node.MetaStore)+1)
				}
				for k, v := range metaResponse.Node.MetaStore {
					node.MetaStore[k] = v
				}
				node.MetaStore["pydio:meta-loaded-"+name] = "true" // JSON
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

func getMetaProviderStreamers(ctx context.Context) ([]tree.NodeProviderStreamerClient, []string) {

	var result []tree.NodeProviderStreamerClient
	var names []string

	// Load core Meta
	result = append(result, tree.NewNodeProviderStreamerClient(registry.GetClient(common.ServiceMeta)))
	names = append(names, common.ServiceGrpcNamespace_+common.ServiceMeta)

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
