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
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	snapshotDsName    string
	snapshotOperation string
	snapshotBasename  string
	snapshotNI        bool
)

var dsSnaphsotCmd = &cobra.Command{
	Use:   "snapshot",
	Short: "Dump/Load snapshot of the index for a flat datasource",
	Long: `
DESCRIPTION

  For flat format datasources, files are stored horizontally with UUID as their names inside the storage. 
  The associated tree structure (files and folders) is maintained in the Cells database only.
  For backup/restore operations, it can be useful to regularly dump a snapshot of this tree structure inside a 
  particular file inside the storage, which can be later used  to reload data on a clean installation.

  This command allows to dump/load the index on-file.

EXAMPLES

  1. Dump database index inside a snapshot.db file inside the datasource storage:
  $ ` + os.Args[0] + ` admin datasource snapshot --datasource=pydiods1 --operation=dump --basename=snapshot.db

  2. Reload database index from a snapshot.db file located inside the datasource storage:
  $ ` + os.Args[0] + ` admin datasource snapshot --datasource=pydiods1 --operation=load --basename=snapshot.db

  3. Remove a known snapshot.db file from datasource storage:
  $ ` + os.Args[0] + ` admin datasource snapshot --datasource=pydiods1 --operation=delete --basename=snapshot.db

`,
	Run: func(cmd *cobra.Command, args []string) {
		if snapshotDsName == "" {
			cmd.Println("Please provide a datasource name (--datasource)")
			cmd.Help()
			return
		}
		if snapshotBasename == "" {
			cmd.Println("Please provide a snapshot basename (--basename)")
			cmd.Help()
			return
		}
		if snapshotOperation != "dump" && snapshotOperation != "load" && snapshotOperation != "delete" {
			cmd.Println("Please provide the operation as one of 'dump', 'load' or 'delete'.")
			cmd.Help()
			return
		}
		syncService := common.ServiceDataSyncGRPC_ + snapshotDsName

		cli := sync.NewSyncEndpointClient(grpc.ResolveConn(ctx, syncService, longGrpcCallTimeout()))
		c := propagator.WithUserNameMetadata(context.Background(), common.PydioContextUserKey, common.PydioSystemUsername)
		req := &sync.ResyncRequest{}
		if snapshotOperation == "delete" {
			req.Path = "delete/" + snapshotBasename
			cmd.Println("Removing snapshot " + snapshotBasename + " from storage")
			if !snapshotNI {
				conf := promptui.Prompt{Label: "This is undoable, are you sure you want to do that", IsConfirm: true, Default: "N"}
				_, e := conf.Run()
				if e != nil {
					cmd.Println("Aborting operation")
					return
				}
			}
		} else if snapshotOperation == "dump" {
			req.Path = "write/" + snapshotBasename
			cmd.Printf("Trigger snapshot generation for %s inside %s\n", snapshotDsName, snapshotBasename)
		} else {
			req.Path = "read/" + snapshotBasename
			cmd.Printf("Read snapshot %s and populate index for datasource %s\n", snapshotBasename, snapshotDsName)
			if !snapshotNI {
				conf := promptui.Prompt{Label: "DANGER : this will override the current content of this datasource index. Are you sure you want to do that", IsConfirm: true, Default: "N"}
				_, e := conf.Run()
				if e != nil {
					cmd.Println("Aborting operation")
					return
				}
			}
		}
		resp, err := cli.TriggerResync(c, req /*, client.WithRetries(1)*/)
		if err != nil {
			cmd.Println("Command failed: " + err.Error())
			return
		}
		cmd.Println("Command sent.")
		if resp.JsonDiff != "" {
			cmd.Println("Result: " + resp.JsonDiff)
		}
	},
}

func init() {
	dsSnaphsotCmd.PersistentFlags().StringVarP(&snapshotDsName, "datasource", "d", "", "Name of datasource to resynchronize")
	dsSnaphsotCmd.PersistentFlags().StringVarP(&snapshotOperation, "operation", "o", "dump", "One of [dump|load|delete] to either dump index, reload an existing snapshot, or remove a snapshot")
	dsSnaphsotCmd.PersistentFlags().StringVarP(&snapshotBasename, "basename", "b", "snapshot.db", "Basename of the snapshot file inside the datasource storage bucket")
	dsSnaphsotCmd.PersistentFlags().BoolVarP(&snapshotNI, "force", "f", false, "Force operation, skip confirmation prompts")
	DataSourceCmd.AddCommand(dsSnaphsotCmd)
}
