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

package cmd

import (
	"context"
	"fmt"
	"net"
	"strconv"

	"github.com/manifoldco/promptui"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
)

// clusterStartCmd connects a node to a cluster.
var clusterStartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start a node in a cluster",
	Long: `
DESCRIPTION

  Assign a different database connection to a service. 
  Use default to change to the default database.

` + promptui.IconWarn + `  Note that the database data will not be transferred to the new database.`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		natsOpts := &server.Options{}

		natsOpts.ServerName = viper.GetString("nats_streaming_cluster_node_id")
		natsOpts.NoLog = false
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

		s.SetLogger(&logger{log.Logger(context.Background())}, true, true)

		if err := server.Run(s); err != nil {
			return err
		}

		s.WaitForShutdown()

		return nil

	},
}

func init() {
	ClusterCmd.AddCommand(clusterStartCmd)
	addNatsFlags(clusterStartCmd.Flags())
	addNatsStreamingFlags(clusterStartCmd.Flags())
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
