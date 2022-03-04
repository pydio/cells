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

package cmd

import (
	"github.com/pydio/cells/v4/common/runtime"
	"time"

	"github.com/spf13/cobra"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/registry"
)

var (
	debugServices []string
	debugReset    bool
	debugEnable   bool
)

// serviceStopCmd represents the stop command
var serviceLevelCmd = &cobra.Command{
	Use:   "level",
	Short: "Update log level for a given service",
	Long: `
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		ctx := cmd.Context()
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		// Create a main client connection
		conn, err := grpc.Dial("cells:///", grpc.WithInsecure(), grpc.WithResolvers(clientgrpc.NewBuilder(reg)))
		if err != nil {
			return err
		}

		ctx = clientcontext.WithClientConn(ctx, conn)
		broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))

		event := &log.LogLevelEvent{
			ResetInfo:  debugReset,
			LevelDebug: debugEnable,
			Services:   debugServices,
		}
		broker.Publish(ctx, common.TopicLogLevelEvent, event)
		<-time.After(100 * time.Millisecond)
		cmd.Println("Sent event to broker")

		return nil

	},
}

func init() {
	serviceLevelCmd.Flags().BoolVarP(&debugReset, "reset", "r", false, "Reset all registered values")
	serviceLevelCmd.Flags().BoolVarP(&debugEnable, "enable", "e", true, "Switch debug mode on for specified services (default)")
	serviceLevelCmd.Flags().StringSliceVarP(&debugServices, "services", "s", []string{}, "Set specific services in debug mode. Use RegExp or the 'empty' key for logs without context")
	addExternalCmdRegistryFlags(serviceLevelCmd.Flags())

	serviceCmd.AddCommand(serviceLevelCmd)
}
