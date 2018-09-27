package meta

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/defaults"
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
				log.Logger(ctx).Error("Error while sending to metaStreamer", zap.Error(sendError))
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
	if withCoreMeta {
		result = append(result, tree.NewNodeProviderStreamerClient(registry.GetClient(common.SERVICE_META)))
		names = append(names, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META)
	}

	// Other Meta Providers (running services only)
	services, err := registry.ListServicesWithMicroMeta("MetaProvider", "stream")
	if err != nil {
		return nil, names
	}

	for _, srv := range services {
		result = append(result, tree.NewNodeProviderStreamerClient(srv.Name(), defaults.NewClient()))
		names = append(names, srv.Name())
	}

	return result, names

}
