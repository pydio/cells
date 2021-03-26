package natsstreaming

import (
	"github.com/nats-io/gnatsd/server"
	stand "github.com/nats-io/nats-streaming-server/server"
	"github.com/nats-io/nats-streaming-server/stores"
	"github.com/pydio/cells/common/config"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
	"log"
	"net"
	"path/filepath"
	"strconv"
	"strings"
)

// Init nats server and cluster
func Init() {
	if !defaults.RuntimeIsFork() {
		stanOpts := stand.GetDefaultOptions()
		natsOpts := stand.NewNATSOptions()

		stanOpts.ID = viper.GetString("nats_streaming_cluster_id")
		stanOpts.StoreType = viper.GetString("nats_streaming_store")

		if stanOpts.StoreType == stores.TypeFile {
			stanOpts.FilestoreDir = filepath.Join(config.ApplicationWorkingDir(), "nats")
		}

		// TODO - do the sql opts

		stanOpts.Clustering.Clustered = viper.GetBool("nats_streaming_clustered")
		stanOpts.Clustering.NodeID = viper.GetString("nats_streaming_cluster_node_id")
		stanOpts.Clustering.Bootstrap = viper.GetBool("nats_streaming_cluster_bootstrap")
		stanOpts.Clustering.Peers = strings.Split(viper.GetString("nats_streaming_cluster_peers"), ",")

		host, p, err := net.SplitHostPort(viper.GetString("nats_address"))
		if err != nil {
			log.Fatal("nats: wrong address")
		}

		port, _ := strconv.Atoi(p)
		natsOpts.Host = host
		natsOpts.Port = port

		if defaults.RuntimeIsCluster() {
			clusterOpts := new(server.ClusterOpts)

			clusterHost, p, err := net.SplitHostPort(viper.GetString("nats_cluster_address"))
			if err != nil {
				log.Fatal("nats: wrong cluster address")
			}

			clusterPort, _ := strconv.Atoi(p)

			clusterOpts.Host = clusterHost
			clusterOpts.Port = clusterPort

			// natsOpts.Cluster = *clusterOpts

		}

		natsOpts.RoutesStr = viper.GetString("nats_cluster_routes")
		natsOpts.Routes = server.RoutesFromStr(natsOpts.RoutesStr)

		if _, err := stand.RunServerWithOpts(stanOpts, natsOpts); err != nil {
			return
		}
	}
}
