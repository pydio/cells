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
	"fmt"
	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/registry"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"time"
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

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		// Making sure we capture the signals
		handleSignals()

		skipUpgrade = true

		initConfig()

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		// starting the microservice
		services := []string{
			common.ServiceStorageNamespace_+common.ServiceConfig,
			common.ServiceGrpcNamespace_+common.ServiceRegistry,
			common.ServiceGrpcNamespace_+common.ServiceBroker,
		}

		plugins.Init(ctx, "cluster")

		for _, name := range services {
			micro := registry.Default.GetServiceByName(name)
			micro.Start(ctx)
		}

		select {
		case <-ctx.Done():
			return nil
		}

		return nil
	},
	PostRunE: func(cmd *cobra.Command, args []string) error {
		reg := registry.GetCurrentProcess()
		if reg == nil {
			return nil
		}

	loop:
		for {
			select {
			case <-time.After(30 * time.Second):
				break loop
			default:
				if reg != nil && len(reg.Services) > 0 {
					time.Sleep(1 * time.Second)
					continue
				}

				break loop
			}
		}

		time.Sleep(10 * time.Second)

		return nil
	},
}

func init() {
	ClusterCmd.AddCommand(clusterStartCmd)
	addNatsFlags(clusterStartCmd.Flags())
	addNatsStreamingFlags(clusterStartCmd.Flags())
	addRegistryFlags(clusterStartCmd.Flags())
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
