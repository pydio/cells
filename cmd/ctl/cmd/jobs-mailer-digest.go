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
	"log"

	uuid2 "github.com/pborman/uuid"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
)

var jobsMailerDigestCmd = &cobra.Command{
	Use:   "mailer-digest",
	Short: "Creates and sends a job to the mail digest service job runner",
	Run:   newMailerDigestJob,
}

var (
	mdgUser    []string
	mdgDryRun  bool
	mdgDryMail string
)

func newMailerDigestJob(cmd *cobra.Command, args []string) {

	if len(mdgUser) == 0 {
		cmd.Help()
		return
	}

	bools := map[bool]string{
		true:  "true",
		false: "false",
	}

	jobClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
	job := &jobs.Job{
		Label: "Send Mail",
		Owner: common.PYDIO_SYSTEM_USERNAME,
		ID:    uuid2.NewUUID().String(),
		Actions: []*jobs.Action{
			{
				UsersSelector: &jobs.UsersSelector{
					Users: []*idm.User{},
				},
				ID: "broker.activity.actions.mail-digest",
				Parameters: map[string]string{
					"dryRun":  bools[mdgDryRun],
					"dryMail": mdgDryMail,
				},
			},
		},
		AutoStart:      true,
		MaxConcurrency: 1,
	}

	for i := 0; i < len(mdgUser); i++ {
		if mdgUser[i] == "*" {
			job.Actions[0].UsersSelector.All = true
			job.Actions[0].UsersSelector.Users = nil
			break
		}

		job.Actions[0].UsersSelector.Users = append(job.Actions[0].UsersSelector.Users,
			&idm.User{
				Login: mdgUser[i],
			},
		)
	}

	_, err := jobClient.PutJob(context.Background(), &jobs.PutJobRequest{
		Job: job,
	})
	if err != nil {
		log.Fatalln("error", err.Error())
	}
}

func init() {
	jobsMailerDigestCmd.PersistentFlags().StringSliceVar(&mdgUser, "users", []string{}, "users")
	jobsMailerDigestCmd.PersistentFlags().BoolVar(&mdgDryRun, "drun", false, "Dry run")
	jobsMailerDigestCmd.PersistentFlags().StringVar(&mdgDryMail, "dmail", "", "Dry mail")

	jobsCmd.AddCommand(jobsMailerDigestCmd)
}
