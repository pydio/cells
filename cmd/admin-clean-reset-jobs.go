/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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
	"strconv"

	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/scheduler/lang"
)

var ResetJobCmd = &cobra.Command{
	Use:   "reset-jobs",
	Short: "Reset a job to its default",
	Long: `
DESCRIPTION

Display a list of all automatically inserted jobs and choose one to reset it to its factory default settings. 
	
This feature can be useful when a job requires an upgrade.
Please ensure that the server is running. 

EXAMPLE

  $ ` + os.Args[0] + ` admin clean reset-jobs

  +----+----------------------+--------------------------------+
  | #  |       SERVICE        |             LABEL              |
  +----+----------------------+--------------------------------+
  |  1 | pydio.grpc.jobs      | Extract image thumbnails and   |
  |    |                      | Exif data                      |
  |  2 | pydio.grpc.jobs      | Clean jobs and tasks in        |
  |    |                      | scheduler                      |
  |  3 | pydio.grpc.jobs      | Clean or transfer user data on |
  |    |                      | deletion                       |
  |  4 | pydio.grpc.jobs      | Clean orphan files after 24h   |
  |  5 | pydio.grpc.jobs      | Clean expired ACLs after 10    |
  |    |                      | days                           |
  |  6 | pydio.grpc.versions  | Event Based Job for            |
  |    |                      | replicating data for           |
  |    |                      | versioning                     |
  |  7 | pydio.grpc.activity  | Users activities digest        |
  |  8 | pydio.grpc.mailer    | Flush Mails Queue              |
  |  9 | pydio.grpc.oauth     | Prune revoked tokens and       |
  |    |                      | expired reset password keys    |
  +----+----------------------+--------------------------------+

  Select a job number to reset it in the scheduler: 9

 `,
	RunE: func(cmd *cobra.Command, args []string) error {
		// Load default Translation package
		T := lang.Bundle().T("en-us")

		dd := jobs.ListDefaults()
		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"#", "Service", "Label"})
		for i, d := range dd {
			table.Append([]string{
				fmt.Sprintf("%d", i+1),
				d.ServiceName,
				T(d.Job.Label),
			})
		}
		table.Render()
		prompt := &promptui.Prompt{
			Label:     "Select a job number to reset it in the scheduler",
			AllowEdit: true,
			Validate: func(s string) error {
				if s == "" {
					return fmt.Errorf("use a number between 1 and %d", len(dd))
				} else if in, e := strconv.ParseInt(s, 10, 32); e != nil {
					return e
				} else if in < 1 || in > int64(len(dd)) {
					return fmt.Errorf("use a number between 1 and %d", len(dd))
				}
				return nil
			},
		}
		sel, er := prompt.Run()
		if er != nil {
			return er
		}
		in, _ := strconv.ParseInt(sel, 10, 32)
		job := dd[in-1]
		confirm := &promptui.Prompt{Label: "You are about to reset '" + T(job.Label) + "'. Are you sure you want to continue", IsConfirm: true, Default: "y"}
		if _, er := confirm.Run(); er != nil {
			return er
		}

		if _, er = jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: job.Job}); er != nil {
			fmt.Println(promptui.IconBad + " Error while inserting job " + er.Error())
		} else {
			msg := " Job was successfully reset"
			if job.Inactive {
				msg += " (if it was previously enabled, beware that it has been reset to its disabled status)"
			}
			fmt.Println(promptui.IconGood + msg)
		}
		return nil
	},
}

func init() {
	CleanCmd.AddCommand(ResetJobCmd)
}
