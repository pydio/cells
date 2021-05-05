package natsstreaming

import (
	"github.com/google/uuid"
	"github.com/nats-io/nats-server/v2/server"
	stand "github.com/nats-io/nats-streaming-server/server"
	"github.com/nats-io/nats-streaming-server/stores"
	"github.com/nats-io/stan.go"
	"github.com/pydio/cells/common/config"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
	"log"
	"net"
	"path/filepath"
	"strconv"
	"strings"
)

var (
	unavailable = make(chan error, 1)
)

// Init nats server and cluster
func Init() error {
	if defaults.RuntimeIsFork() {
		return nil
	}
	stanOpts := stand.GetDefaultOptions()
	natsOpts := stand.NewNATSOptions()

	natsOpts.NoSigs = true
	natsOpts.HTTPPort = viper.GetInt("nats_monitor_port")

	stanOpts.ID = viper.GetString("nats_streaming_cluster_id")
	stanOpts.StoreType = viper.GetString("nats_streaming_store")

	if stanOpts.StoreType == stores.TypeFile {
		stanOpts.FilestoreDir = filepath.Join(config.ApplicationWorkingDir(), "nats")
	} else if stanOpts.StoreType == stores.TypeSQL {
		driver, dsn := config.GetDatabase("default")
		stanOpts.SQLStoreOpts = stores.SQLStoreOptions{
			Driver: driver,
			Source: dsn,
		}
	}

	// TODO - do the sql opts
	// stanOpts.FTGroupName = "test"
	stanOpts.HandleSignals = false
	stanOpts.Clustering.Clustered = viper.GetBool("nats_streaming_clustered")
	stanOpts.Clustering.NodeID = viper.GetString("nats_streaming_cluster_node_id")
	stanOpts.Clustering.Bootstrap = viper.GetBool("nats_streaming_cluster_bootstrap")
	stanOpts.Clustering.Peers = strings.Split(viper.GetString("nats_streaming_cluster_peers"), ",")
	stanOpts.Clustering.RaftLogPath = config.ApplicationWorkingDir(config.ApplicationDirLogs) + "/raft"
	stanOpts.Clustering.LogSnapshots = 1
	stanOpts.Clustering.LogCacheSize = 100

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

		natsOpts.Cluster = *clusterOpts
	}

	natsOpts.RoutesStr = viper.GetString("nats_cluster_routes")
	natsOpts.Routes = server.RoutesFromStr(natsOpts.RoutesStr)

	natsOpts.Debug = true
	stanOpts.Debug = true

	if _, err = stand.RunServerWithOpts(stanOpts, natsOpts); err != nil {
		return err
	}

	return nil
}

func Monitor() <-chan error {
	stanOpts := stand.GetDefaultOptions()
	stanOpts.ID = viper.GetString("nats_streaming_cluster_id")

	_, err := stan.Connect(stanOpts.ID, "monitor" + uuid.New().String(), stan.SetConnectionLostHandler(func (_ stan.Conn, err error) {
		unavailable <- err
	}))
	if err != nil {
		unavailable <- err
	}

	return unavailable
}
