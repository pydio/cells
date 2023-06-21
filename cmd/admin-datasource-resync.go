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

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service/context/metadata"
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
		syncService := "pydio.grpc.data.sync." + resyncDsName

		cli := sync.NewSyncEndpointClient(grpc.GetClientConnFromCtx(cmd.Context(), syncService, longGrpcCallTimeout()))
		c := metadata.WithUserNameMetadata(context.Background(), common.PydioSystemUsername)
		resp, err := cli.TriggerResync(c, &sync.ResyncRequest{Path: "/"})
		if err != nil {
			cmd.Println("Resync Failed: " + err.Error())
			return
		}
		cmd.Println("Resync Triggered.")
		if resp.JsonDiff != "" {
			cmd.Println("Result: " + resp.JsonDiff)
			cmd.Println(promptui.IconWarn + " If result contains newly created files, you should now launch '" + os.Args[0] + " admin datasource rehash' command.")
		}
	},
}

func init() {
	dsResyncCmd.PersistentFlags().StringVarP(&resyncDsName, "datasource", "d", "", "Name of datasource to resynchronize")
	DataSourceCmd.AddCommand(dsResyncCmd)
}
