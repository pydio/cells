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
	"time"

	"github.com/micro/go-micro/client"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/sync"
	context2 "github.com/pydio/cells/common/utils/context"
)

var (
	syncDsName  string
	syncService string
	syncPath    string
)

var dataSyncCmd = &cobra.Command{
	Use:   "resync",
	Short: "Trigger a service resync",
	Long: `
DESCRIPTION

  Trigger the re-indexation of a service. 
  This can be currently used for datasource indexes (see 'admin datasource' commands) and search engine.

EXAMPLES

  To trigger the re-indexation of "pydiods1" datasource, target the "sync" service associated to the datasource : 

  1. By datasource name:
  $ ` + os.Args[0] + ` admin resync --datasource=pydiods1

  2. By service name:
  $ ` + os.Args[0] + ` admin resync --service=pydio.grpc.data.sync.pydiods1 

  3. Re-index search engine:
  $ ` + os.Args[0] + ` admin resync --service=pydio.grpc.search --path=/
`,
	Run: func(cmd *cobra.Command, args []string) {
		if syncDsName != "" {
			syncService = "pydio.grpc.data.sync." + syncDsName
		} else if syncService == "" {
			cmd.Println("Please provide at least a datasource name or a service name!")
			cmd.Help()
			return
		}
		cli := sync.NewSyncEndpointClient(syncService, defaults.NewClient())
		c, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
		defer cancel()
		c = context2.WithUserNameMetadata(c, common.PydioSystemUsername)
		resp, err := cli.TriggerResync(c, &sync.ResyncRequest{Path: syncPath}, client.WithRetries(1))
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
	dataSyncCmd.PersistentFlags().StringVar(&syncDsName, "datasource", "", "Name of datasource to resync")
	dataSyncCmd.PersistentFlags().StringVar(&syncService, "service", "", "If no datasource name is passed, use the complete service name to resync")
	dataSyncCmd.PersistentFlags().StringVar(&syncPath, "path", "/", "Path to resync")
	AdminCmd.AddCommand(dataSyncCmd)
}
