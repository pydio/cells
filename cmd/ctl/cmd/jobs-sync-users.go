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

	uuid2 "github.com/pborman/uuid"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/micro"
)

// metaCmd represents the meta command
var jobsSyncUsersCmd = &cobra.Command{
	Use:   "sync-users",
	Short: "Trigger a sync between LDAP and internal directory",
	Long:  `Uses default configs for the moment`,
	Run:   newJob,
}

func newJob(cmd *cobra.Command, args []string) {
	jobClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
	jobClient.PutJob(context.Background(), &jobs.PutJobRequest{
		Job: &jobs.Job{
			Label: "Sync Users DB",
			Owner: common.PYDIO_SYSTEM_USERNAME,
			ID:    uuid2.NewUUID().String(),
			Actions: []*jobs.Action{{
				ID:         "actions.auth.sync-users",
				Parameters: make(map[string]string),
			}},
			AutoStart: true,
			// HasProgress:    true,
			MaxConcurrency: 1,
			// Stoppable:      true,
		},
	})
}

func init() {
	jobsCmd.AddCommand(jobsSyncUsersCmd)
}
