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

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	rethumbDsName         string
	rethumbUserName       string
	rethumbMaxConcurrency int
	rethumbTimeout        string
)

var dsRethumbCmd = &cobra.Command{
	Use:   "rethumb",
	Short: "Find and compute missing thumbnails for images",
	Long: `
DESCRIPTION

  Look up for files where x-cells-hash is missing and recompute them. This operation is launched in scheduler and can take
  some time (and CPU).

EXAMPLES

  1. To trigger the rethumbing of "pydiods1" datasource:
  $ ` + os.Args[0] + ` admin datasource rethumb --datasource=pydiods1

  2. Process only the folder/subfolder data :
  $ ` + os.Args[0] + ` admin datasource rethumb --datasource=pydiods1 --path=folder/subfolder

`,
	Run: func(cmd *cobra.Command, args []string) {
		if rethumbDsName == "" || rethumbUserName == "" {
			cmd.Println("Please provide at least a datasource name (--datasource) and an admin user name")
			cmd.Help()
			return
		}

		ap, _ := anypb.New(&tree.Query{
			MinSize:    1,
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{rethumbDsName},
			FreeString: "-Meta.is_image:T* Extension:jpg Extension:jpeg  Extension:png Extension:bmp",
		})
		ctx := cmd.Context()
		jobClient := jobsc.JobServiceClient(ctx)
		job := &jobs.Job{
			ID:             uuid.New(),
			Owner:          rethumbUserName,
			Label:          "Find and recompute missing thumbnails in " + rethumbDsName,
			AutoStart:      true,
			AutoClean:      true,
			MaxConcurrency: int32(rethumbMaxConcurrency),
			Actions: []*jobs.Action{
				{
					ID:         "actions.images.thumbnails",
					Parameters: map[string]string{},
					NodesSelector: &jobs.NodesSelector{
						Query: &service.Query{
							SubQueries: []*anypb.Any{ap},
							Operation:  service.OperationType_AND,
						},
						Label: "Images w/o 'is_image' metadata",
					},
				},
			},
			Timeout: rethumbTimeout,
		}

		if _, err := jobClient.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
			cmd.Println(promptui.IconBad + " [ERROR] " + err.Error())
		} else {
			cmd.Println(promptui.IconGood + " [SUCCESS] Posted job for recomputing hashes on all files")
		}

	},
}

func init() {
	dsRethumbCmd.PersistentFlags().StringVarP(&rethumbDsName, "datasource", "d", "pydiods1", "Name of datasource to process")
	dsRethumbCmd.PersistentFlags().StringVarP(&rethumbUserName, "username", "u", "", "Username under which the job will be executed (generally admin)")
	dsRethumbCmd.PersistentFlags().StringVarP(&rethumbTimeout, "timeout", "t", "30m", "Maximum job duration")
	dsRethumbCmd.PersistentFlags().IntVarP(&rethumbMaxConcurrency, "concurrency", "c", 10, "Maximum concurrency for computing files hashes")
	DataSourceCmd.AddCommand(dsRethumbCmd)
}
