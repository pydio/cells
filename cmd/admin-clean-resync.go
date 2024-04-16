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
	"context"
	"os"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

var (
	syncService string
	syncPath    string
)

var dataSyncCmd = &cobra.Command{
	Use:   "resync",
	Short: "And a TriggerResync gRPC command to a service",
	Long: `
DESCRIPTION

  TriggerResync is a generic gRPC endpoint that can be implemented by various services to perform internal
  clean-up or resynchronization.

  This can be currently used for datasources (see 'admin datasource' commands), search engine, logs (for truncating).
  The "path" can be used by some services to read additional parameters.

EXAMPLES

  To trigger the re-indexation of "pydiods1" datasource, target the "sync" service associated to the datasource : 

  1. Equivalent to "admin datasource resync" command:
  $ ` + os.Args[0] + ` clean admin resync --service=pydio.grpc.data.sync.pydiods1 

  2. Re-index search engine:
  $ ` + os.Args[0] + ` clean admin resync -s pydio.grpc.search

  3. Truncate logs to a given size (in bytes):
  $ ` + os.Args[0] + ` clean admin resync --service=pydio.grpc.logs --path=TRUNCATE/200000
`,
	Run: func(cmd *cobra.Command, args []string) {
		if syncService == "" {
			cmd.Println("Please provide at least a datasource name or a service name!")
			cmd.Help()
			return
		}
		cli := sync.NewSyncEndpointClient(grpc.ResolveConn(cmd.Context(), syncService, longGrpcCallTimeout()))
		c := metadata.WithUserNameMetadata(context.Background(), common.PydioSystemUsername)
		resp, err := cli.TriggerResync(c, &sync.ResyncRequest{Path: syncPath})
		if err != nil {
			cmd.Println("Resync Failed: " + err.Error())
			return
		}
		cmd.Println("Resync Triggered.")
		if resp.JsonDiff != "" {
			cmd.Println("Result: " + resp.JsonDiff)
		}
	},
}

func init() {
	dataSyncCmd.PersistentFlags().StringVarP(&syncService, "service", "s", "", "If no datasource name is passed, use the complete service name to resync")
	dataSyncCmd.PersistentFlags().StringVarP(&syncPath, "path", "p", "/", "Can be used by some services to read additional parameters")
	CleanCmd.AddCommand(dataSyncCmd)
	// Backward compat
	dsCmd2 := *dataSyncCmd
	dsCmd2.Hidden = true
	AdminCmd.AddCommand(&dsCmd2)
}
