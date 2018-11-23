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
	"time"

	"github.com/nats-io/gnatsd/server"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/log"
)

var hd *server.Server

func init() {
	cobra.OnInitialize(run)
}

func run() {

	reg := viper.GetString("registry")
	regAddress := viper.GetString("registry_address")
	regClusterAddress := viper.GetString("registry_cluster_address")
	regClusterRoutes := viper.GetString("registry_cluster_routes")

	if reg == "nats" {
		opts := new(server.Options)

		host, p, err := net.SplitHostPort(regAddress)
		if err != nil {
			log.Fatal("nats: wrong address")
		}

		// Port has already been so no need to recheck
		port, _ := strconv.Atoi(p)

		opts.Host = host
		opts.Port = port

		if _, err := net.Dial("tcp", regAddress); err == nil {
			return
		}

		if regClusterAddress != "" {
			clusterOpts := new(server.ClusterOpts)

			clusterHost, p, err := net.SplitHostPort(regClusterAddress)
			if err != nil {
				log.Fatal("nats: wrong cluster address")
			}

			if _, err := net.Dial("tcp", regClusterAddress); err != nil {
				// Port has already been so no need to recheck
				clusterPort, _ := strconv.Atoi(p)

				clusterOpts.Host = clusterHost
				clusterOpts.Port = clusterPort

				opts.Cluster = *clusterOpts
			}
		}

		if regClusterRoutes != "" {
			opts.RoutesStr = regClusterRoutes
			opts.Routes = server.RoutesFromStr(regClusterRoutes)

			fmt.Println("Routes ", opts.RoutesStr, opts.Routes)
		}

		// Create the server with appropriate options.
		hd = server.New(opts)

		// Configure the logger based on the flags
		hd.SetLogger(logger{log.Logger(context.Background())}, true, false)

		// Start things up. Block here until done.
		go func() {
			err := server.Run(hd)
			fmt.Println(err)
		}()

		if !hd.ReadyForConnections(3 * time.Second) {
			log.Fatal("nats: start timed out")
		}
	}
}
