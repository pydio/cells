package natsstreaming

import (
	"fmt"
	"net"
	"strconv"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	unavailable = make(chan error, 1)
)

// Init nats server and cluster
func Init() error {
	if defaults.RuntimeIsFork() {
		return nil
	}

	natsOpts := &server.Options{}

	natsOpts.ServerName = viper.GetString("nats_streaming_cluster_node_id")
	natsOpts.NoLog = false
	natsOpts.NoSigs = true
	natsOpts.HTTPPort = viper.GetInt("nats_monitor_port")

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

		clusterOpts.Name = viper.GetString("nats_streaming_cluster_id")
		clusterOpts.Host = clusterHost
		clusterOpts.Port = clusterPort

		natsOpts.Cluster = *clusterOpts
	}

	natsOpts.RoutesStr = viper.GetString("nats_cluster_routes")
	if natsOpts.RoutesStr != "" {
		natsOpts.Routes = server.RoutesFromStr(natsOpts.RoutesStr)
	}

	natsOpts.Debug = true
	natsOpts.Trace = true

	natsOpts.JetStream = true

	s, err := server.NewServer(natsOpts)
	if err != nil {
		return err
	}

	fmt.Println("Running nats ? ")
	if err := server.Run(s); err != nil {
		fmt.Println("Not possible")
		return err
	}

	fmt.Println("End of running nats ?")

	//if _, err := stand.RunServerWithOpts(stanOpts, natsOpts); err != nil {
	//	return err
	//}

	return nil
}

func Monitor() <-chan error {
	//stanOpts := stand.GetDefaultOptions()
	//stanOpts.ID = viper.GetString("nats_streaming_cluster_id")
	//
	//_, err := stan.Connect(stanOpts.ID, "monitor" + uuid.New().String(), stan.SetConnectionLostHandler(func (_ stan.Conn, err error) {
	//	fmt.Println("And the error is here ", err)
	//	unavailable <- err
	//}))
	//if err != nil {
	//	fmt.Println("And the error is there", err)
	//	unavailable <- err
	//}

	return unavailable
}

type logger struct {
	*zap.Logger
}

func (l logger) Noticef(s string, args ...interface{}) {
	l.Logger.Info(fmt.Sprintf(s, args...))
}

func (l logger) Warnf(s string, args ...interface{}) {
	l.Logger.Warn(fmt.Sprintf(s, args...))
}

func (l logger) Errorf(s string, args ...interface{}) {
	l.Logger.Error(fmt.Sprintf(s, args...))
}

func (l logger) Fatalf(s string, args ...interface{}) {
	l.Logger.Fatal(fmt.Sprintf(s, args...))
}

func (l logger) Debugf(s string, args ...interface{}) {
	l.Logger.Debug(fmt.Sprintf(s, args...))
}

func (l logger) Tracef(s string, args ...interface{}) {
	l.Logger.Debug(fmt.Sprintf(s, args...))
}
