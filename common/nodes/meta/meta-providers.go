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

// Package meta provides tool for reading metadata from services declaring "MetaProvider" support
package meta

import (
	"context"
	"github.com/pydio/cells/v4/common/nodes"
	"io"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

const (
	ServiceMetaProvider   = "MetaProvider"
	ServiceMetaNsProvider = "MetaNsProvider"
)

type Loader interface {
	io.Closer
	LoadMetas(ctx context.Context, nodes ...*tree.Node)
}

type streamLoader struct {
	names     []string
	streamers []tree.NodeProviderStreamer_ReadNodeStreamClient
	closer    providerCloser
}

func NewStreamLoader(ctx context.Context) Loader {
	l := &streamLoader{}
	l.streamers, l.closer, l.names = initMetaProviderClients(ctx)
	return l
}

func (l *streamLoader) LoadMetas(ctx context.Context, nodes ...*tree.Node) {
	enrichNodesMetaFromProviders(ctx, l.streamers, l.names, nodes...)
}

func (l *streamLoader) Close() error {
	return l.closer()
}

type providerCloser func() error

func initMetaProviderClients(ctx context.Context) ([]tree.NodeProviderStreamer_ReadNodeStreamClient, providerCloser, []string) {

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
			streamer.CloseSend()
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
			profiles[name] = append(profiles[name], time.Since(start))

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

	if nodes.IsUnitTestEnv {
		return result, names
	}

	// Load core Meta
	result = append(result, tree.NewNodeProviderStreamerClient(grpc.GetClientConnFromCtx(ctx, common.ServiceMeta)))
	names = append(names, common.ServiceGrpcNamespace_+common.ServiceMeta)

	// Load User meta (if claims are not empty!)
	if u, _ := permissions.FindUserNameInContext(ctx); u == "" {
		log.Logger(ctx).Debug("No user/claims found - skipping user metas on metaStreamers init!")
		return result, names
	}

	ss, e := servicesWithMeta(ctx, ServiceMetaProvider, "stream")
	if e != nil {
		return result, names
	}

	for _, srv := range ss {
		result = append(result, tree.NewNodeProviderStreamerClient(grpc.GetClientConnFromCtx(ctx, strings.TrimPrefix(srv.Name(), common.ServiceGrpcNamespace_))))
		names = append(names, srv.Name())
	}

	return result, names

}
