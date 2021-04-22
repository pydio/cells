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

package nats

import (
	"context"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	"github.com/nats-io/gnatsd/server"
	"github.com/nats-io/nats"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	servicecontext "github.com/pydio/cells/common/service/context"
	net2 "github.com/pydio/cells/common/utils/net"
)

var (
	hd          *server.Server
	unavailable = make(chan error, 1)
	routes      []string
)

const (
	srvAddr         = "224.0.0.1:9999"
	maxDatagramSize = 8192
)

// Init nats server and cluster
func Init() {
	regAddress := viper.GetString("nats_address")
	clusterAddress := viper.GetString("nats_cluster_address")
	clusterRoutes := viper.GetString("nats_cluster_routes")

	nopts := nats.Options{}
	nopts.Servers = []string{regAddress}
	c, err := nopts.Connect()
	if err == nil {
		log.Info("NATS already started, cluster configuration deferred to running NATS")

		c.SetDisconnectErrHandler(nats.ConnErrHandler(func(_ *nats.Conn, err error) {
			fmt.Println("Disconnected")
			unavailable <- err
		}))

		return
	}

	opts := new(server.Options)
	if len(net2.DefaultAdvertiseAddress) > 0 {
		opts.ClientAdvertise = net2.DefaultAdvertiseAddress
	}

	host, p, err := net.SplitHostPort(regAddress)
	if err != nil {
		log.Fatal("nats: wrong address")
	}

	// Port has already been so no need to recheck
	port, _ := strconv.Atoi(p)

	opts.Host = host
	opts.Port = port
	opts.NoSigs = true

	if defaults.RuntimeIsCluster() {
		clusterOpts := new(server.ClusterOpts)

		clusterHost, p, err := net.SplitHostPort(clusterAddress)
		if err != nil {
			log.Fatal("nats: wrong cluster address")
		}

		if _, err := net.Dial("tcp", clusterAddress); err != nil {
			// Port has already been so no need to recheck
			clusterPort, _ := strconv.Atoi(p)

			clusterOpts.Host = clusterHost
			clusterOpts.Port = clusterPort

			opts.Cluster = *clusterOpts
		}
	}

	if defaults.RuntimeIsCluster() {
		opts.RoutesStr = clusterRoutes
		opts.Routes = server.RoutesFromStr(clusterRoutes)
	}

	if httpPort := viper.GetInt("nats_monitor_port"); httpPort != 0 {
		opts.HTTPPort = httpPort
	}

	// Create the server with appropriate options.
	hd = server.New(opts)

	// Configure the logger based on the flags
	ctx := servicecontext.WithServiceName(context.Background(), "nats")
	hd.SetLogger(logger{log.Logger(ctx)}, true, false)

	// Start things up. Block here until done.
	go func() {
		err := server.Run(hd)
		if err != nil {
			log.Fatal("nats: could not start", zap.Error(err))
		}
	}()
}

func Monitor() <-chan error {
	return unavailable
}

func msgHandler(src *net.UDPAddr, n int, b []byte, ret chan *net.TCPAddr) {
	addr, err := net.ResolveTCPAddr("tcp", string(b))
	if err != nil {
		return
	}
	ret <- addr
}

func ping(a string) {
	addr, err := net.ResolveUDPAddr("udp", a)
	if err != nil {
		return
	}
	c, err := net.DialUDP("udp", nil, addr)
	for {
		if hd != nil && hd.ClusterAddr() != nil {
			c.Write([]byte(hd.ClusterAddr().String()))
		}
		time.Sleep(1 * time.Second)
	}
}

func serveMulticastUDP(a string, h func(*net.UDPAddr, int, []byte, chan *net.TCPAddr), ret chan *net.TCPAddr) {
	addr, err := net.ResolveUDPAddr("udp", a)
	if err != nil {
		return
	}
	l, err := net.ListenMulticastUDP("udp", nil, addr)
	l.SetReadBuffer(maxDatagramSize)
	for {
		b := make([]byte, maxDatagramSize)
		n, src, err := l.ReadFromUDP(b)
		if err != nil {
			return
		}

		fmt.Println("Received ", string(b))
		h(src, n, b, ret)
	}
}

type logger struct {
	*zap.Logger
}

func (l logger) Debugf(str string, args ...interface{}) {
	l.Debug(fmt.Sprintf(str, args...))
}

func (l logger) Errorf(str string, args ...interface{}) {
	if strings.HasPrefix(str, "Error trying to connect to route: ") {
		l.Debug(fmt.Sprintf(str, args...))
	} else {
		l.Error(fmt.Sprintf(str, args...))
	}
}

func (l logger) Fatalf(str string, args ...interface{}) {
	l.Fatal(fmt.Sprintf(str, args...))
}

func (l logger) Noticef(str string, args ...interface{}) {
	if strings.Contains(str, "Slow Consumer Detected") {
		l.Error(fmt.Sprintf(str+". Some events have been dropped, your hardware may be undersized.", args...))
	} else {
		l.Debug(fmt.Sprintf(str, args...))
	}
}

func (l logger) Tracef(str string, args ...interface{}) {
	l.Debug(fmt.Sprintf(str, args...))
}
