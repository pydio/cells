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
	resyncDsName string
)

var dsResyncCmd = &cobra.Command{
	Use:   "resync",
	Short: "Trigger resync for a structured datasource",
	Long: `
DESCRIPTION

  Trigger the re-indexation of a datasource. This is only applicable to structured datasource.

EXAMPLES

  To trigger the re-indexation of "pydiods1" datasource, target the "sync" service associated to the datasource: 

  $ ` + os.Args[0] + ` admin datasource resync --datasource=pydiods1

`,
	Run: func(cmd *cobra.Command, args []string) {
		if resyncDsName == "" {
			cmd.Println("Please provide a datasource name (--datasource)")
			cmd.Help()
			return
		}
		syncService = "pydio.grpc.data.sync." + resyncDsName

		cli := sync.NewSyncEndpointClient(syncService, defaults.NewClient())
		c, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
		defer cancel()
		c = context2.WithUserNameMetadata(c, common.PydioSystemUsername)
		resp, err := cli.TriggerResync(c, &sync.ResyncRequest{Path: "/"}, client.WithRetries(1))
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
	dsResyncCmd.PersistentFlags().StringVarP(&syncDsName, "datasource", "d", "", "Name of datasource to resynchronize")
	DataSourceCmd.AddCommand(dsResyncCmd)
}
