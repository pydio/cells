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
	"github.com/spf13/cobra"
)

// dataCmd represents the data command
var JobsCmd = &cobra.Command{
	Use:   "jobs",
	Short: "Manage scheduler Jobs",
	Long: `Manage scheduler Jobs

Scheduler is composed of three micro-services : jobs, tasks, and timers.
Jobs is storing all jobs configurations and their running tasks statuses.
Tasks is actually running the jobs, and can be scaled horizontally on many machines.
Timer is used to trigger jobs at a given schedule (like a crontab).
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(JobsCmd)
}
