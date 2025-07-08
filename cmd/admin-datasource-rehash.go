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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/uuid"
	grpc_jobs "github.com/pydio/cells/v5/scheduler/jobs/grpc"
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
	Short: "Recompute all files hashes inside a given datasource",
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

		params := map[string]string{
			"hashType": "cells",
			"metaName": common.MetaNamespaceHash,
		}
		if rehashForceRecompute {
			params["forceRecompute"] = "true"
		}
		ap, _ := anypb.New(&tree.Query{
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{path.Join(rehashDsName, rehashPath)},
		})

		dsq, _ := anypb.New(&object.DataSourceSingleQuery{
			Name: rehashDsName,
		})

		ctx := cmd.Context()
		jobClient := jobsc.JobServiceClient(ctx)
		job := &jobs.Job{
			ID:             uuid.New(),
			Owner:          rehashUserName,
			Label:          "Recompute Cells Hash on all files in " + rehashDsName,
			AutoStart:      true,
			AutoClean:      true,
			MaxConcurrency: int32(rehashMaxConcurrency),
			Actions: []*jobs.Action{
				{
					ID:         "actions.tree.cells-hash",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						Query: &service.Query{
							SubQueries: []*anypb.Any{ap},
							Operation:  service.OperationType_AND,
						},
						Label: "Files selection",
					},
				},
			},
			MergeAction: &jobs.Action{
				ID: "actions.test.fake",
				Parameters: map[string]string{
					"timer":  "1",
					"ticker": "1",
				},
				ChainedActions: []*jobs.Action{
					{
						ID:    "actions.tree.ds-attribute",
						Label: "Set DS Hashing",
						DataSourceSelector: &jobs.DataSourceSelector{
							Query: &service.Query{
								SubQueries: []*anypb.Any{dsq},
							},
							Collect: true,
						},
						Parameters: map[string]string{
							"attName":  object.StorageKeyHashingVersion,
							"attValue": object.CurrentHashingVersion,
						},
					},
				},
			},
			Timeout: rehashTimeout,
		}

		if _, err := jobClient.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
			cmd.Println(promptui.IconBad + " [ERROR] " + err.Error())
		} else {
			cmd.Println(promptui.IconGood + " [SUCCESS] Posted job for recomputing hashes on all files. You can monitor the job in the scheduler.")
			cmd.Println(promptui.IconGood + " [SUCCESS] Datasource hashing_version will be updated if necessary, you may restart the server if value is changed.")
			structDsJob := grpc_jobs.BuildDataSourceSyncJob(rehashDsName, false, false)
			if existing, er := jobClient.GetJob(ctx, &jobs.GetJobRequest{JobID: structDsJob.ID}); er == nil && existing.GetJob().CreatedAt <= 1672527660 {
				if _, e := jobClient.PutJob(ctx, &jobs.PutJobRequest{Job: structDsJob}); e == nil {
					cmd.Println(promptui.IconGood + " [SUCCESS] Datasource re-indexing job was updated to compute hashes on newly detected files after each indexation.")
				} else {
					cmd.Println(promptui.IconWarn + " [WARN] Cannot update datasource re-indexing job (to compute hashes on newly detected files after each indexation): " + e.Error())
				}
			}
		}

	},
}

func init() {
	dsRehashCmd.PersistentFlags().StringVarP(&rehashDsName, "datasource", "d", "pydiods1", "Name of datasource to process")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashUserName, "username", "u", "", "Username under which the job will be executed (generally admin)")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashPath, "path", "p", "", "Restrict operation to a specific folder")
	dsRehashCmd.PersistentFlags().StringVarP(&rehashTimeout, "timeout", "t", "30m", "Maximum job duration")
	dsRehashCmd.PersistentFlags().IntVarP(&rehashMaxConcurrency, "concurrency", "c", 10, "Maximum concurrency for computing files hashes")
	dsRehashCmd.PersistentFlags().BoolVarP(&rehashForceRecompute, "force", "f", false, "Force recomputing hash if it already exists")
	DataSourceCmd.AddCommand(dsRehashCmd)
}
