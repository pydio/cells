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
	"os"
	"path"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	rehashDsName         string
	rehashPath           string
	rehashUserName       string
	rehashMaxConcurrency int
	rehashForceRecompute bool
	rehashTimeout        string
)

var dsRehashCmd = &cobra.Command{
	Use:   "rehash",
	Short: "Trigger rehash for a structured datasource",
	Long: `
DESCRIPTION

  Look up for files where x-cells-hash is missing and recompute them. This operation is launched in scheduler and can take
  some time (and CPU).

EXAMPLES

  1. To trigger the rehashing of "pydiods1" datasource:
  $ ` + os.Args[0] + ` admin datasource rehash --datasource=pydiods1

  2. Process only the folder/subfolder data :
  $ ` + os.Args[0] + ` admin datasource rehash --datasource=pydiods1 --path=folder/subfolder

`,
	Run: func(cmd *cobra.Command, args []string) {
		if rehashDsName == "" || rehashUserName == "" {
			cmd.Println("Please provide at least a datasource name (--datasource) and an admin user name")
			cmd.Help()
			return
		}

		params := map[string]string{}
		if rehashForceRecompute {
			params["forceRecompute"] = "true"
		}
		ap, _ := anypb.New(&tree.Query{
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{path.Join(rehashDsName, rehashPath)},
		})

		jobClient := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceJobs))
		job := &jobs.Job{
			ID:             uuid.New(),
			Owner:          rehashUserName,
			Label:          "Recompute Cells Hash",
			AutoStart:      true,
			AutoClean:      true,
			MaxConcurrency: int32(rehashMaxConcurrency),
			Actions: []*jobs.Action{
				{
					ID:         "actions.tree.cells-hash",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						Query: &service.Query{SubQueries: []*anypb.Any{ap}},
						Label: "Files selection",
					},
				},
			},
			Timeout: "30m",
		}

		if _, err := jobClient.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
			cmd.Println(promptui.IconBad + " [ERROR] " + err.Error())
		} else {
			cmd.Println(promptui.IconGood + " [SUCCESS] Posted job for recomputing hashes on all files")
		}

	},
}

func init() {
	dsRehashCmd.PersistentFlags().StringVarP(&rehashDsName, "datasource", "d", "pydiods1", "Name of datasource to process")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashUserName, "username", "u", "", "Username under which the job will be executed (generally admin)")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashPath, "path", "p", "", "Restrict operation to a specific folder")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashTimeout, "timeout", "t", "30m", "Maximum job duration")
	dsRehashCmd.PersistentFlags().IntVarP(&rehashMaxConcurrency, "concurrency", "c", 10, "Maximum concurrency for computing files hashes")
	dsRehashCmd.PersistentFlags().BoolVarP(&rehashForceRecompute, "force", "f", false, "Force recomputing hash if it does not already exists")
	DataSourceCmd.AddCommand(dsRehashCmd)
}
