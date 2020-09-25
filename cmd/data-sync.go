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
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/sync"
	context2 "github.com/pydio/cells/common/utils/context"
)

const exampleDataSync = `For example, to trigger the re-indexation of "pydiods1" datasource, target the "sync" service associated to the datasource : 

1) by name:
	./cells data sync --datasource=pydiods1

2) by service name:
	./cells data sync --service=pydio.grpc.data.sync.pydiods1 

Else to refresh the search engine entirely:
	./cells data sync --service=pydio.grpc.search --path=/`

var (
	syncDsName  string
	syncService string
	syncPath    string
)

var dataSyncCmd = &cobra.Command{
	Use:   "sync",
	Short: "Trigger index resync",
	Long: `
Trigger a re-indexation of a given service. 
This can be currently used for datasource indexes and search engine.`,
	Example: exampleDataSync,
	Run: func(cmd *cobra.Command, args []string) {
		if syncDsName != "" {
			syncService = "pydio.grpc.data.sync." + syncDsName
		} else if syncService == "" {
			cmd.Println("Please provide at least a datasource name or a service name!")
			cmd.Help()
			return
		}
		client := sync.NewSyncEndpointClient(syncService, defaults.NewClient())
		c, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
		defer cancel()
		c = context2.WithUserNameMetadata(c, common.PYDIO_SYSTEM_USERNAME)
		resp, err := client.TriggerResync(c, &sync.ResyncRequest{Path: syncPath})
		if err != nil {
			cmd.Println("Resync Failed: " + err.Error())
			return
		}
		cmd.Println("Resync Triggered.\nResult: " + resp.JsonDiff)
	},
}

func init() {
	dataSyncCmd.PersistentFlags().StringVar(&syncDsName, "datasource", "", "Name of datasource to resync")
	dataSyncCmd.PersistentFlags().StringVar(&syncService, "service", "", "If no datasource name is passed, use the complete service name to resync")
	dataSyncCmd.PersistentFlags().StringVar(&syncPath, "path", "/", "Path to resync")
	DataCmd.AddCommand(dataSyncCmd)
}
