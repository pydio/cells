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
	"fmt"
	"os"
	"strings"

	humanize "github.com/dustin/go-humanize"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	cleanLogsService string
	cleanLogsSize    string
)

var cleanLogsCmd = &cobra.Command{
	Use:   "logs",
	Short: "Truncate log indexes to a given size",
	Long: `
DESCRIPTION

  Appart from rotated log files, logs are indexed inside an on-file database for high-performance analysis and search. 
  These indexes are rotated (50MB size by default) and you can use this command to remove the oldest index files. 
  The most recent index will always be kept.
  Specify the size threshold using bytes unit: 50MB, 5mb, 1GB, etc...

EXAMPLES

  Truncate log indexes to 50MB : 

  $ ` + os.Args[0] + ` admin clean logs --service=log --threshold=50MB

`,
	Run: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()

		if cleanLogsSize == "" {
			cmd.Println("Please provide a threshold size")
			cmd.Help()
			return
		}
		// Replace MB with MiB ..
		cleanLogsSize = strings.ReplaceAll(cleanLogsSize, "B", "iB")
		b, e := humanize.ParseBytes(cleanLogsSize)
		if e != nil {
			cmd.Println("Cannot parse threshold size: " + e.Error())
			cmd.Help()
			return
		}

		syncService := common.ServiceGrpcNamespace_ + cleanLogsService
		byteSize := fmt.Sprintf("%d", b)

		cmd.Printf("Sending resync command to service %s with parameter TRUNCATE/%s\n", syncService, byteSize)

		cli := sync.NewSyncEndpointClient(grpc.ResolveConn(ctx, cleanLogsService, longGrpcCallTimeout()))
		c := propagator.WithUserNameMetadata(cmd.Context(), common.PydioContextUserKey, common.PydioSystemUsername)
		resp, err := cli.TriggerResync(c, &sync.ResyncRequest{Path: "TRUNCATE/" + byteSize} /*, client.WithRetries(1)*/)
		if err != nil {
			cmd.Println("Truncate Failed: " + err.Error())
			return
		}
		cmd.Println("Truncate Triggered.")
		if resp.JsonDiff != "" {
			cmd.Println("Result: " + resp.JsonDiff)
		}
	},
}

func init() {
	cleanLogsCmd.PersistentFlags().StringVarP(&cleanLogsService, "service", "s", "log", "Log service to truncate (use log by default)")
	cleanLogsCmd.PersistentFlags().StringVarP(&cleanLogsSize, "threshold", "t", "", "Size of logs to keep, specify in bytes (e.g 50MB, 1GB, ...)")
	CleanCmd.AddCommand(cleanLogsCmd)
}
